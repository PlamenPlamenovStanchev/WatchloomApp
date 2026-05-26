import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const catalogPersonRoleEnum = pgEnum("catalog_person_role", [
  "actor",
  "creator",
  "director",
  "writer",
]);

export const mediaTypeEnum = pgEnum("media_type", ["movie", "series"]);

export const watchlistStatusEnum = pgEnum("watchlist_status", [
  "to_watch",
  "watching",
  "watched",
]);

export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "read",
  "resolved",
]);

export const assetTypeEnum = pgEnum("asset_type", ["poster", "backdrop", "profile", "other"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    role: text("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    providerEmail: text("provider_email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("oauth_accounts_user_id_idx").on(table.userId),
    providerProviderAccountIdIdx: uniqueIndex(
      "oauth_accounts_provider_provider_account_id_idx",
    ).on(table.provider, table.providerAccountId),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("password_reset_tokens_user_id_idx").on(table.userId),
    tokenHashIdx: uniqueIndex("password_reset_tokens_token_hash_idx").on(table.tokenHash),
    expiresAtIdx: index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
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
    releaseYear: integer("release_year"),
    posterUrl: text("poster_url"),
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

export const people = pgTable(
  "people",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    biography: text("biography"),
    birthDate: date("birth_date"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("people_name_idx").on(table.name),
    slugIdx: uniqueIndex("people_slug_idx").on(table.slug),
  }),
);

export const moviePeople = pgTable(
  "movie_people",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    role: catalogPersonRoleEnum("role").notNull(),
  },
  (table) => ({
    moviePersonRoleIdx: uniqueIndex("movie_people_movie_id_person_id_role_idx").on(
      table.movieId,
      table.personId,
      table.role,
    ),
    movieIdx: index("movie_people_movie_id_idx").on(table.movieId),
    personIdx: index("movie_people_person_id_idx").on(table.personId),
    roleIdx: index("movie_people_role_idx").on(table.role),
  }),
);

export const seriesPeople = pgTable(
  "series_people",
  {
    seriesId: integer("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    role: catalogPersonRoleEnum("role").notNull(),
  },
  (table) => ({
    seriesPersonRoleIdx: uniqueIndex("series_people_series_id_person_id_role_idx").on(
      table.seriesId,
      table.personId,
      table.role,
    ),
    seriesIdx: index("series_people_series_id_idx").on(table.seriesId),
    personIdx: index("series_people_person_id_idx").on(table.personId),
    roleIdx: index("series_people_role_idx").on(table.role),
  }),
);

export const watchlists = pgTable(
  "watchlists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("watchlists_user_id_idx").on(table.userId),
    userNameIdx: uniqueIndex("watchlists_user_id_name_idx").on(table.userId, table.name),
  }),
);

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    id: serial("id").primaryKey(),
    watchlistId: integer("watchlist_id")
      .notNull()
      .references(() => watchlists.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }),
    seriesId: integer("series_id").references(() => series.id, { onDelete: "cascade" }),
    status: watchlistStatusEnum("status").notNull().default("to_watch"),
    plannedWatchAt: timestamp("planned_watch_at", { withTimezone: true }),
    rating: integer("rating"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    watchlistIdx: index("watchlist_items_watchlist_id_idx").on(table.watchlistId),
    movieIdx: index("watchlist_items_movie_id_idx").on(table.movieId),
    seriesIdx: index("watchlist_items_series_id_idx").on(table.seriesId),
    statusIdx: index("watchlist_items_status_idx").on(table.status),
    plannedWatchAtIdx: index("watchlist_items_planned_watch_at_idx").on(table.plannedWatchAt),
    watchlistMovieIdx: uniqueIndex("watchlist_items_watchlist_id_media_type_movie_id_idx").on(
      table.watchlistId,
      table.mediaType,
      table.movieId,
    ),
    watchlistSeriesIdx: uniqueIndex("watchlist_items_watchlist_id_media_type_series_id_idx").on(
      table.watchlistId,
      table.mediaType,
      table.seriesId,
    ),
    ratingCheck: check(
      "watchlist_items_rating_check",
      sql`${table.rating} is null or (${table.rating} >= 1 and ${table.rating} <= 5)`,
    ),
    mediaReferenceCheck: check(
      "watchlist_items_media_reference_check",
      sql`(
        ${table.mediaType} = 'movie'
        and ${table.movieId} is not null
        and ${table.seriesId} is null
      ) or (
        ${table.mediaType} = 'series'
        and ${table.seriesId} is not null
        and ${table.movieId} is null
      )`,
    ),
  }),
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }),
    seriesId: integer("series_id").references(() => series.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("reviews_user_id_idx").on(table.userId),
    movieIdx: index("reviews_movie_id_idx").on(table.movieId),
    seriesIdx: index("reviews_series_id_idx").on(table.seriesId),
    ratingIdx: index("reviews_rating_idx").on(table.rating),
    createdAtIdx: index("reviews_created_at_idx").on(table.createdAt),
    userMovieIdx: uniqueIndex("reviews_user_id_media_type_movie_id_idx").on(
      table.userId,
      table.mediaType,
      table.movieId,
    ),
    userSeriesIdx: uniqueIndex("reviews_user_id_media_type_series_id_idx").on(
      table.userId,
      table.mediaType,
      table.seriesId,
    ),
    ratingCheck: check(
      "reviews_rating_check",
      sql`${table.rating} >= 1 and ${table.rating} <= 6`,
    ),
    mediaReferenceCheck: check(
      "reviews_media_reference_check",
      sql`(
        ${table.mediaType} = 'movie'
        and ${table.movieId} is not null
        and ${table.seriesId} is null
      ) or (
        ${table.mediaType} = 'series'
        and ${table.seriesId} is not null
        and ${table.movieId} is null
      )`,
    ),
  }),
);

export const favourites = pgTable(
  "favourites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }),
    seriesId: integer("series_id").references(() => series.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("favourites_user_id_idx").on(table.userId),
    movieIdx: index("favourites_movie_id_idx").on(table.movieId),
    seriesIdx: index("favourites_series_id_idx").on(table.seriesId),
    createdAtIdx: index("favourites_created_at_idx").on(table.createdAt),
    userMovieIdx: uniqueIndex("favourites_user_id_media_type_movie_id_idx").on(
      table.userId,
      table.mediaType,
      table.movieId,
    ),
    userSeriesIdx: uniqueIndex("favourites_user_id_media_type_series_id_idx").on(
      table.userId,
      table.mediaType,
      table.seriesId,
    ),
    mediaReferenceCheck: check(
      "favourites_media_reference_check",
      sql`(
        ${table.mediaType} = 'movie'
        and ${table.movieId} is not null
        and ${table.seriesId} is null
      ) or (
        ${table.mediaType} = 'series'
        and ${table.seriesId} is not null
        and ${table.movieId} is null
      )`,
    ),
  }),
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: contactMessageStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("contact_messages_user_id_idx").on(table.userId),
    emailIdx: index("contact_messages_email_idx").on(table.email),
    statusIdx: index("contact_messages_status_idx").on(table.status),
    createdAtIdx: index("contact_messages_created_at_idx").on(table.createdAt),
  }),
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: serial("id").primaryKey(),
    mediaType: mediaTypeEnum("media_type"),
    movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }),
    seriesId: integer("series_id").references(() => series.id, { onDelete: "cascade" }),
    personId: integer("person_id").references(() => people.id, { onDelete: "cascade" }),
    assetType: assetTypeEnum("asset_type").notNull(),
    url: text("url").notNull(),
    storageKey: text("storage_key"),
    provider: text("provider"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    movieIdx: index("media_assets_movie_id_idx").on(table.movieId),
    seriesIdx: index("media_assets_series_id_idx").on(table.seriesId),
    personIdx: index("media_assets_person_id_idx").on(table.personId),
    assetTypeIdx: index("media_assets_asset_type_idx").on(table.assetType),
    targetReferenceCheck: check(
      "media_assets_target_reference_check",
      sql`(
        (${table.movieId} is not null)::int
        + (${table.seriesId} is not null)::int
        + (${table.personId} is not null)::int
      ) <= 1`,
    ),
    mediaTypeCheck: check(
      "media_assets_media_type_check",
      sql`(
        ${table.mediaType} is null
        and ${table.movieId} is null
        and ${table.seriesId} is null
      ) or (
        ${table.mediaType} = 'movie'
        and ${table.movieId} is not null
        and ${table.seriesId} is null
      ) or (
        ${table.mediaType} = 'series'
        and ${table.seriesId} is not null
        and ${table.movieId} is null
      )`,
    ),
  }),
);
