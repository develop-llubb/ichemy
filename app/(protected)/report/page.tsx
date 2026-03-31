import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeReports } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ReportIntroClient } from "./report-intro-client";
import { checkPartnerCredit } from "@/lib/partner-credit";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  const [couple] = await db
    .select({
      id: befeCouples.id,
      inviter_profile_id: befeCouples.inviter_profile_id,
      invitee_profile_id: befeCouples.invitee_profile_id,
      pcq_score: befeCouples.pcq_score,
      has_children: befeCouples.has_children,
      esb_score: befeCouples.esb_score,
      csp_score: befeCouples.csp_score,
      pci_score: befeCouples.pci_score,
      stb_score: befeCouples.stb_score,
    })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
      ),
    )
    .limit(1);

  if (!couple || couple.pcq_score === null) {
    redirect("/home");
  }

  const partnerId =
    couple.inviter_profile_id === profile.id
      ? couple.invitee_profile_id
      : couple.inviter_profile_id;

  const [partner] = await db
    .select({
      nickname: befeProfiles.nickname,
      coupon_id: befeProfiles.coupon_id,
      partner_invitation_id: befeProfiles.partner_invitation_id,
    })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, partnerId))
    .limit(1);

  const hasCoupon = !!(profile.coupon_id || partner?.coupon_id);

  const partnerCredit = await checkPartnerCredit(
    profile.partner_invitation_id,
    partner?.partner_invitation_id ?? null,
  );
  const hasFreeAccess = hasCoupon || !!partnerCredit;

  const existingReports = await db
    .select({ has_children: befeReports.has_children })
    .from(befeReports)
    .where(eq(befeReports.couple_id, couple.id));

  const existingTypes = existingReports.map((r) => r.has_children);

  let lockedHasChildren: boolean | null = null;
  if (type === "with" && !existingTypes.includes(true)) {
    lockedHasChildren = true;
  } else if (type === "without" && !existingTypes.includes(false)) {
    lockedHasChildren = false;
  }

  return (
    <ReportIntroClient
      nickname={profile.nickname ?? "회원"}
      partnerNickname={partner?.nickname ?? "배우자"}
      coupleId={couple.id}
      hasChildren={lockedHasChildren ?? couple.has_children}
      pcqScore={couple.pcq_score}
      hasCoupon={hasCoupon}
      hasPartnerCredit={!!partnerCredit}
      partnerCreditInfo={partnerCredit}
      lockedHasChildren={lockedHasChildren}
    />
  );
}
