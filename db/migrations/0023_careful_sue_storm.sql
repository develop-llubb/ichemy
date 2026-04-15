CREATE TYPE "public"."befe_report_type" AS ENUM('no_child', 'infant', 'toddler', 'elementary', 'middle_school');--> statement-breakpoint
ALTER TABLE "befe_report_templates" DROP CONSTRAINT "befe_report_templates_grades_key";--> statement-breakpoint
ALTER TABLE "befe_orders" ADD COLUMN "report_type" "befe_report_type" NOT NULL DEFAULT 'infant';--> statement-breakpoint
ALTER TABLE "befe_report_templates" ADD COLUMN "report_type" "befe_report_type" NOT NULL DEFAULT 'infant';--> statement-breakpoint
ALTER TABLE "befe_reports" ADD COLUMN "report_type" "befe_report_type" NOT NULL DEFAULT 'infant';--> statement-breakpoint
ALTER TABLE "befe_orders" DROP COLUMN "has_children";--> statement-breakpoint
ALTER TABLE "befe_report_templates" DROP COLUMN "has_children";--> statement-breakpoint
ALTER TABLE "befe_reports" DROP COLUMN "has_children";--> statement-breakpoint
ALTER TABLE "befe_report_templates" ADD CONSTRAINT "befe_report_templates_grades_key" UNIQUE("esb_grade","csp_grade","pci_grade","stb_grade","report_type");