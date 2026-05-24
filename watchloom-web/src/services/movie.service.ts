import { and, asc, countDistinct, desc, eq, ilike, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { genres, movieGenres, movies } from "@/db/schema";

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

const getMovieGenresByMovieIds = async (movieIds: number[]) => {
  if (movieIds.length === 0) {
    return new Map<number, Array<typeof genres.$inferSelect>>();
  }

  const rows = await db
    .select({
      movieId: movieGenres.movieId,
      genre: genres,
    })
    .from(movieGenres)
    .innerJoin(genres, eq(movieGenres.genreId, genres.id))
    .where(inArray(movieGenres.movieId, movieIds))
    .orderBy(asc(genres.name));

  return rows.reduce((genreMap, row) => {
    const movieGenresForItem = genreMap.get(row.movieId) ?? [];
    movieGenresForItem.push(row.genre);
    genreMap.set(row.movieId, movieGenresForItem);

    return genreMap;
  }, new Map<number, Array<typeof genres.$inferSelect>>());
};

export const getMovies = async (params: CatalogListParams = {}) => {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const pageSize = normalizePositiveInteger(params.pageSize, DEFAULT_PAGE_SIZE);
  const offset = (page - 1) * pageSize;
  const search = normalizeSearch(params);
  const genre = normalizeGenre(params.genre);
  const filters = [
    search ? ilike(movies.title, search) : undefined,
    genre ? or(eq(genres.slug, genre), ilike(genres.name, genre)) : undefined,
  ].filter(Boolean);
  const where = filters.length > 0 ? and(...filters) : undefined;

  const baseQuery = db.select({ movie: movies }).from(movies).$dynamic();
  const countQuery = db.select({ totalItems: countDistinct(movies.id) }).from(movies).$dynamic();

  if (genre) {
    baseQuery.innerJoin(movieGenres, eq(movieGenres.movieId, movies.id));
    baseQuery.innerJoin(genres, eq(movieGenres.genreId, genres.id));
    countQuery.innerJoin(movieGenres, eq(movieGenres.movieId, movies.id));
    countQuery.innerJoin(genres, eq(movieGenres.genreId, genres.id));
  }

  if (where) {
    baseQuery.where(where);
    countQuery.where(where);
  }

  const [items, [pagination]] = await Promise.all([
    baseQuery.orderBy(desc(movies.releaseDate), asc(movies.title)).limit(pageSize).offset(offset),
    countQuery,
  ]);
  const movieIds = items.map(({ movie }) => movie.id);
  const genresByMovieId = await getMovieGenresByMovieIds(movieIds);
  const totalItems = pagination?.totalItems ?? 0;

  return {
    items: items.map(({ movie }) => ({
      ...movie,
      genres: genresByMovieId.get(movie.id) ?? [],
    })),
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};

export const getMovieBySlug = async (slug: string) => {
  const [movie] = await db.select().from(movies).where(eq(movies.slug, slug)).limit(1);

  if (!movie) {
    return null;
  }

  const genresByMovieId = await getMovieGenresByMovieIds([movie.id]);

  return {
    ...movie,
    genres: genresByMovieId.get(movie.id) ?? [],
  };
};
