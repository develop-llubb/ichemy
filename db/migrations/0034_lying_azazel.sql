ALTER TABLE "befe_children" DROP CONSTRAINT IF EXISTS "befe_children_profile_id_befe_profiles_id_fk";
--> statement-breakpoint
DELETE FROM "befe_children" WHERE "couple_id" IS NULL;--> statement-breakpoint
ALTER TABLE "befe_children" ALTER COLUMN "couple_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_children" DROP COLUMN IF EXISTS "profile_id";
