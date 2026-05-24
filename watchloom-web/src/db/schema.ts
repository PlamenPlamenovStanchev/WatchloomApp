import {
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

export const movies = pgTable(
  "movies",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    overview: text("overview"),
    releaseDate: date("release_date"),
    releaseYear: integer("release_year"),
    durationMinutes: integer("duration_minutes"),
    director: text("director"),
    writer: text("writer"),
    cast: text("cast"),
    posterUrl: text("poster_url"),
    backdropUrl: text("backdrop_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    titleIdx: index("movies_title_idx").on(table.title),
    slugIdx: uniqueIndex("movies_slug_idx").on(table.slug),
  }),
);

export const series = pgTable(
  "series",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    overview: text("overview"),
    firstAirDate: date("first_air_date"),
    releaseYear: integer("release_year"),
    status: text("status"),
    network: text("network"),
    creator: text("creator"),
    cast: text("cast"),
    posterUrl: text("poster_url"),
    backdropUrl: text("backdrop_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    titleIdx: index("series_title_idx").on(table.title),
    slugIdx: uniqueIndex("series_slug_idx").on(table.slug),
  }),
);

export const seasons = pgTable(
  "seasons",
  {
    id: serial("id").primaryKey(),
    seriesId: integer("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    seasonNumber: integer("season_number").notNull(),
    title: text("title"),
    overview: text("overview"),
    releaseDate: date("release_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    seriesIdx: index("seasons_series_id_idx").on(table.seriesId),
    seriesSeasonIdx: uniqueIndex("seasons_series_id_season_number_idx").on(
      table.seriesId,
      table.seasonNumber,
    ),
  }),
);

export const episodes = pgTable(
  "episodes",
  {
    id: serial("id").primaryKey(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    episodeNumber: integer("episode_number").notNull(),
    title: text("title").notNull(),
    overview: text("overview"),
    airDate: date("air_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    seasonIdx: index("episodes_season_id_idx").on(table.seasonId),
    titleIdx: index("episodes_title_idx").on(table.title),
    seasonEpisodeIdx: uniqueIndex("episodes_season_id_episode_number_idx").on(
      table.seasonId,
      table.episodeNumber,
    ),
  }),
);

export const genres = pgTable(
  "genres",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: uniqueIndex("genres_name_idx").on(table.name),
    slugIdx: uniqueIndex("genres_slug_idx").on(table.slug),
  }),
);

export const movieGenres = pgTable(
  "movie_genres",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.movieId, table.genreId] }),
    movieGenreIdx: uniqueIndex("movie_genres_movie_id_genre_id_idx").on(
      table.movieId,
      table.genreId,
    ),
    movieIdx: index("movie_genres_movie_id_idx").on(table.movieId),
    genreIdx: index("movie_genres_genre_id_idx").on(table.genreId),
  }),
);

export const seriesGenres = pgTable(
  "series_genres",
  {
    seriesId: integer("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.seriesId, table.genreId] }),
    seriesGenreIdx: uniqueIndex("series_genres_series_id_genre_id_idx").on(
      table.seriesId,
      table.genreId,
    ),
    seriesIdx: index("series_genres_series_id_idx").on(table.seriesId),
    genreIdx: index("series_genres_genre_id_idx").on(table.genreId),
  }),
);
