import { and, asc, countDistinct, desc, eq, ilike, inArray, ne } from "drizzle-orm";

import { db } from "@/db";
import { genres, series, seriesGenres } from "@/db/schema";
import type { EditorSeriesInput } from "@/lib/validations/editor-series";

type SeriesRecord = typeof series.$inferSelect;

type EditorSeriesListParams = {
  page?: number | string | null;
  pageSize?: number | string | null;
  search?: string | null;
};

export type EditorSeriesListItem = SeriesRecord & {
  genres: Array<typeof genres.$inferSelect>;
};

export class EditorSeriesServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "DUPLICATE_SLUG" | "SERIES_NOT_FOUND" | "INVALID_INPUT",
  ) {
    super(message);
    this.name = "EditorSeriesServiceError";
  }
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const normalizePositiveInteger = (value: EditorSeriesListParams["page"], fallback: number) => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : value;

  return typeof parsed === "number" && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const isUniqueConstraintError = (error: unknown) => {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
};

const getGenresBySeriesIds = async (seriesIds: number[]) => {
  if (seriesIds.length === 0) {
    return new Map<number, Array<typeof genres.$inferSelect>>();
  }

  const rows = await db
    .select({ seriesId: seriesGenres.seriesId, genre: genres })
    .from(seriesGenres)
    .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
    .where(inArray(seriesGenres.seriesId, seriesIds))
    .orderBy(asc(genres.name));

  return rows.reduce((genreMap, row) => {
    const genresForItem = genreMap.get(row.seriesId) ?? [];
    genresForItem.push(row.genre);
    genreMap.set(row.seriesId, genresForItem);
    return genreMap;
  }, new Map<number, Array<typeof genres.$inferSelect>>());
};

const assertUniqueSlug = async (slug: string, currentSeriesId?: number) => {
  const filters = [eq(series.slug, slug)];

  if (currentSeriesId) {
    filters.push(ne(series.id, currentSeriesId));
  }

  const [existing] = await db
    .select({ id: series.id })
    .from(series)
    .where(and(...filters))
    .limit(1);

  if (existing) {
    throw new EditorSeriesServiceError("A series with this slug already exists.", "DUPLICATE_SLUG");
  }
};

const toSeriesValues = (input: EditorSeriesInput) => ({
  title: input.title,
  slug: input.slug,
  overview: input.overview,
  releaseYear: input.releaseYear,
  status: input.status,
  network: input.network,
  creator: input.creator,
  cast: input.cast,
  posterUrl: input.posterUrl,
  backdropUrl: input.backdropUrl,
});

const syncSeriesGenres = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  seriesId: number,
  genreIds: number[],
) => {
  await tx.delete(seriesGenres).where(eq(seriesGenres.seriesId, seriesId));

  if (genreIds.length > 0) {
    await tx
      .insert(seriesGenres)
      .values(genreIds.map((genreId) => ({ seriesId, genreId })))
      .onConflictDoNothing();
  }
};

export const getEditorSeries = async (params: EditorSeriesListParams = {}) => {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const pageSize = normalizePositiveInteger(params.pageSize, DEFAULT_PAGE_SIZE);
  const search = params.search?.trim();
  const offset = (page - 1) * pageSize;
  const where = search ? ilike(series.title, `%${search}%`) : undefined;
  const baseQuery = db.select({ show: series }).from(series).$dynamic();
  const countQuery = db.select({ totalItems: countDistinct(series.id) }).from(series).$dynamic();

  if (where) {
    baseQuery.where(where);
    countQuery.where(where);
  }

  const [items, [pagination]] = await Promise.all([
    baseQuery.orderBy(desc(series.updatedAt), asc(series.title)).limit(pageSize).offset(offset),
    countQuery,
  ]);
  const seriesIds = items.map(({ show }) => show.id);
  const genresBySeriesId = await getGenresBySeriesIds(seriesIds);
  const totalItems = pagination?.totalItems ?? 0;

  return {
    items: items.map(({ show }) => ({ ...show, genres: genresBySeriesId.get(show.id) ?? [] })),
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    search: search ?? "",
  };
};

export const getEditorSeriesById = async (seriesId: number) => {
  const [show] = await db.select().from(series).where(eq(series.id, seriesId)).limit(1);

  if (!show) {
    return null;
  }

  const genresBySeriesId = await getGenresBySeriesIds([show.id]);

  return {
    ...show,
    genres: genresBySeriesId.get(show.id) ?? [],
  };
};

export const createEditorSeries = async (input: EditorSeriesInput) => {
  await assertUniqueSlug(input.slug);

  try {
    return db.transaction(async (tx) => {
      const [show] = await tx.insert(series).values(toSeriesValues(input)).returning();

      await syncSeriesGenres(tx, show.id, input.genreIds);

      return show;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EditorSeriesServiceError("A series with this slug already exists.", "DUPLICATE_SLUG");
    }
    throw error;
  }
};

export const updateEditorSeries = async (seriesId: number, input: EditorSeriesInput) => {
  await assertUniqueSlug(input.slug, seriesId);

  try {
    return db.transaction(async (tx) => {
      const [show] = await tx
        .update(series)
        .set({ ...toSeriesValues(input), updatedAt: new Date() })
        .where(eq(series.id, seriesId))
        .returning();

      if (!show) {
        return null;
      }

      await syncSeriesGenres(tx, show.id, input.genreIds);

      return show;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EditorSeriesServiceError("A series with this slug already exists.", "DUPLICATE_SLUG");
    }
    throw error;
  }
};

export const deleteEditorSeries = async (seriesId: number) => {
  const [deleted] = await db
    .delete(series)
    .where(eq(series.id, seriesId))
    .returning({ id: series.id });

  return Boolean(deleted);
};
