import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeReports } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReportResultClient } from "./report-result-client";

export default async function ReportResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  // 내가 속한 couple 확인
  const [myCouple] = await db
    .select({ id: befeCouples.id })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
      ),
    )
    .limit(1);

  if (!myCouple) {
    redirect("/home");
  }

  const { id } = await params;

  // report가 내 couple 소속인지 확인
  const [report] = await db
    .select({
      id: befeReports.id,
      report_type: befeReports.report_type,
      child_name: befeReports.child_name,
      status: befeReports.status,
      content: befeReports.content,
    })
    .from(befeReports)
    .where(
      and(
        eq(befeReports.id, id),
        eq(befeReports.couple_id, myCouple.id),
      ),
    )
    .limit(1);

  if (!report) {
    notFound();
  }

  return (
    <ReportResultClient
      reportId={report.id}
      reportType={report.report_type}
      childName={report.child_name}
      status={report.status}
      content={report.content}
    />
  );
}
