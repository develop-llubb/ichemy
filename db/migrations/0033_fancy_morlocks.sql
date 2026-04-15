ALTER TABLE "befe_children" ALTER COLUMN "couple_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_children" ADD COLUMN IF NOT EXISTS "profile_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "befe_children" ADD CONSTRAINT "befe_children_profile_id_befe_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
