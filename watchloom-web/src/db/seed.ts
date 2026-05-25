import "dotenv/config";

import bcrypt from "bcrypt";
import { eq, inArray } from "drizzle-orm";

import { db, pool } from "./index";
import {
  contactMessages,
  episodes,
  favourites,
  genres,
  movieGenres,
  moviePeople,
  movies,
  people,
  reviews,
  seasons,
  series,
  seriesGenres,
  seriesPeople,
  users,
  watchlistItems,
  watchlists,
} from "./schema";
import { seedGenres } from "./seed-data/genres";
import { seedMovies } from "./seed-data/movies";
import { seedMoviePeople, seedPeople, seedSeriesPeople } from "./seed-data/people";
import { seedSeries } from "./seed-data/series";
import {
  seedContactMessages,
  seedFavourites,
  seedReviews,
  seedWatchlistItems,
  seedWatchlists,
} from "./seed-data/user-features";
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

const logSkippedSeed = (label: string, reason: string) => {
  console.warn(`Skipping ${label}: ${reason}`);
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
          releaseYear: show.releaseYear,
          status: show.status,
          network: show.network,
          creator: show.creator,
          cast: show.cast,
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

    await tx
      .insert(people)
      .values(
        seedPeople.map((person) => ({
          name: person.name,
          slug: person.slug,
          biography: person.biography ?? null,
          birthDate: person.birthDate ?? null,
          photoUrl: person.photoUrl ?? null,
        })),
      )
      .onConflictDoNothing({ target: people.slug });

    const userRows = await tx
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(inArray(users.email, seedUsers.map((user) => user.email)));
    const personRows = await tx
      .select({ id: people.id, slug: people.slug })
      .from(people)
      .where(inArray(people.slug, seedPeople.map((person) => person.slug)));

    const userMap = new Map(userRows.map((user) => [user.email, user]));
    const personMap = new Map(personRows.map((person) => [person.slug, person.id]));

    const moviePersonRows = seedMoviePeople.flatMap((relation) => {
      const movieId = movieMap.get(relation.movieSlug);
      const personId = personMap.get(relation.personSlug);

      if (!movieId) {
        logSkippedSeed("movie_people", `movie ${relation.movieSlug} is missing`);
        return [];
      }

      if (!personId) {
        logSkippedSeed("movie_people", `person ${relation.personSlug} is missing`);
        return [];
      }

      return [{ movieId, personId, role: relation.role }];
    });

    if (moviePersonRows.length > 0) {
      await tx.insert(moviePeople).values(moviePersonRows).onConflictDoNothing();
    }

    const seriesPersonRows = seedSeriesPeople.flatMap((relation) => {
      const seriesId = seriesMap.get(relation.seriesSlug);
      const personId = personMap.get(relation.personSlug);

      if (!seriesId) {
        logSkippedSeed("series_people", `series ${relation.seriesSlug} is missing`);
        return [];
      }

      if (!personId) {
        logSkippedSeed("series_people", `person ${relation.personSlug} is missing`);
        return [];
      }

      return [{ seriesId, personId, role: relation.role }];
    });

    if (seriesPersonRows.length > 0) {
      await tx.insert(seriesPeople).values(seriesPersonRows).onConflictDoNothing();
    }

    const watchlistRows = seedWatchlists.flatMap((watchlist) => {
      const user = userMap.get(watchlist.userEmail);

      if (!user) {
        logSkippedSeed("watchlists", `user ${watchlist.userEmail} is missing`);
        return [];
      }

      return [
        {
          userId: user.id,
          name: watchlist.name,
          description: watchlist.description ?? null,
          isDefault: watchlist.isDefault ?? false,
        },
      ];
    });

    if (watchlistRows.length > 0) {
      await tx
        .insert(watchlists)
        .values(watchlistRows)
        .onConflictDoNothing({ target: [watchlists.userId, watchlists.name] });
    }

    const watchlistOwnerRows = await tx
      .select({
        id: watchlists.id,
        name: watchlists.name,
        userId: watchlists.userId,
        userEmail: users.email,
      })
      .from(watchlists)
      .innerJoin(users, eq(watchlists.userId, users.id))
      .where(inArray(users.email, seedWatchlists.map((watchlist) => watchlist.userEmail)));
    const watchlistMap = new Map(
      watchlistOwnerRows.map((watchlist) => [
        `${watchlist.userEmail}:${watchlist.name}`,
        watchlist.id,
      ]),
    );

    const existingWatchlistItemRows = await tx
      .select({
        watchlistId: watchlistItems.watchlistId,
        mediaType: watchlistItems.mediaType,
        movieId: watchlistItems.movieId,
        seriesId: watchlistItems.seriesId,
      })
      .from(watchlistItems)
      .where(inArray(watchlistItems.watchlistId, [...watchlistMap.values()]));
    const existingWatchlistItemKeys = new Set(
      existingWatchlistItemRows.map((item) =>
        item.mediaType === "movie"
          ? `${item.watchlistId}:movie:${item.movieId}`
          : `${item.watchlistId}:series:${item.seriesId}`,
      ),
    );
    const newWatchlistItemKeys = new Set<string>();
    const watchlistItemRows = seedWatchlistItems.flatMap((item) => {
      const watchlistId = watchlistMap.get(`${item.userEmail}:${item.watchlistName}`);
      const movieId = item.mediaType === "movie" ? movieMap.get(item.mediaSlug) : undefined;
      const seriesId = item.mediaType === "series" ? seriesMap.get(item.mediaSlug) : undefined;

      if (!watchlistId) {
        logSkippedSeed(
          "watchlist_items",
          `watchlist ${item.watchlistName} for ${item.userEmail} is missing`,
        );
        return [];
      }

      if (item.mediaType === "movie" && !movieId) {
        logSkippedSeed("watchlist_items", `movie ${item.mediaSlug} is missing`);
        return [];
      }

      if (item.mediaType === "series" && !seriesId) {
        logSkippedSeed("watchlist_items", `series ${item.mediaSlug} is missing`);
        return [];
      }

      const key =
        item.mediaType === "movie"
          ? `${watchlistId}:movie:${movieId}`
          : `${watchlistId}:series:${seriesId}`;

      if (existingWatchlistItemKeys.has(key) || newWatchlistItemKeys.has(key)) {
        return [];
      }

      newWatchlistItemKeys.add(key);

      return [
        {
          watchlistId,
          mediaType: item.mediaType,
          movieId: movieId ?? null,
          seriesId: seriesId ?? null,
          status: item.status,
          plannedWatchAt: item.plannedWatchAt ? new Date(item.plannedWatchAt) : null,
          rating: item.rating ?? null,
          notes: item.notes ?? null,
        },
      ];
    });

    if (watchlistItemRows.length > 0) {
      await tx.insert(watchlistItems).values(watchlistItemRows);
    }

    const reviewRows = seedReviews.flatMap((review) => {
      const user = userMap.get(review.userEmail);
      const movieId = review.mediaType === "movie" ? movieMap.get(review.mediaSlug) : undefined;
      const seriesId = review.mediaType === "series" ? seriesMap.get(review.mediaSlug) : undefined;

      if (!user) {
        logSkippedSeed("reviews", `user ${review.userEmail} is missing`);
        return [];
      }

      if (review.mediaType === "movie" && !movieId) {
        logSkippedSeed("reviews", `movie ${review.mediaSlug} is missing`);
        return [];
      }

      if (review.mediaType === "series" && !seriesId) {
        logSkippedSeed("reviews", `series ${review.mediaSlug} is missing`);
        return [];
      }

      return [
        {
          userId: user.id,
          mediaType: review.mediaType,
          movieId: movieId ?? null,
          seriesId: seriesId ?? null,
          rating: review.rating,
          title: review.title ?? null,
          content: review.content,
          isPublic: review.isPublic ?? true,
        },
      ];
    });

    if (reviewRows.length > 0) {
      await tx.insert(reviews).values(reviewRows).onConflictDoNothing();
    }

    const favouriteRows = seedFavourites.flatMap((favourite) => {
      const user = userMap.get(favourite.userEmail);
      const movieId =
        favourite.mediaType === "movie" ? movieMap.get(favourite.mediaSlug) : undefined;
      const seriesId =
        favourite.mediaType === "series" ? seriesMap.get(favourite.mediaSlug) : undefined;

      if (!user) {
        logSkippedSeed("favourites", `user ${favourite.userEmail} is missing`);
        return [];
      }

      if (favourite.mediaType === "movie" && !movieId) {
        logSkippedSeed("favourites", `movie ${favourite.mediaSlug} is missing`);
        return [];
      }

      if (favourite.mediaType === "series" && !seriesId) {
        logSkippedSeed("favourites", `series ${favourite.mediaSlug} is missing`);
        return [];
      }

      return [
        {
          userId: user.id,
          mediaType: favourite.mediaType,
          movieId: movieId ?? null,
          seriesId: seriesId ?? null,
        },
      ];
    });

    if (favouriteRows.length > 0) {
      await tx.insert(favourites).values(favouriteRows).onConflictDoNothing();
    }

    const existingContactRows = await tx
      .select({ email: contactMessages.email, subject: contactMessages.subject })
      .from(contactMessages);
    const existingContactKeys = new Set(
      existingContactRows.map((message) => `${message.email}:${message.subject}`),
    );
    const contactRows = seedContactMessages.flatMap((message) => {
      const key = `${message.email}:${message.subject}`;

      if (existingContactKeys.has(key)) {
        return [];
      }

      const user = message.userEmail ? userMap.get(message.userEmail) : null;

      if (message.userEmail && !user) {
        logSkippedSeed("contact_messages", `user ${message.userEmail} is missing`);
      }

      return [
        {
          userId: user?.id ?? null,
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message,
          status: message.status,
        },
      ];
    });

    if (contactRows.length > 0) {
      await tx.insert(contactMessages).values(contactRows);
    }

    // Poster/backdrop URLs are currently null in the catalog seed, so media_assets stays empty.
  });

  console.log("Seed completed successfully.");
  console.log(`Seeded ${seedUsers.length} users, ${seedGenres.length} genres, ${seedMovies.length} movies, and ${seedSeries.length} series.`);
  console.log(`Ensured ${seedSeries.length * SEASONS_PER_SERIES} seasons and ${seedSeries.length * SEASONS_PER_SERIES * EPISODES_PER_SEASON} episodes.`);
  console.log(`Ensured ${seedPeople.length} people and sample authenticated user feature data.`);
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
