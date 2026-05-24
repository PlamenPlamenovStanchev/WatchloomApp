import "dotenv/config";

import bcrypt from "bcrypt";
import { inArray } from "drizzle-orm";

import { db, pool } from "./index";
import {
  episodes,
  genres,
  movieGenres,
  movies,
  seasons,
  series,
  seriesGenres,
  users,
} from "./schema";
import { seedGenres } from "./seed-data/genres";
import { seedMovies } from "./seed-data/movies";
import { seedSeries } from "./seed-data/series";
import { seedUsers } from "./seed-data/users";

const SALT_ROUNDS = 12;
const EPISODES_PER_SEASON = 5;
const SEASONS_PER_SERIES = 5;
const EPISODE_TITLES = [
  ["Pilot", "First Steps", "New Rules", "Pressure Point", "Aftermath"],
  ["The Return", "Fault Lines", "Hidden Truths", "Crossroads", "Reckoning"],
  ["Old Wounds", "The Long Night", "Breaking Point", "The Choice", "Fallout"],
  ["Rising Tide", "No Safe Place", "The Plan", "Into the Storm", "Turning Point"],
  ["Echoes", "Last Chances", "The Betrayal", "Endgame", "New Dawn"],
] as const;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const firstDayOfYear = (year: number) => `${year}-01-01`;

const getRequiredGenreId = (genreMap: Map<string, number>, name: string) => {
  const genreId = genreMap.get(slugify(name));

  if (!genreId) {
    throw new Error(`Missing seeded genre: ${name}`);
  }

  return genreId;
};

const assertSeedShape = () => {
  if (seedMovies.length !== 100) {
    throw new Error(`Expected 100 seed movies, received ${seedMovies.length}`);
  }

  if (seedSeries.length !== 100) {
    throw new Error(`Expected 100 seed series, received ${seedSeries.length}`);
  }
};

const insertInBatches = async <T>(items: T[], insert: (batch: T[]) => Promise<void>) => {
  const batchSize = 500;

  for (let index = 0; index < items.length; index += batchSize) {
    await insert(items.slice(index, index + batchSize));
  }
};

const main = async () => {
  assertSeedShape();

  await db.transaction(async (tx) => {
    const usersWithHashes = await Promise.all(
      seedUsers.map(async (user) => ({
        name: user.name,
        email: user.email,
        passwordHash: await bcrypt.hash(user.password, SALT_ROUNDS),
        role: user.role,
      })),
    );

    await tx.insert(users).values(usersWithHashes).onConflictDoNothing({ target: users.email });

    await tx
      .insert(genres)
      .values(seedGenres.map((name) => ({ name, slug: slugify(name) })))
      .onConflictDoNothing({ target: genres.slug });

    await tx
      .insert(movies)
      .values(
        seedMovies.map((movie) => ({
          title: movie.title,
          slug: movie.slug,
          overview: movie.description,
          releaseDate: firstDayOfYear(movie.releaseYear),
          releaseYear: movie.releaseYear,
          durationMinutes: movie.durationMinutes,
          director: movie.director,
          writer: movie.writer,
          cast: movie.cast,
          posterUrl: null,
          backdropUrl: null,
        })),
      )
      .onConflictDoNothing({ target: movies.slug });

    await tx
      .insert(series)
      .values(
        seedSeries.map((show) => ({
          title: show.title,
          slug: show.slug,
          overview: show.description,
          firstAirDate: firstDayOfYear(show.releaseYear),
          posterUrl: null,
          backdropUrl: null,
        })),
      )
      .onConflictDoNothing({ target: series.slug });

    const genreRows = await tx.select({ id: genres.id, slug: genres.slug }).from(genres);
    const movieRows = await tx
      .select({ id: movies.id, slug: movies.slug })
      .from(movies)
      .where(inArray(movies.slug, seedMovies.map((movie) => movie.slug)));
    const seriesRows = await tx
      .select({ id: series.id, slug: series.slug })
      .from(series)
      .where(inArray(series.slug, seedSeries.map((show) => show.slug)));

    const genreMap = new Map(genreRows.map((genre) => [genre.slug, genre.id]));
    const movieMap = new Map(movieRows.map((movie) => [movie.slug, movie.id]));
    const seriesMap = new Map(seriesRows.map((show) => [show.slug, show.id]));

    const movieGenreRows = seedMovies.flatMap((movie) => {
      const movieId = movieMap.get(movie.slug);

      if (!movieId) {
        throw new Error(`Missing seeded movie: ${movie.title}`);
      }

      return movie.genres.map((genreName) => ({
        movieId,
        genreId: getRequiredGenreId(genreMap, genreName),
      }));
    });

    await tx.insert(movieGenres).values(movieGenreRows).onConflictDoNothing();

    const seriesGenreRows = seedSeries.flatMap((show) => {
      const seriesId = seriesMap.get(show.slug);

      if (!seriesId) {
        throw new Error(`Missing seeded series: ${show.title}`);
      }

      return show.genres.map((genreName) => ({
        seriesId,
        genreId: getRequiredGenreId(genreMap, genreName),
      }));
    });

    await tx.insert(seriesGenres).values(seriesGenreRows).onConflictDoNothing();

    const seasonRows = seedSeries.flatMap((show) => {
      const seriesId = seriesMap.get(show.slug);

      if (!seriesId) {
        throw new Error(`Missing seeded series for seasons: ${show.title}`);
      }

      return Array.from({ length: SEASONS_PER_SERIES }, (_, index) => {
        const seasonNumber = index + 1;

        return {
          seriesId,
          seasonNumber,
          title: `Season ${seasonNumber}`,
          overview: `${show.title} season ${seasonNumber} continues the story with new conflicts and choices.`,
          releaseDate: firstDayOfYear(show.releaseYear + index),
        };
      });
    });

    await insertInBatches(seasonRows, async (batch) => {
      await tx
        .insert(seasons)
        .values(batch)
        .onConflictDoNothing({ target: [seasons.seriesId, seasons.seasonNumber] });
    });

    const insertedSeasonRows = await tx
      .select({
        id: seasons.id,
        seriesId: seasons.seriesId,
        seasonNumber: seasons.seasonNumber,
      })
      .from(seasons)
      .where(inArray(seasons.seriesId, [...seriesMap.values()]));

    const seasonMap = new Map(
      insertedSeasonRows.map((season) => [`${season.seriesId}:${season.seasonNumber}`, season.id]),
    );

    const episodeRows = seedSeries.flatMap((show) => {
      const seriesId = seriesMap.get(show.slug);

      if (!seriesId) {
        throw new Error(`Missing seeded series for episodes: ${show.title}`);
      }

      return Array.from({ length: SEASONS_PER_SERIES }, (_, seasonIndex) => {
        const seasonNumber = seasonIndex + 1;
        const seasonId = seasonMap.get(`${seriesId}:${seasonNumber}`);

        if (!seasonId) {
          throw new Error(`Missing season ${seasonNumber} for ${show.title}`);
        }

        return Array.from({ length: EPISODES_PER_SEASON }, (_, episodeIndex) => {
          const episodeNumber = episodeIndex + 1;

          return {
            seasonId,
            episodeNumber,
            title: EPISODE_TITLES[seasonIndex][episodeIndex],
            overview: `${show.title} reaches ${EPISODE_TITLES[seasonIndex][episodeIndex].toLowerCase()} in season ${seasonNumber}.`,
            airDate: firstDayOfYear(show.releaseYear + seasonIndex),
          };
        });
      }).flat();
    });

    await insertInBatches(episodeRows, async (batch) => {
      await tx
        .insert(episodes)
        .values(batch)
        .onConflictDoNothing({ target: [episodes.seasonId, episodes.episodeNumber] });
    });
  });

  console.log("Seed completed successfully.");
  console.log(`Seeded ${seedUsers.length} users, ${seedGenres.length} genres, ${seedMovies.length} movies, and ${seedSeries.length} series.`);
  console.log(`Ensured ${seedSeries.length * SEASONS_PER_SERIES} seasons and ${seedSeries.length * SEASONS_PER_SERIES * EPISODES_PER_SEASON} episodes.`);
};

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
