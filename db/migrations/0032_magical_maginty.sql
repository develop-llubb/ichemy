DO $$ BEGIN
  CREATE TYPE "public"."befe_parenting_status" AS ENUM('has_children', 'pregnant', 'none');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "befe_profiles" ADD COLUMN IF NOT EXISTS "parenting_status" "befe_parenting_status";--> statement-breakpoint
ALTER TABLE "befe_profiles" ADD COLUMN IF NOT EXISTS "pregnancy_weeks" smallint;
