import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { favourites, movies, series } from "@/db/schema";

type MediaType = "movie" | "series";
type FavouriteRecord = typeof favourites.$inferSelect;

export type FavouriteWithMedia = FavouriteRecord & {
  media: {
    title: string;
    slug: string;
    posterUrl: string | null;
    releaseYear: number | null;
  } | null;
};

export class FavouriteServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_INPUT" | "DUPLICATE_FAVOURITE" | "MEDIA_NOT_FOUND",
  ) {
    super(message);
    this.name = "FavouriteServiceError";
  }
}

const isUniqueConstraintError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("code" in error && error.code === "23505") {
    return true;
  }

  return "cause" in error && isUniqueConstraintError(error.cause);
};

const assertMediaExists = async (mediaType: MediaType, mediaId: number) => {
  if (mediaType === "movie") {
    const [movie] = await db.select({ id: movies.id }).from(movies).where(eq(movies.id, mediaId)).limit(1);
    if (!movie) throw new FavouriteServiceError("Movie was not found.", "MEDIA_NOT_FOUND");
  } else {
    const [show] = await db.select({ id: series.id }).from(series).where(eq(series.id, mediaId)).limit(1);
    if (!show) throw new FavouriteServiceError("Series was not found.", "MEDIA_NOT_FOUND");
  }
};

export const getUserFavourites = async (userId: number): Promise<FavouriteWithMedia[]> => {
  const rows = await db
    .select({
      favourite: favourites,
      movie: { title: movies.title, slug: movies.slug, posterUrl: movies.posterUrl, releaseYear: movies.releaseYear },
      show: { title: series.title, slug: series.slug, posterUrl: series.posterUrl, releaseYear: series.releaseYear },
    })
    .from(favourites)
    .leftJoin(movies, eq(favourites.movieId, movies.id))
    .leftJoin(series, eq(favourites.seriesId, series.id))
    .where(eq(favourites.userId, userId))
    .orderBy(desc(favourites.createdAt));

  return rows.map((row) => ({
    ...row.favourite,
    media: row.favourite.mediaType === "movie" ? row.movie : row.show,
  }));
};

export const getUserFavouriteForMedia = async (
  userId: number,
  mediaType: MediaType,
  mediaId: number,
) => {
  const mediaFilter = mediaType === "movie" ? eq(favourites.movieId, mediaId) : eq(favourites.seriesId, mediaId);
  const [favourite] = await db
    .select()
    .from(favourites)
    .where(and(eq(favourites.userId, userId), eq(favourites.mediaType, mediaType), mediaFilter))
    .limit(1);

  return favourite ?? null;
};

export const addFavourite = async (userId: number, mediaType: MediaType, mediaId: number) => {
  await assertMediaExists(mediaType, mediaId);

  try {
    const [favourite] = await db
      .insert(favourites)
      .values({
        userId,
        mediaType,
        movieId: mediaType === "movie" ? mediaId : null,
        seriesId: mediaType === "series" ? mediaId : null,
      })
      .returning();

    return favourite;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new FavouriteServiceError("This title is already in your favourites.", "DUPLICATE_FAVOURITE");
    }
    throw error;
  }
};

export const removeFavourite = async (userId: number, favouriteId: number) => {
  const [deleted] = await db
    .delete(favourites)
    .where(and(eq(favourites.id, favouriteId), eq(favourites.userId, userId)))
    .returning({ id: favourites.id });

  return Boolean(deleted);
};

export const removeFavouriteForMedia = async (
  userId: number,
  mediaType: MediaType,
  mediaId: number,
) => {
  const mediaFilter = mediaType === "movie" ? eq(favourites.movieId, mediaId) : eq(favourites.seriesId, mediaId);
  const [deleted] = await db
    .delete(favourites)
    .where(and(eq(favourites.userId, userId), eq(favourites.mediaType, mediaType), mediaFilter))
    .returning({ id: favourites.id });

  return Boolean(deleted);
};
