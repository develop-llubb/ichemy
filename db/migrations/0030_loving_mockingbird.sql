CREATE TABLE "befe_criterion_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"couple_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"report_type" "befe_report_type" NOT NULL,
	"cv1" smallint NOT NULL,
	"cv2" smallint NOT NULL,
	"cv3" smallint NOT NULL,
	"cv4" smallint NOT NULL,
	"cv5" smallint NOT NULL,
	"cv6" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "befe_criterion_responses_unique" UNIQUE("couple_id","profile_id","report_type")
);
--> statement-breakpoint
ALTER TABLE "befe_criterion_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "befe_report_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"r1_accuracy" smallint NOT NULL,
	"r2_usefulness" smallint NOT NULL,
	"r3_confidence" smallint NOT NULL,
	"r4_feedback" text,
	"r5_practice" smallint,
	"r5_answered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "befe_report_reviews_report_key" UNIQUE("report_id")
);
--> statement-breakpoint
ALTER TABLE "befe_report_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "befe_criterion_responses" ADD CONSTRAINT "befe_criterion_responses_couple_id_befe_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."befe_couples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_criterion_responses" ADD CONSTRAINT "befe_criterion_responses_profile_id_befe_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_report_reviews" ADD CONSTRAINT "befe_report_reviews_report_id_befe_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."befe_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_report_reviews" ADD CONSTRAINT "befe_report_reviews_profile_id_befe_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;