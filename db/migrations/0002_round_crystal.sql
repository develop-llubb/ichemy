CREATE TABLE "report_aas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"type_text" text NOT NULL,
	"aas_intensity" smallint NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluations" jsonb NOT NULL,
	"counseling_evaluations" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"title" text NOT NULL,
	"sequence" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_big_5" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"big_5_type" bigint NOT NULL,
	"sequence" integer NOT NULL,
	"nickname" text NOT NULL,
	"title" text NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluations" text NOT NULL,
	"counseling_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "report_big_5_big_5_type_key" UNIQUE("big_5_type")
);
--> statement-breakpoint
CREATE TABLE "report_flexibility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flexibility_level" smallint NOT NULL,
	"title" text NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluation" text NOT NULL,
	"counseling_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "befe_profiles" DROP CONSTRAINT "befe_profiles_invited_by_befe_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "befe_couples" ALTER COLUMN "esb_score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_couples" ALTER COLUMN "csp_score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_couples" ALTER COLUMN "pci_score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_couples" ALTER COLUMN "stb_score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_couples" ALTER COLUMN "esb_grade" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_couples" ALTER COLUMN "csp_grade" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_couples" ALTER COLUMN "pci_grade" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_couples" ALTER COLUMN "stb_grade" DROP NOT NULL;