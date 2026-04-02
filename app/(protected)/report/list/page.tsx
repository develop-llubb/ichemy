import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeReports, befeChildren } from "@/db/schema";
import { eq, or, and, isNull } from "drizzle-orm";
import { ReportListClient } from "./report-list-client";

export default async function ReportListPage() {
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
    .select({ nickname: befeProfiles.nickname })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, partnerId))
    .limit(1);

  const reportsRaw = await db
    .select({
      id: befeReports.id,
      report_type: befeReports.report_type,
      child_id: befeReports.child_id,
      child_name: befeReports.child_name,
      child_gender: befeReports.child_gender,
      child_birth_date: befeReports.child_birth_date,
      child_age: befeReports.child_age,
      status: befeReports.status,
      created_at: befeReports.created_at,
    })
    .from(befeReports)
    .where(and(eq(befeReports.couple_id, couple.id), isNull(befeReports.deleted_at)));

  // 자녀 사진 조회 (사진은 스냅샷이 아니므로 최신 값 사용)
  const childIds = reportsRaw.filter((r) => r.child_id).map((r) => r.child_id!);
  let photoMap: Record<string, string | null> = {};
  if (childIds.length > 0) {
    const childrenData = await db
      .select({ id: befeChildren.id, photo_url: befeChildren.photo_url })
      .from(befeChildren)
      .where(eq(befeChildren.couple_id, couple.id));
    photoMap = Object.fromEntries(childrenData.map((c) => [c.id,
      c.photo_url
        ? supabase.storage.from("images").getPublicUrl(c.photo_url).data.publicUrl
        : null,
    ]));
  }

  const reports = reportsRaw.map((r) => ({
    ...r,
    childPhotoUrl: r.child_id ? photoMap[r.child_id] ?? null : null,
  }));

  if (reports.length === 0) {
    redirect("/report?from=/home");
  }

  return (
    <ReportListClient
      nickname={profile.nickname ?? "회원"}
      partnerNickname={partner?.nickname ?? "배우자"}
      coupleId={couple.id}
      reports={reports}
    />
  );
}
