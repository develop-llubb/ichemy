import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeReports, befeChildren } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ReportIntroClient } from "./report-intro-client";

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
    .select({ nickname: befeProfiles.nickname, coupon_id: befeProfiles.coupon_id })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, partnerId))
    .limit(1);

  const hasCoupon = !!(profile.coupon_id || partner?.coupon_id);

  // 자녀 목록 조회
  const children = await db
    .select({
      id: befeChildren.id,
      name: befeChildren.name,
      birth_date: befeChildren.birth_date,
      photo_url: befeChildren.photo_url,
    })
    .from(befeChildren)
    .where(eq(befeChildren.couple_id, couple.id));

  // 기존 리포트 조회 (child_id 포함)
  const existingReports = await db
    .select({ has_children: befeReports.has_children, child_id: befeReports.child_id })
    .from(befeReports)
    .where(eq(befeReports.couple_id, couple.id));

  const existingTypes = existingReports.map((r) => r.has_children);
  const childrenWithReport = existingReports
    .filter((r) => r.child_id !== null)
    .map((r) => r.child_id!);

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
      lockedHasChildren={lockedHasChildren}
      children={children}
      childrenWithReport={childrenWithReport}
    />
  );
}
