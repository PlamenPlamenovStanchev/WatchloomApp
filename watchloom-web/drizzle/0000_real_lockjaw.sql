CREATE TABLE "episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"title" text NOT NULL,
	"overview" text,
	"air_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_genres" (
	"movie_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "movie_genres_movie_id_genre_id_pk" PRIMARY KEY("movie_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"overview" text,
	"release_date" date,
	"poster_url" text,
	"backdrop_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"title" text,
	"overview" text,
	"release_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"overview" text,
	"first_air_date" date,
	"poster_url" text,
	"backdrop_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series_genres" (
	"series_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "series_genres_series_id_genre_id_pk" PRIMARY KEY("series_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_genres" ADD CONSTRAINT "series_genres_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_genres" ADD CONSTRAINT "series_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "episodes_season_id_idx" ON "episodes" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "episodes_title_idx" ON "episodes" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "episodes_season_id_episode_number_idx" ON "episodes" USING btree ("season_id","episode_number");--> statement-breakpoint
CREATE UNIQUE INDEX "genres_name_idx" ON "genres" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "genres_slug_idx" ON "genres" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_genres_movie_id_genre_id_idx" ON "movie_genres" USING btree ("movie_id","genre_id");--> statement-breakpoint
CREATE INDEX "movie_genres_movie_id_idx" ON "movie_genres" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "movie_genres_genre_id_idx" ON "movie_genres" USING btree ("genre_id");--> statement-breakpoint
CREATE INDEX "movies_title_idx" ON "movies" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "movies_slug_idx" ON "movies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "seasons_series_id_idx" ON "seasons" USING btree ("series_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_series_id_season_number_idx" ON "seasons" USING btree ("series_id","season_number");--> statement-breakpoint
CREATE INDEX "series_title_idx" ON "series" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "series_slug_idx" ON "series" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "series_genres_series_id_genre_id_idx" ON "series_genres" USING btree ("series_id","genre_id");--> statement-breakpoint
CREATE INDEX "series_genres_series_id_idx" ON "series_genres" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "series_genres_genre_id_idx" ON "series_genres" USING btree ("genre_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");