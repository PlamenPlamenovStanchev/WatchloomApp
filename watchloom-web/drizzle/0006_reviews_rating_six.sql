ALTER TABLE "reviews" DROP CONSTRAINT "reviews_rating_check";--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_check" CHECK ("reviews"."rating" >= 1 and "reviews"."rating" <= 6);
