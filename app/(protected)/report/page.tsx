import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ReportIntroClient } from "./report-intro-client";

export default async function ReportPage() {
  // 1. auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 2. profile
  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile || !profile.test_completed) {
    redirect("/home");
  }

  // 3. couple (점수 계산 완료된 것만)
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

  // 4. partner 닉네임
  const partnerId =
    couple.inviter_profile_id === profile.id
      ? couple.invitee_profile_id
      : couple.inviter_profile_id;

  const [partner] = await db
    .select({ nickname: befeProfiles.nickname, coupon_id: befeProfiles.coupon_id })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, partnerId))
    .limit(1);

  const hasCoupon = !!(profile.coupon_id || partner?.coupon_id);

  return (
    <ReportIntroClient
      nickname={profile.nickname ?? "회원"}
      partnerNickname={partner?.nickname ?? "배우자"}
      coupleId={couple.id}
      hasChildren={couple.has_children}
      pcqScore={couple.pcq_score}
      hasCoupon={hasCoupon}
    />
  );
}
