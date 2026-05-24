import { and, asc, countDistinct, desc, eq, ilike, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { episodes, genres, seasons, series, seriesGenres } from "@/db/schema";

type CatalogListParams = {
  page?: number | string | null;
  pageSize?: number | string | null;
  search?: string | null;
  q?: string | null;
  genre?: string | null;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;

const normalizePositiveInteger = (value: CatalogListParams["page"], fallback: number) => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : value;

  return typeof parsed === "number" && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeSearch = (params: CatalogListParams) => {
  const search = params.search?.trim() || params.q?.trim();

  return search ? `%${search}%` : undefined;
};

const normalizeGenre = (genre?: string | null) => {
  const value = genre?.trim();

  return value || undefined;
};

const getGenresBySeriesIds = async (seriesIds: number[]) => {
  if (seriesIds.length === 0) {
    return new Map<number, Array<typeof genres.$inferSelect>>();
  }

  const rows = await db
    .select({
      seriesId: seriesGenres.seriesId,
      genre: genres,
    })
    .from(seriesGenres)
    .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
    .where(inArray(seriesGenres.seriesId, seriesIds))
    .orderBy(asc(genres.name));

  return rows.reduce((genreMap, row) => {
    const seriesGenresForItem = genreMap.get(row.seriesId) ?? [];
    seriesGenresForItem.push(row.genre);
    genreMap.set(row.seriesId, seriesGenresForItem);

    return genreMap;
  }, new Map<number, Array<typeof genres.$inferSelect>>());
};

export const getSeries = async (params: CatalogListParams = {}) => {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const pageSize = normalizePositiveInteger(params.pageSize, DEFAULT_PAGE_SIZE);
  const offset = (page - 1) * pageSize;
  const search = normalizeSearch(params);
  const genre = normalizeGenre(params.genre);
  const filters = [
    search ? ilike(series.title, search) : undefined,
    genre ? or(eq(genres.slug, genre), ilike(genres.name, genre)) : undefined,
  ].filter(Boolean);
  const where = filters.length > 0 ? and(...filters) : undefined;

  const baseQuery = db.select({ series: series }).from(series).$dynamic();
  const countQuery = db.select({ totalItems: countDistinct(series.id) }).from(series).$dynamic();

  if (genre) {
    baseQuery.innerJoin(seriesGenres, eq(seriesGenres.seriesId, series.id));
    baseQuery.innerJoin(genres, eq(seriesGenres.genreId, genres.id));
    countQuery.innerJoin(seriesGenres, eq(seriesGenres.seriesId, series.id));
    countQuery.innerJoin(genres, eq(seriesGenres.genreId, genres.id));
  }

  if (where) {
    baseQuery.where(where);
    countQuery.where(where);
  }

  const [items, [pagination]] = await Promise.all([
    baseQuery.orderBy(desc(series.firstAirDate), asc(series.title)).limit(pageSize).offset(offset),
    countQuery,
  ]);
  const seriesIds = items.map(({ series: item }) => item.id);
  const genresBySeriesId = await getGenresBySeriesIds(seriesIds);
  const totalItems = pagination?.totalItems ?? 0;

  return {
    items: items.map(({ series: item }) => ({
      ...item,
      genres: genresBySeriesId.get(item.id) ?? [],
    })),
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};

export const getSeriesBySlug = async (slug: string) => {
  const [show] = await db.select().from(series).where(eq(series.slug, slug)).limit(1);

  if (!show) {
    return null;
  }

  const genresBySeriesId = await getGenresBySeriesIds([show.id]);

  return {
    ...show,
    genres: genresBySeriesId.get(show.id) ?? [],
  };
};

export const getSeriesSeasons = async (seriesId: number) => {
  return db
    .select()
    .from(seasons)
    .where(eq(seasons.seriesId, seriesId))
    .orderBy(asc(seasons.seasonNumber));
};

export const getSeasonEpisodes = async (seasonId: number) => {
  return db
    .select()
    .from(episodes)
    .where(eq(episodes.seasonId, seasonId))
    .orderBy(asc(episodes.episodeNumber));
};
