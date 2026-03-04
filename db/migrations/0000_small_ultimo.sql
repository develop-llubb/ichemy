CREATE TYPE "public"."befe_attachment_type" AS ENUM('secure', 'anxious', 'avoidant', 'disorganized');--> statement-breakpoint
CREATE TYPE "public"."befe_grade" AS ENUM('A', 'B', 'C', 'D');--> statement-breakpoint
CREATE TYPE "public"."befe_role" AS ENUM('mom', 'dad');--> statement-breakpoint
CREATE TABLE "befe_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "befe_answers_profile_question_key" UNIQUE("profile_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "befe_couples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_profile_id" uuid NOT NULL,
	"invitee_profile_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"esb_score" real NOT NULL,
	"csp_score" real NOT NULL,
	"pci_score" real NOT NULL,
	"stb_score" real NOT NULL,
	"esb_grade" "befe_grade" NOT NULL,
	"csp_grade" "befe_grade" NOT NULL,
	"pci_grade" "befe_grade" NOT NULL,
	"stb_grade" "befe_grade" NOT NULL,
	"e_llubb" real,
	"l_llubb" real,
	"pcq_score" real,
	CONSTRAINT "befe_couples_pair_key" UNIQUE("inviter_profile_id","invitee_profile_id")
);
--> statement-breakpoint
CREATE TABLE "befe_coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"event_name" text NOT NULL,
	"max_uses" integer NOT NULL,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"used_by" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "befe_coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "befe_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nickname" text,
	"role" "befe_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"third_party_agreed" boolean DEFAULT false NOT NULL,
	"test_index" integer DEFAULT 0 NOT NULL,
	"test_completed" boolean DEFAULT false NOT NULL,
	"openness" real,
	"conscientiousness" real,
	"extraversion" real,
	"agreeableness" real,
	"neuroticism" real,
	"z_openness" real,
	"z_conscientiousness" real,
	"z_extraversion" real,
	"z_agreeableness" real,
	"z_neuroticism" real,
	"avoidance" real,
	"anxiety" real,
	"z_avoidance" real,
	"z_anxiety" real,
	"humor" real,
	"conflict" real,
	"z_humor" real,
	"z_conflict" real,
	"big_5_type" bigint,
	"attachment_type" "befe_attachment_type",
	"aas_intensity" smallint,
	"flexibility_level" smallint,
	"flexibility_percentage" real
);
--> statement-breakpoint
CREATE TABLE "befe_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"couple_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"model_version" text NOT NULL,
	"prompt_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "befe_reports_couple_key" UNIQUE("couple_id")
);
--> statement-breakpoint
ALTER TABLE "befe_answers" ADD CONSTRAINT "befe_answers_profile_id_befe_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_answers" ADD CONSTRAINT "befe_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_couples" ADD CONSTRAINT "befe_couples_inviter_profile_id_befe_profiles_id_fk" FOREIGN KEY ("inviter_profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_couples" ADD CONSTRAINT "befe_couples_invitee_profile_id_befe_profiles_id_fk" FOREIGN KEY ("invitee_profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_profiles" ADD CONSTRAINT "befe_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_reports" ADD CONSTRAINT "befe_reports_couple_id_befe_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."befe_couples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_befe_couples_inviter" ON "befe_couples" USING btree ("inviter_profile_id");--> statement-breakpoint
CREATE INDEX "idx_befe_couples_invitee" ON "befe_couples" USING btree ("invitee_profile_id");