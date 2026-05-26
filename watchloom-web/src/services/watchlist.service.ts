import { and, asc, count, desc, eq, isNotNull, isNull } from "drizzle-orm";

import { db } from "@/db";
import { movies, series, watchlistItems, watchlists } from "@/db/schema";

type MediaType = "movie" | "series";
type WatchlistStatus = "watched" | "watching" | "to_watch";

type WatchlistRecord = typeof watchlists.$inferSelect;
type WatchlistItemRecord = typeof watchlistItems.$inferSelect;

export type CreateWatchlistInput = {
  name: string;
  description?: string | null;
};

export type UpdateWatchlistInput = {
  name?: string;
  description?: string | null;
};

export type AddWatchlistItemInput = {
  mediaType: MediaType;
  movieId?: number | null;
  seriesId?: number | null;
  status: WatchlistStatus;
  plannedWatchAt?: Date | string | null;
  rating?: number | null;
  notes?: string | null;
};

export type UpdateWatchlistItemInput = {
  status?: WatchlistStatus;
  plannedWatchAt?: Date | string | null;
  rating?: number | null;
  notes?: string | null;
};

export type WatchlistSummary = WatchlistRecord & {
  itemCount: number;
};

export type WatchlistItemWithMedia = WatchlistItemRecord & {
  media: {
    title: string;
    slug: string;
    posterUrl: string | null;
  } | null;
};

export type WatchlistWithItems = WatchlistRecord & {
  items: WatchlistItemWithMedia[];
};

export type PlannedWatchItem = WatchlistItemWithMedia & {
  watchlist: {
    id: number;
    name: string;
  };
};

export class WatchlistServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_INPUT"
      | "DUPLICATE_WATCHLIST"
      | "DUPLICATE_ITEM"
      | "MEDIA_NOT_FOUND",
  ) {
    super(message);
    this.name = "WatchlistServiceError";
  }
}

const isUniqueConstraintError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
};

const normalizeName = (name: string) => name.trim();

const normalizeDescription = (description?: string | null) => {
  if (description === undefined || description === null) {
    return description ?? null;
  }

  const value = description.trim();

  return value || null;
};

const normalizeDate = (value?: Date | string | null) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new WatchlistServiceError("Invalid planned watch date.", "INVALID_INPUT");
  }

  return date;
};

const assertRating = (rating?: number | null) => {
  if (rating === undefined || rating === null) {
    return;
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new WatchlistServiceError("Rating must be between 1 and 5.", "INVALID_INPUT");
  }
};

const assertStatus = (status?: WatchlistStatus) => {
  if (!status) {
    return;
  }

  if (status !== "watched" && status !== "watching" && status !== "to_watch") {
    throw new WatchlistServiceError("Invalid watchlist item status.", "INVALID_INPUT");
  }
};

const assertWatchlistItemMedia = (input: AddWatchlistItemInput) => {
  const hasMovieId = input.movieId !== undefined && input.movieId !== null;
  const hasSeriesId = input.seriesId !== undefined && input.seriesId !== null;

  if (hasMovieId && hasSeriesId) {
    throw new WatchlistServiceError(
      "Watchlist item cannot reference both movie and series.",
      "INVALID_INPUT",
    );
  }

  if (input.mediaType === "movie" && !hasMovieId) {
    throw new WatchlistServiceError("Movie watchlist items require movieId.", "INVALID_INPUT");
  }

  if (input.mediaType === "series" && !hasSeriesId) {
    throw new WatchlistServiceError("Series watchlist items require seriesId.", "INVALID_INPUT");
  }
};

const getOwnedWatchlist = async (userId: number, watchlistId: number) => {
  const [watchlist] = await db
    .select()
    .from(watchlists)
    .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
    .limit(1);

  return watchlist ?? null;
};

const ensureMediaExists = async (input: AddWatchlistItemInput) => {
  if (input.mediaType === "movie" && input.movieId) {
    const [movie] = await db
      .select({ id: movies.id })
      .from(movies)
      .where(eq(movies.id, input.movieId))
      .limit(1);

    if (!movie) {
      throw new WatchlistServiceError("Movie was not found.", "MEDIA_NOT_FOUND");
    }
  }

  if (input.mediaType === "series" && input.seriesId) {
    const [show] = await db
      .select({ id: series.id })
      .from(series)
      .where(eq(series.id, input.seriesId))
      .limit(1);

    if (!show) {
      throw new WatchlistServiceError("Series was not found.", "MEDIA_NOT_FOUND");
    }
  }
};

const getOwnedWatchlistItem = async (userId: number, watchlistItemId: number) => {
  const [item] = await db
    .select({ item: watchlistItems })
    .from(watchlistItems)
    .innerJoin(watchlists, eq(watchlistItems.watchlistId, watchlists.id))
    .where(and(eq(watchlistItems.id, watchlistItemId), eq(watchlists.userId, userId)))
    .limit(1);

  return item?.item ?? null;
};

const getDuplicateWatchlistItem = async (
  watchlistId: number,
  mediaType: MediaType,
  mediaId: number,
) => {
  const mediaFilter =
    mediaType === "movie"
      ? and(eq(watchlistItems.movieId, mediaId), isNull(watchlistItems.seriesId))
      : and(eq(watchlistItems.seriesId, mediaId), isNull(watchlistItems.movieId));

  const [item] = await db
    .select({ id: watchlistItems.id })
    .from(watchlistItems)
    .where(and(eq(watchlistItems.watchlistId, watchlistId), eq(watchlistItems.mediaType, mediaType), mediaFilter))
    .limit(1);

  return item ?? null;
};

export const getUserWatchlists = async (userId: number): Promise<WatchlistSummary[]> => {
  const rows = await db
    .select({
      watchlist: watchlists,
      itemCount: count(watchlistItems.id),
    })
    .from(watchlists)
    .leftJoin(watchlistItems, eq(watchlists.id, watchlistItems.watchlistId))
    .where(eq(watchlists.userId, userId))
    .groupBy(watchlists.id)
    .orderBy(desc(watchlists.updatedAt), desc(watchlists.createdAt));

  return rows.map((row) => ({
    ...row.watchlist,
    itemCount: row.itemCount,
  }));
};

export const getWatchlistById = async (
  userId: number,
  watchlistId: number,
): Promise<WatchlistWithItems | null> => {
  const watchlist = await getOwnedWatchlist(userId, watchlistId);

  if (!watchlist) {
    return null;
  }

  const rows = await db
    .select({
      item: watchlistItems,
      movie: {
        title: movies.title,
        slug: movies.slug,
        posterUrl: movies.posterUrl,
      },
      show: {
        title: series.title,
        slug: series.slug,
        posterUrl: series.posterUrl,
      },
    })
    .from(watchlistItems)
    .leftJoin(movies, eq(watchlistItems.movieId, movies.id))
    .leftJoin(series, eq(watchlistItems.seriesId, series.id))
    .where(eq(watchlistItems.watchlistId, watchlistId))
    .orderBy(desc(watchlistItems.updatedAt), desc(watchlistItems.createdAt));

  return {
    ...watchlist,
    items: rows.map((row) => ({
      ...row.item,
      media: row.item.mediaType === "movie" ? row.movie : row.show,
    })),
  };
};

export const getPlannedWatchItems = async (userId: number): Promise<PlannedWatchItem[]> => {
  const rows = await db
    .select({
      item: watchlistItems,
      watchlist: {
        id: watchlists.id,
        name: watchlists.name,
      },
      movie: {
        title: movies.title,
        slug: movies.slug,
        posterUrl: movies.posterUrl,
      },
      show: {
        title: series.title,
        slug: series.slug,
        posterUrl: series.posterUrl,
      },
    })
    .from(watchlistItems)
    .innerJoin(watchlists, eq(watchlistItems.watchlistId, watchlists.id))
    .leftJoin(movies, eq(watchlistItems.movieId, movies.id))
    .leftJoin(series, eq(watchlistItems.seriesId, series.id))
    .where(and(eq(watchlists.userId, userId), isNotNull(watchlistItems.plannedWatchAt)))
    .orderBy(asc(watchlistItems.plannedWatchAt), asc(watchlistItems.createdAt));

  return rows.map((row) => ({
    ...row.item,
    watchlist: row.watchlist,
    media: row.item.mediaType === "movie" ? row.movie : row.show,
  }));
};

export const createWatchlist = async (
  userId: number,
  input: CreateWatchlistInput,
): Promise<WatchlistRecord> => {
  const name = normalizeName(input.name);

  if (!name) {
    throw new WatchlistServiceError("Watchlist name is required.", "INVALID_INPUT");
  }

  try {
    const [watchlist] = await db
      .insert(watchlists)
      .values({
        userId,
        name,
        description: normalizeDescription(input.description),
      })
      .returning();

    return watchlist;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new WatchlistServiceError(
        "A watchlist with this name already exists.",
        "DUPLICATE_WATCHLIST",
      );
    }

    throw error;
  }
};

export const updateWatchlist = async (
  userId: number,
  watchlistId: number,
  input: UpdateWatchlistInput,
): Promise<WatchlistRecord | null> => {
  const watchlist = await getOwnedWatchlist(userId, watchlistId);

  if (!watchlist) {
    return null;
  }

  const updateValues: Partial<typeof watchlists.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) {
    const name = normalizeName(input.name);

    if (!name) {
      throw new WatchlistServiceError("Watchlist name is required.", "INVALID_INPUT");
    }

    updateValues.name = name;
  }

  if (input.description !== undefined) {
    updateValues.description = normalizeDescription(input.description);
  }

  try {
    const [updatedWatchlist] = await db
      .update(watchlists)
      .set(updateValues)
      .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
      .returning();

    return updatedWatchlist ?? null;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new WatchlistServiceError(
        "A watchlist with this name already exists.",
        "DUPLICATE_WATCHLIST",
      );
    }

    throw error;
  }
};

export const deleteWatchlist = async (userId: number, watchlistId: number): Promise<boolean> => {
  const [deletedWatchlist] = await db
    .delete(watchlists)
    .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
    .returning({ id: watchlists.id });

  return Boolean(deletedWatchlist);
};

export const addWatchlistItem = async (
  userId: number,
  watchlistId: number,
  input: AddWatchlistItemInput,
): Promise<WatchlistItemRecord> => {
  const watchlist = await getOwnedWatchlist(userId, watchlistId);

  if (!watchlist) {
    throw new WatchlistServiceError("Watchlist was not found.", "INVALID_INPUT");
  }

  assertStatus(input.status);
  assertRating(input.rating);
  assertWatchlistItemMedia(input);
  await ensureMediaExists(input);

  const mediaId = input.mediaType === "movie" ? input.movieId : input.seriesId;

  if (!mediaId) {
    throw new WatchlistServiceError("Media id is required.", "INVALID_INPUT");
  }

  const duplicateItem = await getDuplicateWatchlistItem(watchlistId, input.mediaType, mediaId);

  if (duplicateItem) {
    throw new WatchlistServiceError("This item is already in the watchlist.", "DUPLICATE_ITEM");
  }

  try {
    const [item] = await db
      .insert(watchlistItems)
      .values({
        watchlistId,
        mediaType: input.mediaType,
        movieId: input.mediaType === "movie" ? mediaId : null,
        seriesId: input.mediaType === "series" ? mediaId : null,
        status: input.status,
        plannedWatchAt: normalizeDate(input.plannedWatchAt) ?? null,
        rating: input.rating ?? null,
        notes: input.notes?.trim() || null,
      })
      .returning();

    await db.update(watchlists).set({ updatedAt: new Date() }).where(eq(watchlists.id, watchlistId));

    return item;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new WatchlistServiceError("This item is already in the watchlist.", "DUPLICATE_ITEM");
    }

    throw error;
  }
};

export const updateWatchlistItem = async (
  userId: number,
  watchlistItemId: number,
  input: UpdateWatchlistItemInput,
): Promise<WatchlistItemRecord | null> => {
  const item = await getOwnedWatchlistItem(userId, watchlistItemId);

  if (!item) {
    return null;
  }

  assertStatus(input.status);
  assertRating(input.rating);

  const updateValues: Partial<typeof watchlistItems.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.status !== undefined) {
    updateValues.status = input.status;
  }

  if (input.plannedWatchAt !== undefined) {
    updateValues.plannedWatchAt = normalizeDate(input.plannedWatchAt);
  }

  if (input.rating !== undefined) {
    updateValues.rating = input.rating;
  }

  if (input.notes !== undefined) {
    updateValues.notes = input.notes?.trim() || null;
  }

  const [updatedItem] = await db
    .update(watchlistItems)
    .set(updateValues)
    .where(eq(watchlistItems.id, watchlistItemId))
    .returning();

  if (updatedItem) {
    await db
      .update(watchlists)
      .set({ updatedAt: new Date() })
      .where(eq(watchlists.id, updatedItem.watchlistId));
  }

  return updatedItem ?? null;
};

export const removeWatchlistItem = async (
  userId: number,
  watchlistItemId: number,
): Promise<boolean> => {
  const item = await getOwnedWatchlistItem(userId, watchlistItemId);

  if (!item) {
    return false;
  }

  const [deletedItem] = await db
    .delete(watchlistItems)
    .where(eq(watchlistItems.id, watchlistItemId))
    .returning({ id: watchlistItems.id, watchlistId: watchlistItems.watchlistId });

  if (deletedItem) {
    await db
      .update(watchlists)
      .set({ updatedAt: new Date() })
      .where(eq(watchlists.id, deletedItem.watchlistId));
  }

  return Boolean(deletedItem);
};
