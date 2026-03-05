CREATE TYPE "public"."befe_invitation_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TABLE "befe_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_profile_id" uuid NOT NULL,
	"invitee_profile_id" uuid NOT NULL,
	"status" "befe_invitation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "befe_invitations_pair_key" UNIQUE("inviter_profile_id","invitee_profile_id")
);
--> statement-breakpoint
ALTER TABLE "befe_invitations" ADD CONSTRAINT "befe_invitations_inviter_profile_id_befe_profiles_id_fk" FOREIGN KEY ("inviter_profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "befe_invitations" ADD CONSTRAINT "befe_invitations_invitee_profile_id_befe_profiles_id_fk" FOREIGN KEY ("invitee_profile_id") REFERENCES "public"."befe_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_befe_invitations_invitee" ON "befe_invitations" USING btree ("invitee_profile_id");