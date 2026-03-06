import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeReports } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ReportListClient } from "./report-list-client";

export default async function ReportListPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile || !profile.test_completed) {
    redirect("/home");
  }

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

  // partner nickname
  const partnerId =
    couple.inviter_profile_id === profile.id
      ? couple.invitee_profile_id
      : couple.inviter_profile_id;

  const [partner] = await db
    .select({ nickname: befeProfiles.nickname })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, partnerId))
    .limit(1);

  // all reports for this couple
  const reports = await db
    .select({
      id: befeReports.id,
      has_children: befeReports.has_children,
      status: befeReports.status,
      created_at: befeReports.created_at,
    })
    .from(befeReports)
    .where(eq(befeReports.couple_id, couple.id));

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
