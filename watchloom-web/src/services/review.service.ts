import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { movies, reviews, series, users } from "@/db/schema";

type MediaType = "movie" | "series";
type ReviewRecord = typeof reviews.$inferSelect;

export type ReviewInput = {
  rating: number;
  title?: string | null;
  content: string;
  isPublic: boolean;
};

export type ReviewWithMedia = ReviewRecord & {
  media: { title: string; slug: string } | null;
};

export type PublicReview = ReviewRecord & {
  user: { username: string };
};

export class ReviewServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_INPUT" | "DUPLICATE_REVIEW" | "MEDIA_NOT_FOUND",
  ) {
    super(message);
    this.name = "ReviewServiceError";
  }
}

const isUniqueConstraintError = (error: unknown) => {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
};

const normalizeInput = (input: ReviewInput) => {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 6) {
    throw new ReviewServiceError("Rating must be between 1 and 6.", "INVALID_INPUT");
  }

  const content = input.content.trim();
  if (!content) {
    throw new ReviewServiceError("Review content is required.", "INVALID_INPUT");
  }

  return {
    rating: input.rating,
    title: input.title?.trim() || null,
    content,
    isPublic: input.isPublic,
  };
};

const assertMediaExists = async (mediaType: MediaType, mediaId: number) => {
  if (mediaType === "movie") {
    const [movie] = await db.select({ id: movies.id }).from(movies).where(eq(movies.id, mediaId)).limit(1);
    if (!movie) throw new ReviewServiceError("Movie was not found.", "MEDIA_NOT_FOUND");
  } else {
    const [show] = await db.select({ id: series.id }).from(series).where(eq(series.id, mediaId)).limit(1);
    if (!show) throw new ReviewServiceError("Series was not found.", "MEDIA_NOT_FOUND");
  }
};

export const getUserReviews = async (userId: number): Promise<ReviewWithMedia[]> => {
  const rows = await db
    .select({
      review: reviews,
      movie: { title: movies.title, slug: movies.slug },
      show: { title: series.title, slug: series.slug },
    })
    .from(reviews)
    .leftJoin(movies, eq(reviews.movieId, movies.id))
    .leftJoin(series, eq(reviews.seriesId, series.id))
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.updatedAt), desc(reviews.createdAt));

  return rows.map((row) => ({
    ...row.review,
    media: row.review.mediaType === "movie" ? row.movie : row.show,
  }));
};

export const getPublicReviewsForMedia = async (
  mediaType: MediaType,
  mediaId: number,
): Promise<PublicReview[]> => {
  const mediaFilter = mediaType === "movie" ? eq(reviews.movieId, mediaId) : eq(reviews.seriesId, mediaId);
  const rows = await db
    .select({ review: reviews, user: { username: users.name } })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.mediaType, mediaType), mediaFilter, eq(reviews.isPublic, true)))
    .orderBy(desc(reviews.createdAt));

  return rows.map((row) => ({ ...row.review, user: row.user }));
};

export const getUserReviewForMedia = async (userId: number, mediaType: MediaType, mediaId: number) => {
  const mediaFilter = mediaType === "movie" ? eq(reviews.movieId, mediaId) : eq(reviews.seriesId, mediaId);
  const [review] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.mediaType, mediaType), mediaFilter))
    .limit(1);

  return review ?? null;
};

export const createReview = async (
  userId: number,
  mediaType: MediaType,
  mediaId: number,
  input: ReviewInput,
) => {
  await assertMediaExists(mediaType, mediaId);
  const values = normalizeInput(input);

  try {
    const [review] = await db
      .insert(reviews)
      .values({
        userId,
        mediaType,
        movieId: mediaType === "movie" ? mediaId : null,
        seriesId: mediaType === "series" ? mediaId : null,
        ...values,
      })
      .returning();

    return review;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ReviewServiceError("You already reviewed this title.", "DUPLICATE_REVIEW");
    }
    throw error;
  }
};

export const updateReview = async (userId: number, reviewId: number, input: ReviewInput) => {
  const values = normalizeInput(input);
  const [review] = await db
    .update(reviews)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
    .returning();

  return review ?? null;
};

export const deleteReview = async (userId: number, reviewId: number) => {
  const [deleted] = await db
    .delete(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
    .returning({ id: reviews.id });

  return Boolean(deleted);
};
