ALTER TABLE "befe_reports" DROP CONSTRAINT "befe_reports_couple_key";--> statement-breakpoint
ALTER TABLE "befe_reports" ADD COLUMN "has_children" boolean;--> statement-breakpoint
UPDATE "befe_reports" SET "has_children" = COALESCE((SELECT "has_children" FROM "befe_couples" WHERE "befe_couples"."id" = "befe_reports"."couple_id"), false);--> statement-breakpoint
ALTER TABLE "befe_reports" ALTER COLUMN "has_children" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_reports" ADD CONSTRAINT "befe_reports_couple_type_key" UNIQUE("couple_id","has_children");
