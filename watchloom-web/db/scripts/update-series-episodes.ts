import "dotenv/config";

import { asc, count, eq, inArray } from "drizzle-orm";

import { db, pool } from "../../src/db";
import { episodes, seasons, series } from "../../src/db/schema";

type LocalSeries = {
  id: number;
  title: string;
  releaseYear: number | null;
};

type TmdbTvSearchResult = {
  id?: number;
  name?: string;
  original_name?: string;
  first_air_date?: string;
};

type TmdbSearchResponse<T> = {
  results?: T[];
};

type TmdbTvDetails = {
  id: number;
  name?: string;
  first_air_date?: string;
  seasons?: TmdbSeasonSummary[];
};

type TmdbSeasonSummary = {
  season_number?: number;
  name?: string;
  air_date?: string | null;
  poster_path?: string | null;
};

type TmdbSeasonDetails = {
  season_number?: number;
  name?: string;
  air_date?: string | null;
  poster_path?: string | null;
  episodes?: TmdbEpisode[];
};

type TmdbEpisode = {
  episode_number?: number;
  name?: string;
  overview?: string | null;
  runtime?: number | null;
  air_date?: string | null;
};

type SeriesMatch = {
  id: number;
  title: string;
  year: number | null;
};

type RealSeason = {
  seasonNumber: number;
  title: string;
  releaseYear: number | null;
  posterUrl: string | null;
  episodes: RealEpisode[];
};

type RealEpisode = {
  episodeNumber: number;
  title: string;
  overview: string | null;
  durationMinutes: number | null;
  airDate: string | null;
};

const tmdbApiToken = process.env.TMDB_API_TOKEN || process.env.TMDB_API_READ_ACCESS_TOKEN;
const tmdbApiKey = process.env.TMDB_API_KEY;
const tmdbApiBaseUrl = process.env.TMDB_API_BASE_URL ?? "https://api.themoviedb.org/3";
const tmdbImageBaseUrl = process.env.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p/w500";
const dryRun = process.env.DRY_RUN === "true";
const requestDelayMs = 250;

const limitValue = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;
const limit =
  limitValue !== undefined && Number.isInteger(limitValue) && limitValue > 0 ? limitValue : undefined;

const summary = {
  totalSeriesChecked: 0,
  matchedSeries: 0,
  updatedSeries: 0,
  skippedSeries: 0,
  failedSeries: 0,
  seasonsInserted: 0,
  episodesInserted: 0,
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

function getYearFromDate(dateString?: string | null) {
  if (!dateString) {
    return null;
  }

  const year = Number(dateString.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

function normalizeDate(dateString?: string | null) {
  return dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : null;
}

function normalizeText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

function buildPosterUrl(posterPath?: string | null) {
  if (!posterPath) {
    return null;
  }

  return `${tmdbImageBaseUrl.replace(/\/+$/, "")}/${posterPath.replace(/^\/+/, "")}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
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

function findBestSeriesMatch(localSeries: LocalSeries, tmdbResults: TmdbTvSearchResult[]) {
  if (tmdbResults.length === 0) {
    return { match: null, reason: "TMDb returned no results" };
  }

  const normalizedLocalTitle = normalizeTitle(localSeries.title);
  const exactMatches = tmdbResults
    .map((result) => {
      const normalizedTitles = [result.name, result.original_name]
        .filter(Boolean)
        .map((value) => normalizeTitle(value!));
      const exactTitleMatch = normalizedTitles.includes(normalizedLocalTitle);
      const year = getYearFromDate(result.first_air_date);
      const yearDifference =
        localSeries.releaseYear !== null && year !== null ? Math.abs(localSeries.releaseYear - year) : null;

      return {
        result,
        title: result.name,
        year,
        exactTitleMatch,
        yearDifference,
      };
    })
    .filter(({ exactTitleMatch }) => exactTitleMatch);

  if (exactMatches.length === 0) {
    return { match: null, reason: "title match is weak" };
  }

  const candidates = exactMatches
    .filter(({ result, yearDifference }) => {
      if (!result.id) {
        return false;
      }

      return localSeries.releaseYear === null || (yearDifference !== null && yearDifference <= 1);
    })
    .sort((a, b) => {
      const aYearDifference = a.yearDifference ?? 0;
      const bYearDifference = b.yearDifference ?? 0;
      return aYearDifference - bYearDifference;
    });

  const best = candidates[0];

  if (!best?.result.id || !best.title) {
    return { match: null, reason: "no confident TMDb series match" };
  }

  return {
    match: {
      id: best.result.id,
      title: best.title,
      year: best.year,
    } satisfies SeriesMatch,
  };
}

async function searchSeries(localSeries: LocalSeries) {
  const response = await tmdbFetch<TmdbSearchResponse<TmdbTvSearchResult>>("/search/tv", {
    query: localSeries.title,
    first_air_date_year: localSeries.releaseYear ?? undefined,
    include_adult: "false",
    language: "en-US",
  });

  return findBestSeriesMatch(localSeries, response.results ?? []);
}

async function fetchSeriesDetails(tmdbSeriesId: number) {
  return tmdbFetch<TmdbTvDetails>(`/tv/${tmdbSeriesId}`, {
    language: "en-US",
  });
}

async function fetchSeasonDetails(tmdbSeriesId: number, seasonNumber: number) {
  return tmdbFetch<TmdbSeasonDetails>(`/tv/${tmdbSeriesId}/season/${seasonNumber}`, {
    language: "en-US",
  });
}

function toRealEpisode(tmdbEpisode: TmdbEpisode) {
  const episodeNumber = tmdbEpisode.episode_number;
  const title = normalizeText(tmdbEpisode.name);

  if (!Number.isInteger(episodeNumber) || episodeNumber === undefined || episodeNumber < 1) {
    throw new Error("TMDb episode is missing a valid episode_number");
  }

  if (!title) {
    throw new Error(`TMDb episode ${episodeNumber} is missing a name`);
  }

  const runtime = tmdbEpisode.runtime;

  return {
    episodeNumber,
    title,
    overview: normalizeText(tmdbEpisode.overview),
    durationMinutes: Number.isInteger(runtime) && runtime !== null && runtime !== undefined && runtime > 0 ? runtime : null,
    airDate: normalizeDate(tmdbEpisode.air_date),
  } satisfies RealEpisode;
}

function toRealSeason(summary: TmdbSeasonSummary, details: TmdbSeasonDetails) {
  const seasonNumber = summary.season_number ?? details.season_number;

  if (!Number.isInteger(seasonNumber) || seasonNumber === undefined || seasonNumber < 1) {
    throw new Error("TMDb season is missing a valid season_number");
  }

  const seasonEpisodes = details.episodes ?? [];

  return {
    seasonNumber,
    title: normalizeText(details.name) ?? normalizeText(summary.name) ?? `Season ${seasonNumber}`,
    releaseYear: getYearFromDate(details.air_date ?? summary.air_date),
    posterUrl: buildPosterUrl(details.poster_path ?? summary.poster_path),
    episodes: seasonEpisodes.map(toRealEpisode).sort((a, b) => a.episodeNumber - b.episodeNumber),
  } satisfies RealSeason;
}

async function fetchRealSeasons(tmdbSeriesId: number) {
  const details = await fetchSeriesDetails(tmdbSeriesId);
  const seasonSummaries = (details.seasons ?? [])
    .filter((season) => {
      return Number.isInteger(season.season_number) && season.season_number !== undefined && season.season_number >= 1;
    })
    .sort((a, b) => (a.season_number ?? 0) - (b.season_number ?? 0));

  if (seasonSummaries.length === 0) {
    throw new Error("TMDb series details contained no regular seasons");
  }

  const realSeasons: RealSeason[] = [];

  for (const seasonSummary of seasonSummaries) {
    const seasonNumber = seasonSummary.season_number!;
    await delay(requestDelayMs);
    const seasonDetails = await fetchSeasonDetails(tmdbSeriesId, seasonNumber);
    realSeasons.push(toRealSeason(seasonSummary, seasonDetails));
  }

  return realSeasons;
}

async function getExistingCounts(seriesId: number) {
  const existingSeasons = await db
    .select({ id: seasons.id })
    .from(seasons)
    .where(eq(seasons.seriesId, seriesId));

  if (existingSeasons.length === 0) {
    return { seasonCount: 0, episodeCount: 0 };
  }

  const [episodeCount] = await db
    .select({ total: count(episodes.id) })
    .from(episodes)
    .where(
      inArray(
        episodes.seasonId,
        existingSeasons.map((season) => season.id),
      ),
    );

  return {
    seasonCount: existingSeasons.length,
    episodeCount: episodeCount?.total ?? 0,
  };
}

async function replaceSeriesSeasonsAndEpisodes(localSeries: LocalSeries, realSeasons: RealSeason[]) {
  const insertedEpisodeCount = realSeasons.reduce((total, season) => total + season.episodes.length, 0);

  await db.transaction(async (tx) => {
    const existingSeasons = await tx
      .select({ id: seasons.id })
      .from(seasons)
      .where(eq(seasons.seriesId, localSeries.id));

    if (existingSeasons.length > 0) {
      const existingSeasonIds = existingSeasons.map((season) => season.id);
      await tx.delete(episodes).where(inArray(episodes.seasonId, existingSeasonIds));
      await tx.delete(seasons).where(eq(seasons.seriesId, localSeries.id));
    }

    for (const realSeason of realSeasons) {
      const [insertedSeason] = await tx
        .insert(seasons)
        .values({
          seriesId: localSeries.id,
          seasonNumber: realSeason.seasonNumber,
          title: realSeason.title,
          releaseYear: realSeason.releaseYear,
          posterUrl: realSeason.posterUrl,
        })
        .returning({ id: seasons.id });

      if (!insertedSeason) {
        throw new Error(`Failed to insert season ${realSeason.seasonNumber}`);
      }

      if (realSeason.episodes.length > 0) {
        await tx.insert(episodes).values(
          realSeason.episodes.map((episode) => ({
            seasonId: insertedSeason.id,
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            overview: episode.overview,
            durationMinutes: episode.durationMinutes,
            airDate: episode.airDate,
          })),
        );
      }
    }
  });

  return {
    seasonsInserted: realSeasons.length,
    episodesInserted: insertedEpisodeCount,
  };
}

async function getSeriesToProcess() {
  return db
    .select({
      id: series.id,
      title: series.title,
      releaseYear: series.releaseYear,
    })
    .from(series)
    .orderBy(asc(series.title))
    .limit(limit ?? 100000);
}

async function processSeries(localSeries: LocalSeries) {
  try {
    const { match, reason } = await searchSeries(localSeries);

    if (!match) {
      summary.skippedSeries += 1;
      console.log(
        `[series skipped] ${localSeries.title} (${localSeries.releaseYear ?? "unknown year"}): ${reason}`,
      );
      return;
    }

    summary.matchedSeries += 1;
    await delay(requestDelayMs);
    const realSeasons = await fetchRealSeasons(match.id);
    const episodeCount = realSeasons.reduce((total, season) => total + season.episodes.length, 0);
    const existingCounts = await getExistingCounts(localSeries.id);

    console.log(
      `[series matched] ${localSeries.title} (${localSeries.releaseYear ?? "unknown year"}) -> ${match.title} [TMDb ${match.id}] (${match.year ?? "unknown year"}): ${realSeasons.length} seasons, ${episodeCount} episodes`,
    );

    if (dryRun) {
      summary.updatedSeries += 1;
      summary.seasonsInserted += realSeasons.length;
      summary.episodesInserted += episodeCount;
      console.log(
        `[series dry-run] ${localSeries.title}: would delete ${existingCounts.seasonCount} seasons and ${existingCounts.episodeCount} episodes; would insert ${realSeasons.length} seasons and ${episodeCount} episodes`,
      );
      return;
    }

    const insertedCounts = await replaceSeriesSeasonsAndEpisodes(localSeries, realSeasons);
    summary.updatedSeries += 1;
    summary.seasonsInserted += insertedCounts.seasonsInserted;
    summary.episodesInserted += insertedCounts.episodesInserted;
    console.log(
      `[series updated] ${localSeries.title}: inserted ${insertedCounts.seasonsInserted} seasons and ${insertedCounts.episodesInserted} episodes`,
    );
  } catch (error) {
    summary.failedSeries += 1;
    console.error(
      `[series failed] ${localSeries.title} (${localSeries.releaseYear ?? "unknown year"}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function main() {
  console.log("TMDb series seasons and episodes update started");
  console.log(`Mode: DRY_RUN=${dryRun}, LIMIT=${limit ?? "none"}`);

  if (process.env.TMDB_API_READ_ACCESS_TOKEN && !process.env.TMDB_API_TOKEN) {
    console.log("TMDB_API_TOKEN is not set; using TMDB_API_READ_ACCESS_TOKEN fallback.");
  }

  const records = await getSeriesToProcess();
  summary.totalSeriesChecked = records.length;

  console.log(`Total series to process: ${records.length}`);

  for (const record of records) {
    await processSeries(record);
    await delay(requestDelayMs);
  }

  console.log("Final summary");
  console.log(`Total series checked: ${summary.totalSeriesChecked}`);
  console.log(`Matched series: ${summary.matchedSeries}`);
  console.log(`Updated series: ${summary.updatedSeries}`);
  console.log(`Skipped series: ${summary.skippedSeries}`);
  console.log(`Failed series: ${summary.failedSeries}`);
  console.log(`Seasons inserted: ${summary.seasonsInserted}`);
  console.log(`Episodes inserted: ${summary.episodesInserted}`);
}

main()
  .catch((error) => {
    summary.failedSeries += 1;
    console.error(`Series seasons and episodes update failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
