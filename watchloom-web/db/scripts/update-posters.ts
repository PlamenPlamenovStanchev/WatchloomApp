import "dotenv/config";

import { and, asc, eq, isNull, or, sql } from "drizzle-orm";

import { db, pool } from "../../src/db";
import { movies, series } from "../../src/db/schema";

type CatalogRecord = {
  id: number;
  title: string;
  releaseYear: number | null;
  posterUrl: string | null;
};

type TmdbMovieResult = {
  title?: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string | null;
};

type TmdbSeriesResult = {
  name?: string;
  original_name?: string;
  first_air_date?: string;
  poster_path?: string | null;
};

type TmdbSearchResponse<T> = {
  results?: T[];
};

type Match = {
  title: string;
  year: number | null;
  posterUrl: string;
};

type MatchResult = {
  match: Match | null;
  reason?: string;
};

const tmdbApiToken = process.env.TMDB_API_TOKEN || process.env.TMDB_API_READ_ACCESS_TOKEN;
const tmdbApiKey = process.env.TMDB_API_KEY;
const tmdbApiBaseUrl = process.env.TMDB_API_BASE_URL ?? "https://api.themoviedb.org/3";
const tmdbImageBaseUrl = process.env.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p/w500";
const dryRun = process.env.DRY_RUN === "true";
const forcePosterUpdate = process.env.FORCE_POSTER_UPDATE === "true";
const requestDelayMs = 250;

const limitValue = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;
const limit =
  limitValue !== undefined && Number.isInteger(limitValue) && limitValue > 0 ? limitValue : undefined;

const summary = {
  moviesUpdated: 0,
  moviesSkipped: 0,
  seriesUpdated: 0,
  seriesSkipped: 0,
  failures: 0,
};

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getYearFromDate(dateString?: string) {
  if (!dateString) {
    return null;
  }

  const year = Number(dateString.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

function buildPosterUrl(posterPath: string) {
  return `${tmdbImageBaseUrl.replace(/\/+$/, "")}/${posterPath.replace(/^\/+/, "")}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  attempt = 1,
  useApiKey = false,
) {
  const canUseBearerToken = Boolean(tmdbApiToken) && !useApiKey;

  if (!canUseBearerToken && !tmdbApiKey) {
    throw new Error("TMDB_API_TOKEN is not set");
  }

  const url = new URL(`${tmdbApiBaseUrl.replace(/\/+$/, "")}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  if (!canUseBearerToken && tmdbApiKey) {
    url.searchParams.set("api_key", tmdbApiKey);
  }

  const response = await fetch(url, {
    headers: canUseBearerToken
      ? {
          accept: "application/json",
          authorization: `Bearer ${tmdbApiToken}`,
        }
      : {
          accept: "application/json",
        },
  });

  if (response.status === 401 && canUseBearerToken && tmdbApiKey) {
    return tmdbFetch<T>(path, params, attempt, true);
  }

  if (response.status === 429) {
    if (attempt >= 3) {
      throw new Error("TMDb rate limit persisted after retries");
    }

    const retryAfter = Number(response.headers.get("retry-after"));
    await delay(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000);
    return tmdbFetch<T>(path, params, attempt + 1, useApiKey);
  }

  if (!response.ok) {
    throw new Error(`TMDb request failed with ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function chooseBestMatch<T extends { poster_path?: string | null }>(
  localTitle: string,
  localYear: number | null,
  results: T[],
  getTitle: (result: T) => string | undefined,
  getOriginalTitle: (result: T) => string | undefined,
  getYear: (result: T) => number | null,
): MatchResult {
  if (results.length === 0) {
    return { match: null, reason: "TMDb returned no results" };
  }

  const normalizedLocalTitle = normalizeTitle(localTitle);

  const exactTitleMatches = results
    .map((result) => {
      const title = getTitle(result);
      const originalTitle = getOriginalTitle(result);
      const normalizedTitles = [title, originalTitle].filter(Boolean).map((value) => normalizeTitle(value!));
      const exactTitleMatch = normalizedTitles.includes(normalizedLocalTitle);
      const year = getYear(result);
      const yearDifference = localYear !== null && year !== null ? Math.abs(localYear - year) : null;

      return {
        result,
        title,
        year,
        exactTitleMatch,
        yearDifference,
      };
    })
    .filter(({ exactTitleMatch }) => exactTitleMatch);

  if (exactTitleMatches.length === 0) {
    return { match: null, reason: "title match is weak" };
  }

  const posterMatches = exactTitleMatches.filter(({ result }) => Boolean(result.poster_path));

  if (posterMatches.length === 0) {
    return { match: null, reason: "best title matches have no poster_path" };
  }

  const candidates = posterMatches
    .filter(({ yearDifference }) => {
      return localYear === null || (yearDifference !== null && yearDifference <= 1);
    })
    .sort((a, b) => {
      const aYearDifference = a.yearDifference ?? 0;
      const bYearDifference = b.yearDifference ?? 0;
      return aYearDifference - bYearDifference;
    });

  if (candidates.length === 0) {
    return { match: null, reason: "year mismatch is too large or TMDb year is missing" };
  }

  const best = candidates[0];

  if (!best?.title || !best.result.poster_path) {
    return { match: null, reason: "best match is incomplete" };
  }

  return {
    match: {
      title: best.title,
      year: best.year,
      posterUrl: buildPosterUrl(best.result.poster_path),
    },
  };
}

async function findBestMovieMatch(movie: CatalogRecord) {
  const response = await tmdbFetch<TmdbSearchResponse<TmdbMovieResult>>("/search/movie", {
    query: movie.title,
    year: movie.releaseYear ?? undefined,
    include_adult: "false",
    language: "en-US",
  });

  return chooseBestMatch(
    movie.title,
    movie.releaseYear,
    response.results ?? [],
    (result) => result.title,
    (result) => result.original_title,
    (result) => getYearFromDate(result.release_date),
  );
}

async function findBestSeriesMatch(show: CatalogRecord) {
  const response = await tmdbFetch<TmdbSearchResponse<TmdbSeriesResult>>("/search/tv", {
    query: show.title,
    first_air_date_year: show.releaseYear ?? undefined,
    include_adult: "false",
    language: "en-US",
  });

  return chooseBestMatch(
    show.title,
    show.releaseYear,
    response.results ?? [],
    (result) => result.name,
    (result) => result.original_name,
    (result) => getYearFromDate(result.first_air_date),
  );
}

async function updateMoviePoster(movie: CatalogRecord, posterUrl: string) {
  const condition = forcePosterUpdate
    ? eq(movies.id, movie.id)
    : and(eq(movies.id, movie.id), or(isNull(movies.posterUrl), eq(movies.posterUrl, "")));

  await db.update(movies).set({ posterUrl }).where(condition);
}

async function updateSeriesPoster(show: CatalogRecord, posterUrl: string) {
  const condition = forcePosterUpdate
    ? eq(series.id, show.id)
    : and(eq(series.id, show.id), or(isNull(series.posterUrl), eq(series.posterUrl, "")));

  await db.update(series).set({ posterUrl }).where(condition);
}

async function getMoviesToProcess() {
  return db
    .select({
      id: movies.id,
      title: movies.title,
      releaseYear: movies.releaseYear,
      posterUrl: movies.posterUrl,
    })
    .from(movies)
    .where(forcePosterUpdate ? sql`true` : or(isNull(movies.posterUrl), eq(movies.posterUrl, "")))
    .orderBy(asc(movies.title))
    .limit(limit ?? 100000);
}

async function getSeriesToProcess() {
  return db
    .select({
      id: series.id,
      title: series.title,
      releaseYear: series.releaseYear,
      posterUrl: series.posterUrl,
    })
    .from(series)
    .where(forcePosterUpdate ? sql`true` : or(isNull(series.posterUrl), eq(series.posterUrl, "")))
    .orderBy(asc(series.title))
    .limit(limit ?? 100000);
}

async function processMovies(records: CatalogRecord[]) {
  for (const movie of records) {
    try {
      const { match, reason } = await findBestMovieMatch(movie);

      if (!match) {
        summary.moviesSkipped += 1;
        console.log(`[movie skipped] ${movie.title} (${movie.releaseYear ?? "unknown year"}): ${reason}`);
        await delay(requestDelayMs);
        continue;
      }

      if (dryRun) {
        summary.moviesUpdated += 1;
        console.log(
          `[movie dry-run] ${movie.title} (${movie.releaseYear ?? "unknown year"}) -> ${match.title} (${match.year ?? "unknown year"}) ${match.posterUrl}`,
        );
      } else {
        await updateMoviePoster(movie, match.posterUrl);
        summary.moviesUpdated += 1;
        console.log(
          `[movie updated] ${movie.title} (${movie.releaseYear ?? "unknown year"}) -> ${match.title} (${match.year ?? "unknown year"}) ${match.posterUrl}`,
        );
      }
    } catch (error) {
      summary.failures += 1;
      console.error(`[movie failed] ${movie.title}: ${error instanceof Error ? error.message : String(error)}`);
    }

    await delay(requestDelayMs);
  }
}

async function processSeries(records: CatalogRecord[]) {
  for (const show of records) {
    try {
      const { match, reason } = await findBestSeriesMatch(show);

      if (!match) {
        summary.seriesSkipped += 1;
        console.log(`[series skipped] ${show.title} (${show.releaseYear ?? "unknown year"}): ${reason}`);
        await delay(requestDelayMs);
        continue;
      }

      if (dryRun) {
        summary.seriesUpdated += 1;
        console.log(
          `[series dry-run] ${show.title} (${show.releaseYear ?? "unknown year"}) -> ${match.title} (${match.year ?? "unknown year"}) ${match.posterUrl}`,
        );
      } else {
        await updateSeriesPoster(show, match.posterUrl);
        summary.seriesUpdated += 1;
        console.log(
          `[series updated] ${show.title} (${show.releaseYear ?? "unknown year"}) -> ${match.title} (${match.year ?? "unknown year"}) ${match.posterUrl}`,
        );
      }
    } catch (error) {
      summary.failures += 1;
      console.error(`[series failed] ${show.title}: ${error instanceof Error ? error.message : String(error)}`);
    }

    await delay(requestDelayMs);
  }
}

async function main() {
  console.log("TMDb poster update started");
  console.log(`Mode: DRY_RUN=${dryRun}, FORCE_POSTER_UPDATE=${forcePosterUpdate}, LIMIT=${limit ?? "none"}`);

  if (process.env.TMDB_API_READ_ACCESS_TOKEN && !process.env.TMDB_API_TOKEN) {
    console.log("TMDB_API_TOKEN is not set; using TMDB_API_READ_ACCESS_TOKEN fallback.");
  }

  const [movieRecords, seriesRecords] = await Promise.all([getMoviesToProcess(), getSeriesToProcess()]);

  console.log(`Total movies to process: ${movieRecords.length}`);
  console.log(`Total series to process: ${seriesRecords.length}`);

  await processMovies(movieRecords);
  await processSeries(seriesRecords);

  console.log("Final summary");
  console.log(`Movies updated: ${summary.moviesUpdated}`);
  console.log(`Movies skipped: ${summary.moviesSkipped}`);
  console.log(`Series updated: ${summary.seriesUpdated}`);
  console.log(`Series skipped: ${summary.seriesSkipped}`);
  console.log(`Failures: ${summary.failures}`);
}

main()
  .catch((error) => {
    summary.failures += 1;
    console.error(`Poster update failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
