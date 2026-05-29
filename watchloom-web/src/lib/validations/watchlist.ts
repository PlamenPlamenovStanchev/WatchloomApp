import { z } from "zod";

export const watchlistStatusValues = ["to_watch", "watching", "watched"] as const;

export const watchlistNameSchema = z
  .string()
  .trim()
  .min(1, "Watchlist name is required.")
  .max(100, "Watchlist name is too long.");

export const watchlistStatusSchema = z.enum(watchlistStatusValues, {
  message: "Select a valid watchlist status.",
});

export const watchlistRatingSchema = z
  .number()
  .int("Rating must be a whole number.")
  .min(1, "Rating must be at least 1.")
  .max(5, "Rating must be at most 5.");

export const createWatchlistSchema = z.object({
  name: watchlistNameSchema,
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
});

export const watchlistItemMetadataSchema = z.object({
  status: watchlistStatusSchema,
  rating: watchlistRatingSchema.nullish(),
});

export type CreateWatchlistInput = z.infer<typeof createWatchlistSchema>;
export type WatchlistItemMetadataInput = z.infer<typeof watchlistItemMetadataSchema>;
