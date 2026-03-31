import { db } from "@/db";
import {
  befePartnerInvitations,
  befePartners,
  befePartnerCreditTransactions,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function checkPartnerCredit(
  profilePartnerInvitationId: string | null,
  partnerPartnerInvitationId: string | null,
) {
  const invitationId =
    profilePartnerInvitationId || partnerPartnerInvitationId;
  if (!invitationId) return null;

  const [invitation] = await db
    .select({
      id: befePartnerInvitations.id,
      partner_id: befePartnerInvitations.partner_id,
    })
    .from(befePartnerInvitations)
    .where(eq(befePartnerInvitations.id, invitationId))
    .limit(1);

  if (!invitation) return null;

  const [partner] = await db
    .select({
      id: befePartners.id,
      credit_balance: befePartners.credit_balance,
    })
    .from(befePartners)
    .where(eq(befePartners.id, invitation.partner_id))
    .limit(1);

  if (!partner || partner.credit_balance <= 0) return null;

  return {
    partnerId: partner.id,
    invitationId: invitation.id,
    creditBalance: partner.credit_balance,
  };
}

export async function deductPartnerCredit(
  partnerId: string,
  coupleId: string,
  description: string,
) {
  // Deduct 1 credit atomically
  const [updated] = await db
    .update(befePartners)
    .set({
      credit_balance: sql`${befePartners.credit_balance} - 1`,
      updated_at: new Date().toISOString(),
    })
    .where(eq(befePartners.id, partnerId))
    .returning({ credit_balance: befePartners.credit_balance });

  if (!updated) throw new Error("Partner not found");

  // Record transaction
  await db.insert(befePartnerCreditTransactions).values({
    partner_id: partnerId,
    type: "deduction",
    amount: -1,
    balance_after: updated.credit_balance,
    couple_id: coupleId,
    description,
  });
}
