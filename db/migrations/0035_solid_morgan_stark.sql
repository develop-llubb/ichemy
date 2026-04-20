CREATE TYPE "public"."befe_heart_transaction_type" AS ENUM('purchase', 'use', 'refund', 'grant');--> statement-breakpoint
CREATE TABLE "befe_heart_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"couple_id" uuid NOT NULL,
	"type" "befe_heart_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"order_id" uuid,
	"report_id" uuid,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "befe_heart_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "befe_orders" ALTER COLUMN "report_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_couples" ADD COLUMN "heart_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "befe_orders" ADD COLUMN "package_key" text;--> statement-breakpoint
ALTER TABLE "befe_orders" ADD COLUMN "hearts_amount" integer;--> statement-breakpoint
ALTER TABLE "befe_heart_transactions" ADD CONSTRAINT "befe_heart_transactions_couple_id_befe_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."befe_couples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_heart_transactions" ADD CONSTRAINT "befe_heart_transactions_order_id_befe_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."befe_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_heart_transactions" ADD CONSTRAINT "befe_heart_transactions_report_id_befe_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."befe_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_befe_heart_transactions_couple" ON "befe_heart_transactions" USING btree ("couple_id");