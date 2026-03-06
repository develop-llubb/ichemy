CREATE TABLE "befe_personality_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"status" "befe_report_status" DEFAULT 'generating' NOT NULL,
	"content" jsonb,
	"model_version" text,
	"prompt_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "befe_personality_reports_profile_key" UNIQUE("profile_id")
);
--> statement-breakpoint
ALTER TABLE "befe_personality_reports" ADD CONSTRAINT "befe_personality_reports_profile_id_befe_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;