import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeReports, befeReportReviews, befeCriterionResponses } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReportResultClient } from "./report-result-client";
import { getNavData } from "@/lib/nav-data";

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

  // 준거 설문 미완료 시 criterion 페이지로 리다이렉트
  const [criterionResponse] = await db
    .select({
      cv1: befeCriterionResponses.cv1,
      cv2: befeCriterionResponses.cv2,
      cv3: befeCriterionResponses.cv3,
      cv4: befeCriterionResponses.cv4,
      cv5: befeCriterionResponses.cv5,
      cv6: befeCriterionResponses.cv6,
    })
    .from(befeCriterionResponses)
    .where(
      and(
        eq(befeCriterionResponses.couple_id, myCouple.id),
        eq(befeCriterionResponses.profile_id, profile.id),
        eq(befeCriterionResponses.report_type, report.report_type),
      ),
    )
    .limit(1);

  const criterionComplete = criterionResponse &&
    [criterionResponse.cv1, criterionResponse.cv2, criterionResponse.cv3, criterionResponse.cv4, criterionResponse.cv5, criterionResponse.cv6].every((v) => v !== null);

  if (!criterionComplete) {
    redirect(`/report/${id}/criterion`);
  }

  // 리뷰 존재 여부 확인
  const [existingReview] = await db
    .select({ id: befeReportReviews.id })
    .from(befeReportReviews)
    .where(eq(befeReportReviews.report_id, report.id))
    .limit(1);

  const navData = await getNavData();

  return (
    <ReportResultClient
      reportId={report.id}
      reportType={report.report_type}
      childName={report.child_name}
      status={report.status}
      content={report.content}
      profileId={profile.id}
      hasReview={!!existingReview}
      navData={navData}
    />
  );
}
