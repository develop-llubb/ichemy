CREATE TYPE "public"."befe_credit_transaction_type" AS ENUM('purchase', 'deduction', 'refund', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."befe_partner_invitation_status" AS ENUM('pending', 'accepted', 'expired');--> statement-breakpoint
CREATE TYPE "public"."befe_partner_order_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."befe_partner_type" AS ENUM('academy', 'insurance', 'other');--> statement-breakpoint
CREATE TABLE "befe_partner_credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"type" "befe_credit_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"couple_id" uuid,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "befe_partner_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"code" text NOT NULL,
	"label" text,
	"profile_id" uuid,
	"couple_id" uuid,
	"status" "befe_partner_invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "befe_partner_invitations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "befe_partner_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"order_id" text NOT NULL,
	"credit_amount" integer NOT NULL,
	"amount" integer NOT NULL,
	"status" "befe_partner_order_status" DEFAULT 'pending' NOT NULL,
	"payment_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "befe_partner_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "befe_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"partner_type" "befe_partner_type" NOT NULL,
	"phone" text,
	"company" text,
	"credit_balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "befe_partners_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "befe_profiles" ADD COLUMN "partner_invitation_id" uuid;--> statement-breakpoint
ALTER TABLE "befe_partner_credit_transactions" ADD CONSTRAINT "befe_partner_credit_transactions_partner_id_befe_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."befe_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_partner_credit_transactions" ADD CONSTRAINT "befe_partner_credit_transactions_couple_id_befe_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."befe_couples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_partner_invitations" ADD CONSTRAINT "befe_partner_invitations_partner_id_befe_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."befe_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_partner_invitations" ADD CONSTRAINT "befe_partner_invitations_profile_id_befe_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_partner_invitations" ADD CONSTRAINT "befe_partner_invitations_couple_id_befe_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."befe_couples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_partner_orders" ADD CONSTRAINT "befe_partner_orders_partner_id_befe_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."befe_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_partners" ADD CONSTRAINT "befe_partners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;