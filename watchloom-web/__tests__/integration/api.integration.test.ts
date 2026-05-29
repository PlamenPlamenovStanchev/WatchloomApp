import { eq } from "drizzle-orm";

import { GET as getMe } from "@/app/api/auth/me/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { POST as register } from "@/app/api/auth/register/route";
import { GET as getGenres } from "@/app/api/genres/route";
import { GET as getMovieBySlug } from "@/app/api/movies/[slug]/route";
import { GET as getMovies } from "@/app/api/movies/route";
import { GET as getSeriesBySlug } from "@/app/api/series/[slug]/route";
import { GET as getSeries } from "@/app/api/series/route";
import { users } from "@/db/schema";
import { canAccessPath } from "@/lib/auth/permissions";
import { loginUser } from "@/services/auth.service";
import {
  addFavourite,
  FavouriteServiceError,
  getUserFavourites,
  removeFavourite,
} from "@/services/favourite.service";
import {
  createReview,
  deleteReview,
  getPublicReviewsForMedia,
  getUserReviews,
  ReviewServiceError,
  updateReview,
} from "@/services/review.service";
import {
  addWatchlistItem,
  createWatchlist,
  deleteWatchlist,
  getWatchlistById,
  getUserWatchlists,
  removeWatchlistItem,
  updateWatchlist,
  updateWatchlistItem,
} from "@/services/watchlist.service";

import {
  authCookieFromResponse,
  bearerHeaderForUser,
  callRoute,
  expectFailure,
  expectSuccess,
} from "../../test/integration/helpers";
import { setupTestDatabase } from "../../test/integration/setup-test-db";
import { testDb } from "../../test/integration/test-db";

type SeedData = Awaited<ReturnType<typeof setupTestDatabase>>;

let seed: SeedData;

beforeAll(async () => {
  seed = await setupTestDatabase();
});

describe("auth API integration", () => {
  it("user can register and passwordHash is never returned", async () => {
    const { response, json } = await callRoute(register, "/api/auth/register", {
      body: {
        email: "new.integration@watchloom.dev",
        username: "New Integration User",
        password: "Password123!",
      },
    });
    const data = expectSuccess<{ user: Record<string, unknown> }>(json);

    expect(response.status).toBe(201);
    expect(data.user.email).toBe("new.integration@watchloom.dev");
    expect(data.user.passwordHash).toBeUndefined();
  });

  it("duplicate email fails", async () => {
    const { response, json } = await callRoute(register, "/api/auth/register", {
      body: {
        email: "user.integration@watchloom.dev",
        username: "Duplicate User",
        password: "Password123!",
      },
    });

    expect(response.status).toBe(409);
    expectFailure(json);
  });

  it("user can login and wrong password fails", async () => {
    const loginResponse = await callRoute(login, "/api/auth/login", {
      body: {
        email: "user.integration@watchloom.dev",
        password: "Password123!",
      },
    });
    const data = expectSuccess<{ accessToken: string; user: Record<string, unknown> }>(loginResponse.json);

    expect(loginResponse.response.status).toBe(200);
    expect(data.accessToken).toBeTruthy();
    expect(data.user.passwordHash).toBeUndefined();

    const wrongPasswordResponse = await callRoute(login, "/api/auth/login", {
      body: {
        email: "user.integration@watchloom.dev",
        password: "WrongPassword123!",
      },
    });

    expect(wrongPasswordResponse.response.status).toBe(401);
    expectFailure(wrongPasswordResponse.json);
  });

  it("me returns current user with valid bearer token and rejects invalid auth", async () => {
    const headers = await bearerHeaderForUser(seed.users.regularUser);
    const meResponse = await callRoute(getMe, "/api/auth/me", { headers });
    const data = expectSuccess<{ user: Record<string, unknown> }>(meResponse.json);

    expect(data.user.email).toBe("user.integration@watchloom.dev");
    expect(data.user.passwordHash).toBeUndefined();

    const invalidResponse = await callRoute(getMe, "/api/auth/me", {
      headers: { authorization: "Bearer invalid-token" },
    });

    expect(invalidResponse.response.status).toBe(401);
    expectFailure(invalidResponse.json);
  });

  it("logout clears the auth cookie", async () => {
    const loginResponse = await callRoute(login, "/api/auth/login", {
      body: {
        email: "user.integration@watchloom.dev",
        password: "Password123!",
      },
    });
    const cookie = authCookieFromResponse(loginResponse.response);
    const logoutResponse = await callRoute(logout, "/api/auth/logout", {
      method: "POST",
      headers: { cookie },
    });

    expect(logoutResponse.response.status).toBe(200);
    expect(logoutResponse.response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

describe("catalog API integration", () => {
  it("GET /api/movies returns data and pagination metadata", async () => {
    const { json } = await callRoute(getMovies, "/api/movies?page=1&pageSize=1");
    const data = expectSuccess<{ items: unknown[]; page: number; pageSize: number; totalItems: number }>(json);

    expect(data.items).toHaveLength(1);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(1);
    expect(data.totalItems).toBeGreaterThanOrEqual(2);
  });

  it("GET /api/movies/[slug] returns details and invalid slug returns 404", async () => {
    const found = await callRoute(getMovieBySlug, "/api/movies/the-matrix", {
      params: { slug: "the-matrix" },
    });
    const data = expectSuccess<{ title: string }>(found.json);

    expect(data.title).toBe("The Matrix");

    const missing = await callRoute(getMovieBySlug, "/api/movies/not-real", {
      params: { slug: "not-real" },
    });

    expect(missing.response.status).toBe(404);
    expectFailure(missing.json);
  });

  it("movie search query works", async () => {
    const { json } = await callRoute(getMovies, "/api/movies?q=arrival");
    const data = expectSuccess<{ items: Array<{ title: string }> }>(json);

    expect(data.items.map((movie) => movie.title)).toContain("Arrival");
  });

  it("GET /api/series and /api/series/[slug] work", async () => {
    const list = await callRoute(getSeries, "/api/series?q=breaking");
    const listData = expectSuccess<{ items: Array<{ title: string }> }>(list.json);

    expect(listData.items.map((show) => show.title)).toContain("Breaking Bad");

    const detail = await callRoute(getSeriesBySlug, "/api/series/breaking-bad", {
      params: { slug: "breaking-bad" },
    });
    const detailData = expectSuccess<{ title: string }>(detail.json);

    expect(detailData.title).toBe("Breaking Bad");

    const missing = await callRoute(getSeriesBySlug, "/api/series/not-real", {
      params: { slug: "not-real" },
    });

    expect(missing.response.status).toBe(404);
  });

  it("GET /api/genres returns seeded genres", async () => {
    const { json } = await callRoute(getGenres, "/api/genres");
    const data = expectSuccess<{ items: Array<{ name: string }> }>(json);

    expect(data.items.map((genre) => genre.name)).toEqual(
      expect.arrayContaining(["Drama", "Science Fiction"]),
    );
  });
});

describe("watchlist service integration with real DB", () => {
  it("lists, creates, views, edits, and deletes watchlists", async () => {
    const initial = await getUserWatchlists(seed.users.regularUser.id);

    expect(initial.some((watchlist) => watchlist.name === "Seed Watchlist")).toBe(true);

    const created = await createWatchlist(seed.users.regularUser.id, {
      name: "Integration List",
      description: "Created in an integration test.",
    });
    const viewed = await getWatchlistById(seed.users.regularUser.id, created.id);

    expect(viewed?.name).toBe("Integration List");

    const updated = await updateWatchlist(seed.users.regularUser.id, created.id, {
      name: "Updated Integration List",
    });

    expect(updated?.name).toBe("Updated Integration List");
    await expect(deleteWatchlist(seed.users.regularUser.id, created.id)).resolves.toBe(true);
  });

  it("adds, updates, and removes movie/series items", async () => {
    const watchlist = await createWatchlist(seed.users.regularUser.id, {
      name: "Item Integration List",
    });
    const item = await addWatchlistItem(seed.users.regularUser.id, watchlist.id, {
      mediaType: "series",
      seriesId: seed.series.breakingBad.id,
      status: "to_watch",
      rating: 5,
    });

    expect(item.seriesId).toBe(seed.series.breakingBad.id);

    const updated = await updateWatchlistItem(seed.users.regularUser.id, item.id, {
      status: "watched",
      rating: 4,
    });

    expect(updated?.status).toBe("watched");
    expect(updated?.rating).toBe(4);
    await expect(removeWatchlistItem(seed.users.regularUser.id, item.id)).resolves.toBe(true);
  });

  it("user cannot view or edit another user's watchlist", async () => {
    const otherUserView = await getWatchlistById(seed.users.secondUser.id, seed.watchlist.id);

    expect(otherUserView).toBeNull();
    await expect(
      updateWatchlist(seed.users.secondUser.id, seed.watchlist.id, { name: "Stolen" }),
    ).resolves.toBeNull();
    await expect(deleteWatchlist(seed.users.secondUser.id, seed.watchlist.id)).resolves.toBe(false);
  });
});

describe("favourite and review service integration with real DB", () => {
  it("creates, prevents duplicate, and removes favourite", async () => {
    const favourite = await addFavourite(seed.users.regularUser.id, "movie", seed.movies.arrival.id);

    expect(favourite.movieId).toBe(seed.movies.arrival.id);
    await expect(addFavourite(seed.users.regularUser.id, "movie", seed.movies.arrival.id)).rejects.toBeInstanceOf(
      FavouriteServiceError,
    );

    const favourites = await getUserFavourites(seed.users.regularUser.id);

    expect(favourites.some((item) => item.id === favourite.id)).toBe(true);
    await expect(removeFavourite(seed.users.regularUser.id, favourite.id)).resolves.toBe(true);
  });

  it("creates, edits own, deletes own review, and exposes public reviews", async () => {
    const review = await createReview(seed.users.regularUser.id, "movie", seed.movies.arrival.id, {
      rating: 5,
      title: "Thoughtful",
      content: "A strong test review.",
      isPublic: true,
    });

    const updated = await updateReview(seed.users.regularUser.id, review.id, {
      rating: 4,
      title: "Still thoughtful",
      content: "Updated content.",
      isPublic: true,
    });

    expect(updated?.rating).toBe(4);

    const publicReviews = await getPublicReviewsForMedia("movie", seed.movies.arrival.id);

    expect(publicReviews.some((item) => item.id === review.id)).toBe(true);
    await expect(deleteReview(seed.users.regularUser.id, review.id)).resolves.toBe(true);
  });

  it("user cannot edit or delete another user's review", async () => {
    const review = await createReview(seed.users.regularUser.id, "movie", seed.movies.matrix.id, {
      rating: 6,
      title: "Mine",
      content: "Owned by the regular user.",
      isPublic: true,
    });

    await expect(
      updateReview(seed.users.secondUser.id, review.id, {
        rating: 1,
        title: "Not mine",
        content: "Should not update.",
        isPublic: true,
      }),
    ).resolves.toBeNull();
    await expect(deleteReview(seed.users.secondUser.id, review.id)).resolves.toBe(false);

    const userReviews = await getUserReviews(seed.users.regularUser.id);

    expect(userReviews.some((item) => item.id === review.id && item.rating === 6)).toBe(true);
  });

  it("duplicate review is rejected", async () => {
    await expect(
      createReview(seed.users.regularUser.id, "series", seed.series.breakingBad.id, {
        rating: 5,
        title: "Duplicate",
        content: "Already reviewed in seed data.",
        isPublic: true,
      }),
    ).rejects.toBeInstanceOf(ReviewServiceError);
  });
});

describe("access control integration", () => {
  it("role-based path access matches admin/editor permissions", () => {
    expect(canAccessPath("user", "/editor/movies")).toBe(false);
    expect(canAccessPath("editor", "/editor/movies")).toBe(true);
    expect(canAccessPath("user", "/admin")).toBe(false);
    expect(canAccessPath("editor", "/admin")).toBe(false);
    expect(canAccessPath("admin", "/admin")).toBe(true);
  });

  it("regular and admin users can authenticate with seeded passwords", async () => {
    const regular = await loginUser({
      email: "user.integration@watchloom.dev",
      password: "Password123!",
    });
    const admin = await loginUser({
      email: "admin.integration@watchloom.dev",
      password: "Password123!",
    });

    expect(regular.user.role).toBe("user");
    expect(admin.user.role).toBe("admin");
    expect(regular.user).not.toHaveProperty("passwordHash");
    expect(admin.user).not.toHaveProperty("passwordHash");
  });

  it("seeded password hashes are not plain text", async () => {
    const rows = await testDb
      .select({ email: users.email, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, "user.integration@watchloom.dev"));

    expect(rows[0]?.passwordHash).toBeTruthy();
    expect(rows[0]?.passwordHash).not.toBe("Password123!");
  });
});
