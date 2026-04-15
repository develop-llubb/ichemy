DO $$ BEGIN
  CREATE TYPE "public"."befe_report_type" AS ENUM('no_child', 'infant', 'toddler', 'elementary', 'middle_school');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "befe_report_templates" DROP CONSTRAINT IF EXISTS "befe_report_templates_grades_key";--> statement-breakpoint
ALTER TABLE "befe_orders" ADD COLUMN IF NOT EXISTS "report_type" "befe_report_type" NOT NULL DEFAULT 'infant';--> statement-breakpoint
ALTER TABLE "befe_report_templates" ADD COLUMN IF NOT EXISTS "report_type" "befe_report_type" NOT NULL DEFAULT 'infant';--> statement-breakpoint
ALTER TABLE "befe_reports" ADD COLUMN IF NOT EXISTS "report_type" "befe_report_type" NOT NULL DEFAULT 'infant';--> statement-breakpoint
ALTER TABLE "befe_orders" DROP COLUMN IF EXISTS "has_children";--> statement-breakpoint
ALTER TABLE "befe_report_templates" DROP COLUMN IF EXISTS "has_children";--> statement-breakpoint
ALTER TABLE "befe_reports" DROP COLUMN IF EXISTS "has_children";--> statement-breakpoint
DELETE FROM "befe_report_templates" a USING "befe_report_templates" b WHERE a.ctid < b.ctid AND a."esb_grade" = b."esb_grade" AND a."csp_grade" = b."csp_grade" AND a."pci_grade" = b."pci_grade" AND a."stb_grade" = b."stb_grade" AND a."report_type" = b."report_type";--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "befe_report_templates" ADD CONSTRAINT "befe_report_templates_grades_key" UNIQUE("esb_grade","csp_grade","pci_grade","stb_grade","report_type");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
