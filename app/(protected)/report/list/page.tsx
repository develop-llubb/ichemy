import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeReports, befeChildren } from "@/db/schema";
import { eq, or } from "drizzle-orm";
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
      has_children: befeReports.has_children,
      child_id: befeReports.child_id,
      status: befeReports.status,
      created_at: befeReports.created_at,
    })
    .from(befeReports)
    .where(eq(befeReports.couple_id, couple.id));

  // 자녀 이름 조회
  const childIds = reportsRaw.filter((r) => r.child_id).map((r) => r.child_id!);
  let childMap: Record<string, { name: string; photo_url: string | null }> = {};
  if (childIds.length > 0) {
    const childrenData = await db
      .select({ id: befeChildren.id, name: befeChildren.name, photo_url: befeChildren.photo_url })
      .from(befeChildren)
      .where(eq(befeChildren.couple_id, couple.id));
    childMap = Object.fromEntries(childrenData.map((c) => [c.id, { name: c.name, photo_url: c.photo_url }]));
  }

  const reports = reportsRaw.map((r) => ({
    ...r,
    childName: r.child_id ? childMap[r.child_id]?.name ?? null : null,
    childPhotoUrl: r.child_id ? childMap[r.child_id]?.photo_url ?? null : null,
  }));

  if (reports.length === 0) {
    redirect("/report");
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
