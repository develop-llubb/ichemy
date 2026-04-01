CREATE TABLE "befe_children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"couple_id" uuid NOT NULL,
	"name" text NOT NULL,
	"birth_date" text NOT NULL,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "befe_reports" DROP CONSTRAINT "befe_reports_couple_type_key";--> statement-breakpoint
ALTER TABLE "befe_reports" ADD COLUMN "child_id" uuid;--> statement-breakpoint
ALTER TABLE "befe_children" ADD CONSTRAINT "befe_children_couple_id_befe_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."befe_couples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_befe_children_couple" ON "befe_children" USING btree ("couple_id");--> statement-breakpoint
ALTER TABLE "befe_reports" ADD CONSTRAINT "befe_reports_child_id_befe_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."befe_children"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_reports" ADD CONSTRAINT "befe_reports_couple_child_key" UNIQUE("couple_id","child_id");