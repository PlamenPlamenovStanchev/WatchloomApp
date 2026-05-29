import {
  createWatchlistSchema,
  watchlistItemMetadataSchema,
  watchlistRatingSchema,
  watchlistStatusSchema,
} from "@/lib/validations/watchlist";

describe("watchlist validation schemas", () => {
  it("valid watchlist name passes", () => {
    const result = createWatchlistSchema.safeParse({
      name: "Weekend movies",
    });

    expect(result.success).toBe(true);
  });

  it("invalid empty watchlist name fails", () => {
    const result = createWatchlistSchema.safeParse({
      name: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("valid status passes", () => {
    expect(watchlistStatusSchema.safeParse("watching").success).toBe(true);
  });

  it("invalid status fails", () => {
    expect(watchlistStatusSchema.safeParse("paused").success).toBe(false);
  });

  it("rating must be between 1 and 5", () => {
    expect(watchlistRatingSchema.safeParse(1).success).toBe(true);
    expect(watchlistRatingSchema.safeParse(5).success).toBe(true);
    expect(watchlistRatingSchema.safeParse(0).success).toBe(false);
    expect(watchlistRatingSchema.safeParse(6).success).toBe(false);
  });

  it("valid watchlist item metadata passes", () => {
    const result = watchlistItemMetadataSchema.safeParse({
      status: "watched",
      rating: 4,
    });

    expect(result.success).toBe(true);
  });
});
