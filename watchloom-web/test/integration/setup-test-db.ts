import "dotenv/config";

import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { hashPassword } from "@/lib/auth/password";
import {
  episodes,
  genres,
  movieGenres,
  movies,
  reviews,
  seasons,
  series,
  seriesGenres,
  users,
  watchlistItems,
  watchlists,
} from "@/db/schema";

import { pool, testDb } from "./test-db";

const appTables = [
  "media_assets",
  "favourites",
  "reviews",
  "watchlist_items",
  "watchlists",
  "episodes",
  "seasons",
  "movie_people",
  "series_people",
  "people",
  "movie_genres",
  "series_genres",
  "genres",
  "movies",
  "series",
  "password_reset_tokens",
  "oauth_accounts",
  "contact_messages",
  "users",
];

export const resetTestDatabase = async () => {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL is required for integration tests.");
  }

  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL) {
    throw new Error("Refusing to reset a database that is not TEST_DATABASE_URL.");
  }

  await migrate(testDb, { migrationsFolder: "./drizzle" });
  await testDb.execute(
    sql.raw(`truncate table ${appTables.map((table) => `"${table}"`).join(", ")} restart identity cascade`),
  );
};

export const seedTestDatabase = async () => {
  const passwordHash = await hashPassword("Password123!");

  const [regularUser, secondUser, editorUser, adminUser] = await testDb
    .insert(users)
    .values([
      {
        name: "Regular User",
        email: "user.integration@watchloom.dev",
        passwordHash,
        role: "user",
      },
      {
        name: "Second User",
        email: "second.integration@watchloom.dev",
        passwordHash,
        role: "user",
      },
      {
        name: "Editor User",
        email: "editor.integration@watchloom.dev",
        passwordHash,
        role: "editor",
      },
      {
        name: "Admin User",
        email: "admin.integration@watchloom.dev",
        passwordHash,
        role: "admin",
      },
    ])
    .returning();

  const [drama, sciFi] = await testDb
    .insert(genres)
    .values([
      { name: "Drama", slug: "drama" },
      { name: "Science Fiction", slug: "science-fiction" },
    ])
    .returning();

  const [matrix, arrival] = await testDb
    .insert(movies)
    .values([
      {
        title: "The Matrix",
        slug: "the-matrix",
        overview: "A hacker discovers reality is not what it seems.",
        releaseYear: 1999,
        posterUrl: "https://example.test/matrix.jpg",
      },
      {
        title: "Arrival",
        slug: "arrival",
        overview: "A linguist works to communicate with visitors.",
        releaseYear: 2016,
        posterUrl: "https://example.test/arrival.jpg",
      },
    ])
    .returning();

  const [breakingBad, andor] = await testDb
    .insert(series)
    .values([
      {
        title: "Breaking Bad",
        slug: "breaking-bad",
        overview: "A chemistry teacher enters the drug trade.",
        releaseYear: 2008,
        status: "Ended",
        posterUrl: "https://example.test/breaking-bad.jpg",
      },
      {
        title: "Andor",
        slug: "andor",
        overview: "A rebellion begins in quiet places.",
        releaseYear: 2022,
        status: "Returning",
        posterUrl: "https://example.test/andor.jpg",
      },
    ])
    .returning();

  await testDb.insert(movieGenres).values([
    { movieId: matrix.id, genreId: sciFi.id },
    { movieId: arrival.id, genreId: sciFi.id },
    { movieId: arrival.id, genreId: drama.id },
  ]);

  await testDb.insert(seriesGenres).values([
    { seriesId: breakingBad.id, genreId: drama.id },
    { seriesId: andor.id, genreId: sciFi.id },
  ]);

  const [season] = await testDb
    .insert(seasons)
    .values({
      seriesId: breakingBad.id,
      seasonNumber: 1,
      title: "Season 1",
      releaseYear: 2008,
    })
    .returning();

  await testDb.insert(episodes).values({
    seasonId: season.id,
    episodeNumber: 1,
    title: "Pilot",
    overview: "Walter White starts down a dangerous road.",
    durationMinutes: 58,
    airDate: "2008-01-20",
  });

  const [watchlist] = await testDb
    .insert(watchlists)
    .values({
      userId: regularUser.id,
      name: "Seed Watchlist",
      description: "Seeded integration watchlist.",
    })
    .returning();

  await testDb.insert(watchlistItems).values({
    watchlistId: watchlist.id,
    mediaType: "movie",
    movieId: matrix.id,
    status: "to_watch",
  });

  await testDb.insert(reviews).values({
    userId: regularUser.id,
    mediaType: "series",
    seriesId: breakingBad.id,
    rating: 6,
    title: "Excellent",
    content: "Still gripping.",
    isPublic: true,
  });

  return {
    users: { regularUser, secondUser, editorUser, adminUser },
    movies: { matrix, arrival },
    series: { breakingBad, andor },
    genres: { drama, sciFi },
    watchlist,
  };
};

export const setupTestDatabase = async () => {
  await resetTestDatabase();
  return seedTestDatabase();
};

if (process.argv[1]?.endsWith("setup-test-db.ts")) {
  setupTestDatabase()
    .then(async () => {
      await pool.end();
      console.log("Test database reset and seeded.");
    })
    .catch(async (error) => {
      await pool.end();
      console.error(error);
      process.exitCode = 1;
    });
}
