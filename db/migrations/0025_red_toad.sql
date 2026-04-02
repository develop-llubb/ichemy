ALTER TABLE "befe_children" ADD COLUMN "gender" text NOT NULL DEFAULT 'boy';--> statement-breakpoint
ALTER TABLE "befe_reports" ADD COLUMN "child_name" text;--> statement-breakpoint
ALTER TABLE "befe_reports" ADD COLUMN "child_age" smallint;