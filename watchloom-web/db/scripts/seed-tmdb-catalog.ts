import "dotenv/config";

import { db, pool } from "../../src/db";
import {
  genres,
  movieGenres,
  moviePeople,
  movies,
  people,
  series,
  seriesGenres,
  seriesPeople,
} from "../../src/db/schema";

type TmdbGenre = { name?: string };
type TmdbPerson = { name?: string };
type TmdbCredits = {
  cast?: TmdbPerson[];
  crew?: Array<TmdbPerson & { job?: string; department?: string }>;
};
type TmdbMovie = {
  id?: number;
  title?: string;
  overview?: string | null;
  release_date?: string;
  runtime?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: TmdbGenre[];
};
type TmdbSeries = {
  id?: number;
  name?: string;
  overview?: string | null;
  first_air_date?: string;
  status?: string | null;
  networks?: Array<{ name?: string }>;
  production_companies?: Array<{ name?: string }>;
  created_by?: TmdbPerson[];
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: TmdbGenre[];
};
type TmdbPage = { results?: Array<{ id?: number }> };
type Role = "actor" | "creator" | "director" | "writer";
type PersonRole = { name: string; role: Role };
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const apiToken = process.env.TMDB_API_TOKEN || process.env.TMDB_API_READ_ACCESS_TOKEN;
const apiKey = process.env.TMDB_API_KEY;
const apiBaseUrl = process.env.TMDB_API_BASE_URL ?? "https://api.themoviedb.org/3";
const imageBaseUrl = process.env.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p/w500";
const dryRun = process.env.DRY_RUN === "true";
const skipMovies = process.env.SKIP_MOVIES === "true";
const skipSeries = process.env.SKIP_SERIES === "true";
const requestDelayMs = 100;

function positiveInteger(name: string, fallback: number) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a non-negative integer`);
  return value;
}

const movieLimit = positiveInteger("LIMIT_MOVIES", 1000);
const seriesLimit = positiveInteger("LIMIT_SERIES", 1000);
const pageLimit = positiveInteger("PAGE_LIMIT", 50);
const startPageMovies = positiveInteger("START_PAGE_MOVIES", 1);
const startPageSeries = positiveInteger("START_PAGE_SERIES", 1);
const discoverYearFrom = positiveInteger("DISCOVER_YEAR_FROM", 0);
const discoverYearTo = positiveInteger("DISCOVER_YEAR_TO", 0);
const summary = {
  moviesInserted: 0, movieDuplicates: 0, movieFailures: 0,
  seriesInserted: 0, seriesDuplicates: 0, seriesFailures: 0,
  genresInserted: 0, genresReused: 0, peopleInserted: 0, peopleReused: 0,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value?: string | null) => value?.trim() || null;
const date = (value?: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
const year = (value?: string) => date(value) ? Number(value!.slice(0, 4)) : null;
const slugify = (value: string) => value.toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const imageUrl = (path?: string | null) => path
  ? `${imageBaseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
  : null;
const names = (items: TmdbPerson[] = [], limit = 5) =>
  [...new Set(items.map((item) => clean(item.name)).filter((name): name is string => Boolean(name)))].slice(0, limit);
const uniqueRoles = (items: PersonRole[]) => [...new Map(items.map((item) => [`${item.role}:${slugify(item.name)}`, item])).values()];
const titleYearKey = (title: string, releaseYear: number | null) => `${title.toLowerCase().trim()}:${releaseYear ?? ""}`;

async function tmdbFetch<T>(path: string, params: Record<string, string | number> = {}, attempt = 1, useApiKey = false): Promise<T> {
  const canUseBearerToken = Boolean(apiToken) && !useApiKey;
  if (!canUseBearerToken && !apiKey) throw new Error("TMDB_API_TOKEN is not set");
  const url = new URL(`${apiBaseUrl.replace(/\/+$/, "")}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  if (!canUseBearerToken && apiKey) url.searchParams.set("api_key", apiKey);
  await sleep(requestDelayMs);
  let response: Response;
  try {
    response = await fetch(url, { headers: canUseBearerToken
      ? { accept: "application/json", authorization: `Bearer ${apiToken}` }
      : { accept: "application/json" } });
  } catch (error) {
    if (attempt < 4) {
      await sleep(500 * attempt);
      return tmdbFetch<T>(path, params, attempt + 1, useApiKey);
    }
    throw error;
  }
  if (response.status === 401 && canUseBearerToken && apiKey) return tmdbFetch<T>(path, params, attempt, true);
  if ((response.status === 429 || response.status >= 500) && attempt < 4) {
    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * attempt);
    return tmdbFetch<T>(path, params, attempt + 1, useApiKey);
  }
  if (!response.ok) throw new Error(`TMDb request failed with ${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

async function collectIds(kind: "movie" | "tv", target: number) {
  const ids = new Set<number>();
  const sources = kind === "movie"
    ? ["/movie/popular", "/movie/top_rated", "/discover/movie"]
    : ["/tv/popular", "/tv/top_rated", "/discover/tv"];
  const startPage = kind === "movie" ? startPageMovies : startPageSeries;
  for (const source of sources) {
    for (let page = startPage; page < startPage + pageLimit; page += 1) {
      const params: Record<string, string | number> = { page, language: "en-US", sort_by: "popularity.desc" };
      if (source.startsWith("/discover/") && discoverYearFrom > 0) params[kind === "movie" ? "primary_release_date.gte" : "first_air_date.gte"] = `${discoverYearFrom}-01-01`;
      if (source.startsWith("/discover/") && discoverYearTo > 0) params[kind === "movie" ? "primary_release_date.lte" : "first_air_date.lte"] = `${discoverYearTo}-12-31`;
      let response: TmdbPage;
      try {
        response = await tmdbFetch<TmdbPage>(source, params);
      } catch (error) {
        console.error(`[${kind} page failed] ${source} page ${page}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      for (const item of response.results ?? []) if (item.id) ids.add(item.id);
      if ((response.results ?? []).length === 0 || ids.size >= target * 2) break;
    }
  }
  console.log(`Collected ${ids.size} unique TMDb ${kind === "movie" ? "movie" : "series"} IDs`);
  return [...ids];
}

async function ensureGenre(tx: Transaction, name: string) {
  const slug = slugify(name);
  if (!slug) return null;
  const [inserted] = await tx.insert(genres).values({ name: name.trim(), slug }).onConflictDoNothing({ target: genres.slug }).returning({ id: genres.id });
  if (inserted) summary.genresInserted += 1; else summary.genresReused += 1;
  if (inserted) return inserted.id;
  return (await tx.query.genres.findFirst({ columns: { id: true }, where: (table, { eq }) => eq(table.slug, slug) }))?.id ?? null;
}

async function ensurePerson(tx: Transaction, name: string) {
  const slug = slugify(name);
  if (!slug) return null;
  const [inserted] = await tx.insert(people).values({ name: name.trim(), slug }).onConflictDoNothing({ target: people.slug }).returning({ id: people.id });
  if (inserted) summary.peopleInserted += 1; else summary.peopleReused += 1;
  if (inserted) return inserted.id;
  return (await tx.query.people.findFirst({ columns: { id: true }, where: (table, { eq }) => eq(table.slug, slug) }))?.id ?? null;
}

async function loadDuplicateSets() {
  const [movieRows, seriesRows] = await Promise.all([
    db.select({ title: movies.title, slug: movies.slug, releaseYear: movies.releaseYear }).from(movies),
    db.select({ title: series.title, slug: series.slug, releaseYear: series.releaseYear }).from(series),
  ]);
  return {
    movieSlugs: new Set(movieRows.map((item) => item.slug)),
    movieKeys: new Set(movieRows.map((item) => titleYearKey(item.title, item.releaseYear))),
    seriesSlugs: new Set(seriesRows.map((item) => item.slug)),
    seriesKeys: new Set(seriesRows.map((item) => titleYearKey(item.title, item.releaseYear))),
  };
}

async function seedMovies() {
  if (skipMovies || movieLimit === 0) return;
  const duplicates = await loadDuplicateSets();
  for (const id of await collectIds("movie", movieLimit)) {
    if (summary.moviesInserted >= movieLimit) break;
    try {
      const [item, credits] = await Promise.all([
        tmdbFetch<TmdbMovie>(`/movie/${id}`, { language: "en-US" }),
        tmdbFetch<TmdbCredits>(`/movie/${id}/credits`, { language: "en-US" }),
      ]);
      const title = clean(item.title);
      const slug = title ? slugify(title) : "";
      const releaseYear = year(item.release_date);
      if (!title || !slug) continue;
      if (duplicates.movieSlugs.has(slug) || duplicates.movieKeys.has(titleYearKey(title, releaseYear))) {
        summary.movieDuplicates += 1; console.log(`[movie duplicate] ${title} (${releaseYear ?? "unknown year"})`); continue;
      }
      const cast = names(credits.cast);
      const directors = names((credits.crew ?? []).filter((person) => person.job === "Director"));
      const writers = names((credits.crew ?? []).filter((person) => person.department === "Writing"));
      if (!dryRun) await db.transaction(async (tx) => {
        const [row] = await tx.insert(movies).values({ title, slug, overview: clean(item.overview), releaseDate: date(item.release_date), releaseYear,
          durationMinutes: item.runtime && item.runtime > 0 ? item.runtime : null, director: directors.join(", ") || null,
          writer: writers.join(", ") || null, cast: cast.join(", ") || null, posterUrl: imageUrl(item.poster_path), backdropUrl: imageUrl(item.backdrop_path) })
          .onConflictDoNothing({ target: movies.slug }).returning({ id: movies.id });
        if (!row) throw new Error("slug was inserted concurrently");
        for (const genre of item.genres ?? []) { const genreId = genre.name ? await ensureGenre(tx, genre.name) : null; if (genreId) await tx.insert(movieGenres).values({ movieId: row.id, genreId }).onConflictDoNothing(); }
        for (const person of uniqueRoles([...directors.map((name) => ({ name, role: "director" as const })), ...writers.map((name) => ({ name, role: "writer" as const })), ...cast.map((name) => ({ name, role: "actor" as const }))])) {
          const personId = await ensurePerson(tx, person.name); if (personId) await tx.insert(moviePeople).values({ movieId: row.id, personId, role: person.role }).onConflictDoNothing();
        }
      });
      duplicates.movieSlugs.add(slug); duplicates.movieKeys.add(titleYearKey(title, releaseYear)); summary.moviesInserted += 1;
      console.log(`[movie ${dryRun ? "dry-run" : "inserted"}] ${title} (${releaseYear ?? "unknown year"})`);
    } catch (error) { summary.movieFailures += 1; console.error(`[movie failed] TMDb ${id}: ${error instanceof Error ? error.message : String(error)}`); }
  }
}

async function seedSeries() {
  if (skipSeries || seriesLimit === 0) return;
  const duplicates = await loadDuplicateSets();
  for (const id of await collectIds("tv", seriesLimit)) {
    if (summary.seriesInserted >= seriesLimit) break;
    try {
      const [item, credits] = await Promise.all([tmdbFetch<TmdbSeries>(`/tv/${id}`, { language: "en-US" }), tmdbFetch<TmdbCredits>(`/tv/${id}/credits`, { language: "en-US" })]);
      const title = clean(item.name); const slug = title ? slugify(title) : ""; const releaseYear = year(item.first_air_date);
      if (!title || !slug) continue;
      if (duplicates.seriesSlugs.has(slug) || duplicates.seriesKeys.has(titleYearKey(title, releaseYear))) {
        summary.seriesDuplicates += 1; console.log(`[series duplicate] ${title} (${releaseYear ?? "unknown year"})`); continue;
      }
      const cast = names(credits.cast); const creators = names(item.created_by); const network = names(item.networks?.length ? item.networks : item.production_companies, 3).join(", ") || null;
      if (!dryRun) await db.transaction(async (tx) => {
        const [row] = await tx.insert(series).values({ title, slug, overview: clean(item.overview), firstAirDate: date(item.first_air_date), releaseYear,
          status: clean(item.status), network, creator: creators.join(", ") || null, cast: cast.join(", ") || null, posterUrl: imageUrl(item.poster_path), backdropUrl: imageUrl(item.backdrop_path) })
          .onConflictDoNothing({ target: series.slug }).returning({ id: series.id });
        if (!row) throw new Error("slug was inserted concurrently");
        for (const genre of item.genres ?? []) { const genreId = genre.name ? await ensureGenre(tx, genre.name) : null; if (genreId) await tx.insert(seriesGenres).values({ seriesId: row.id, genreId }).onConflictDoNothing(); }
        for (const person of uniqueRoles([...creators.map((name) => ({ name, role: "creator" as const })), ...cast.map((name) => ({ name, role: "actor" as const }))])) {
          const personId = await ensurePerson(tx, person.name); if (personId) await tx.insert(seriesPeople).values({ seriesId: row.id, personId, role: person.role }).onConflictDoNothing();
        }
      });
      duplicates.seriesSlugs.add(slug); duplicates.seriesKeys.add(titleYearKey(title, releaseYear)); summary.seriesInserted += 1;
      console.log(`[series ${dryRun ? "dry-run" : "inserted"}] ${title} (${releaseYear ?? "unknown year"})`);
    } catch (error) { summary.seriesFailures += 1; console.error(`[series failed] TMDb ${id}: ${error instanceof Error ? error.message : String(error)}`); }
  }
}

async function main() {
  console.log(`TMDb catalog seed started: DRY_RUN=${dryRun}, LIMIT_MOVIES=${movieLimit}, LIMIT_SERIES=${seriesLimit}, PAGE_LIMIT=${pageLimit}, SKIP_MOVIES=${skipMovies}, SKIP_SERIES=${skipSeries}`);
  if (process.env.SEED_SERIES_EPISODES === "true") console.log("SEED_SERIES_EPISODES=true: run db:update-series-episodes after this catalog seed; episode import stays isolated for safety.");
  await seedMovies(); await seedSeries();
  console.log("Final summary"); for (const [key, value] of Object.entries(summary)) console.log(`${key}: ${value}`);
}

main().catch((error) => { console.error(`TMDb catalog seed failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }).finally(async () => pool.end());
