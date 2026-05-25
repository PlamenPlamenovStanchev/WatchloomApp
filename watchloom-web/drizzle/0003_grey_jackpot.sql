CREATE TYPE "public"."asset_type" AS ENUM('poster', 'backdrop', 'profile', 'other');--> statement-breakpoint
CREATE TYPE "public"."catalog_person_role" AS ENUM('actor', 'creator', 'director', 'writer');--> statement-breakpoint
CREATE TYPE "public"."contact_message_status" AS ENUM('new', 'read', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('movie', 'series');--> statement-breakpoint
CREATE TYPE "public"."watchlist_status" AS ENUM('to_watch', 'watching', 'watched');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "contact_message_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favourites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"movie_id" integer,
	"series_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favourites_media_reference_check" CHECK ((
        "favourites"."media_type" = 'movie'
        and "favourites"."movie_id" is not null
        and "favourites"."series_id" is null
      ) or (
        "favourites"."media_type" = 'series'
        and "favourites"."series_id" is not null
        and "favourites"."movie_id" is null
      ))
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_type" "media_type",
	"movie_id" integer,
	"series_id" integer,
	"person_id" integer,
	"asset_type" "asset_type" NOT NULL,
	"url" text NOT NULL,
	"storage_key" text,
	"provider" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_target_reference_check" CHECK ((
        ("media_assets"."movie_id" is not null)::int
        + ("media_assets"."series_id" is not null)::int
        + ("media_assets"."person_id" is not null)::int
      ) <= 1),
	CONSTRAINT "media_assets_media_type_check" CHECK ((
        "media_assets"."media_type" is null
        and "media_assets"."movie_id" is null
        and "media_assets"."series_id" is null
      ) or (
        "media_assets"."media_type" = 'movie'
        and "media_assets"."movie_id" is not null
        and "media_assets"."series_id" is null
      ) or (
        "media_assets"."media_type" = 'series'
        and "media_assets"."series_id" is not null
        and "media_assets"."movie_id" is null
      ))
);
--> statement-breakpoint
CREATE TABLE "movie_people" (
	"movie_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"role" "catalog_person_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"biography" text,
	"birth_date" date,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"movie_id" integer,
	"series_id" integer,
	"rating" integer NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_check" CHECK ("reviews"."rating" >= 1 and "reviews"."rating" <= 5),
	CONSTRAINT "reviews_media_reference_check" CHECK ((
        "reviews"."media_type" = 'movie'
        and "reviews"."movie_id" is not null
        and "reviews"."series_id" is null
      ) or (
        "reviews"."media_type" = 'series'
        and "reviews"."series_id" is not null
        and "reviews"."movie_id" is null
      ))
);
--> statement-breakpoint
CREATE TABLE "series_people" (
	"series_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"role" "catalog_person_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"watchlist_id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"movie_id" integer,
	"series_id" integer,
	"status" "watchlist_status" DEFAULT 'to_watch' NOT NULL,
	"planned_watch_at" timestamp with time zone,
	"rating" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_items_rating_check" CHECK ("watchlist_items"."rating" is null or ("watchlist_items"."rating" >= 1 and "watchlist_items"."rating" <= 5)),
	CONSTRAINT "watchlist_items_media_reference_check" CHECK ((
        "watchlist_items"."media_type" = 'movie'
        and "watchlist_items"."movie_id" is not null
        and "watchlist_items"."series_id" is null
      ) or (
        "watchlist_items"."media_type" = 'series'
        and "watchlist_items"."series_id" is not null
        and "watchlist_items"."movie_id" is null
      ))
);
--> statement-breakpoint
CREATE TABLE "watchlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_people" ADD CONSTRAINT "movie_people_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_people" ADD CONSTRAINT "movie_people_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_people" ADD CONSTRAINT "series_people_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_people" ADD CONSTRAINT "series_people_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_watchlist_id_watchlists_id_fk" FOREIGN KEY ("watchlist_id") REFERENCES "public"."watchlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_messages_user_id_idx" ON "contact_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_messages_email_idx" ON "contact_messages" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_messages_status_idx" ON "contact_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "favourites_user_id_idx" ON "favourites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favourites_movie_id_idx" ON "favourites" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "favourites_series_id_idx" ON "favourites" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "favourites_created_at_idx" ON "favourites" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "favourites_user_id_media_type_movie_id_idx" ON "favourites" USING btree ("user_id","media_type","movie_id");--> statement-breakpoint
CREATE UNIQUE INDEX "favourites_user_id_media_type_series_id_idx" ON "favourites" USING btree ("user_id","media_type","series_id");--> statement-breakpoint
CREATE INDEX "media_assets_movie_id_idx" ON "media_assets" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "media_assets_series_id_idx" ON "media_assets" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "media_assets_person_id_idx" ON "media_assets" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "media_assets_asset_type_idx" ON "media_assets" USING btree ("asset_type");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_people_movie_id_person_id_role_idx" ON "movie_people" USING btree ("movie_id","person_id","role");--> statement-breakpoint
CREATE INDEX "movie_people_movie_id_idx" ON "movie_people" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "movie_people_person_id_idx" ON "movie_people" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "movie_people_role_idx" ON "movie_people" USING btree ("role");--> statement-breakpoint
CREATE INDEX "people_name_idx" ON "people" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "people_slug_idx" ON "people" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_movie_id_idx" ON "reviews" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "reviews_series_id_idx" ON "reviews" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_user_id_media_type_movie_id_idx" ON "reviews" USING btree ("user_id","media_type","movie_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_user_id_media_type_series_id_idx" ON "reviews" USING btree ("user_id","media_type","series_id");--> statement-breakpoint
CREATE UNIQUE INDEX "series_people_series_id_person_id_role_idx" ON "series_people" USING btree ("series_id","person_id","role");--> statement-breakpoint
CREATE INDEX "series_people_series_id_idx" ON "series_people" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "series_people_person_id_idx" ON "series_people" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "series_people_role_idx" ON "series_people" USING btree ("role");--> statement-breakpoint
CREATE INDEX "watchlist_items_watchlist_id_idx" ON "watchlist_items" USING btree ("watchlist_id");--> statement-breakpoint
CREATE INDEX "watchlist_items_movie_id_idx" ON "watchlist_items" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "watchlist_items_series_id_idx" ON "watchlist_items" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "watchlist_items_status_idx" ON "watchlist_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "watchlist_items_planned_watch_at_idx" ON "watchlist_items" USING btree ("planned_watch_at");--> statement-breakpoint
CREATE UNIQUE INDEX "watchlist_items_watchlist_id_media_type_movie_id_idx" ON "watchlist_items" USING btree ("watchlist_id","media_type","movie_id");--> statement-breakpoint
CREATE UNIQUE INDEX "watchlist_items_watchlist_id_media_type_series_id_idx" ON "watchlist_items" USING btree ("watchlist_id","media_type","series_id");--> statement-breakpoint
CREATE INDEX "watchlists_user_id_idx" ON "watchlists" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "watchlists_user_id_name_idx" ON "watchlists" USING btree ("user_id","name");