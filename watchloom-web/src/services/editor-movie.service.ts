import { and, asc, countDistinct, desc, eq, ilike, inArray, ne } from "drizzle-orm";

import { db } from "@/db";
import { genres, movieGenres, movies } from "@/db/schema";
import type { EditorMovieInput } from "@/lib/validations/editor-movie";

type MovieRecord = typeof movies.$inferSelect;

type EditorMovieListParams = {
  page?: number | string | null;
  pageSize?: number | string | null;
  search?: string | null;
};

export type EditorMovieListItem = MovieRecord & {
  genres: Array<typeof genres.$inferSelect>;
};

export class EditorMovieServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "DUPLICATE_SLUG" | "MOVIE_NOT_FOUND" | "INVALID_INPUT",
  ) {
    super(message);
    this.name = "EditorMovieServiceError";
  }
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const normalizePositiveInteger = (value: EditorMovieListParams["page"], fallback: number) => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : value;

  return typeof parsed === "number" && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const isUniqueConstraintError = (error: unknown) => {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
};

const getMovieGenresByMovieIds = async (movieIds: number[]) => {
  if (movieIds.length === 0) {
    return new Map<number, Array<typeof genres.$inferSelect>>();
  }

  const rows = await db
    .select({ movieId: movieGenres.movieId, genre: genres })
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

const assertUniqueSlug = async (slug: string, currentMovieId?: number) => {
  const filters = [eq(movies.slug, slug)];

  if (currentMovieId) {
    filters.push(ne(movies.id, currentMovieId));
  }

  const [existing] = await db
    .select({ id: movies.id })
    .from(movies)
    .where(and(...filters))
    .limit(1);

  if (existing) {
    throw new EditorMovieServiceError("A movie with this slug already exists.", "DUPLICATE_SLUG");
  }
};

const toMovieValues = (input: EditorMovieInput) => ({
  title: input.title,
  slug: input.slug,
  overview: input.overview,
  releaseYear: input.releaseYear,
  durationMinutes: input.durationMinutes,
  director: input.director,
  writer: input.writer,
  cast: input.cast,
  posterUrl: input.posterUrl,
  backdropUrl: input.backdropUrl,
});

const syncMovieGenres = async (tx: Parameters<Parameters<typeof db.transaction>[0]>[0], movieId: number, genreIds: number[]) => {
  await tx.delete(movieGenres).where(eq(movieGenres.movieId, movieId));

  if (genreIds.length > 0) {
    await tx
      .insert(movieGenres)
      .values(genreIds.map((genreId) => ({ movieId, genreId })))
      .onConflictDoNothing();
  }
};

export const getEditorMovies = async (params: EditorMovieListParams = {}) => {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const pageSize = normalizePositiveInteger(params.pageSize, DEFAULT_PAGE_SIZE);
  const search = params.search?.trim();
  const offset = (page - 1) * pageSize;
  const where = search ? ilike(movies.title, `%${search}%`) : undefined;
  const baseQuery = db.select({ movie: movies }).from(movies).$dynamic();
  const countQuery = db.select({ totalItems: countDistinct(movies.id) }).from(movies).$dynamic();

  if (where) {
    baseQuery.where(where);
    countQuery.where(where);
  }

  const [items, [pagination]] = await Promise.all([
    baseQuery.orderBy(desc(movies.updatedAt), asc(movies.title)).limit(pageSize).offset(offset),
    countQuery,
  ]);
  const movieIds = items.map(({ movie }) => movie.id);
  const genresByMovieId = await getMovieGenresByMovieIds(movieIds);
  const totalItems = pagination?.totalItems ?? 0;

  return {
    items: items.map(({ movie }) => ({ ...movie, genres: genresByMovieId.get(movie.id) ?? [] })),
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    search: search ?? "",
  };
};

export const getEditorMovieById = async (movieId: number) => {
  const [movie] = await db.select().from(movies).where(eq(movies.id, movieId)).limit(1);

  if (!movie) {
    return null;
  }

  const genresByMovieId = await getMovieGenresByMovieIds([movie.id]);

  return {
    ...movie,
    genres: genresByMovieId.get(movie.id) ?? [],
  };
};

export const createEditorMovie = async (input: EditorMovieInput) => {
  await assertUniqueSlug(input.slug);

  try {
    return db.transaction(async (tx) => {
      const [movie] = await tx.insert(movies).values(toMovieValues(input)).returning();

      await syncMovieGenres(tx, movie.id, input.genreIds);

      return movie;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EditorMovieServiceError("A movie with this slug already exists.", "DUPLICATE_SLUG");
    }
    throw error;
  }
};

export const updateEditorMovie = async (movieId: number, input: EditorMovieInput) => {
  await assertUniqueSlug(input.slug, movieId);

  try {
    return db.transaction(async (tx) => {
      const [movie] = await tx
        .update(movies)
        .set({ ...toMovieValues(input), updatedAt: new Date() })
        .where(eq(movies.id, movieId))
        .returning();

      if (!movie) {
        return null;
      }

      await syncMovieGenres(tx, movie.id, input.genreIds);

      return movie;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EditorMovieServiceError("A movie with this slug already exists.", "DUPLICATE_SLUG");
    }
    throw error;
  }
};

export const deleteEditorMovie = async (movieId: number) => {
  const [deleted] = await db.delete(movies).where(eq(movies.id, movieId)).returning({ id: movies.id });

  return Boolean(deleted);
};
