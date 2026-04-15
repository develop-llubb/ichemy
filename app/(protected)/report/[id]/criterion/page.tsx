import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  befeProfiles,
  befeCouples,
  befeReports,
  befeCriterionResponses,
} from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CriterionClient } from "./criterion-client";

export default async function CriterionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

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

  const [report] = await db
    .select({
      id: befeReports.id,
      report_type: befeReports.report_type,
      couple_id: befeReports.couple_id,
    })
    .from(befeReports)
    .where(
      and(eq(befeReports.id, id), eq(befeReports.couple_id, myCouple.id)),
    )
    .limit(1);

  if (!report) {
    notFound();
  }

  // 기존 응답 조회
  const [existing] = await db
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

  // 6문항 모두 응답 완료 시 리포트로 리다이렉트
  if (existing) {
    const vals = [existing.cv1, existing.cv2, existing.cv3, existing.cv4, existing.cv5, existing.cv6];
    if (vals.every((v) => v !== null)) {
      redirect(`/report/${id}`);
    }
  }

  const initialAnswers: (number | null)[] = existing
    ? [existing.cv1, existing.cv2, existing.cv3, existing.cv4, existing.cv5, existing.cv6]
    : [null, null, null, null, null, null];

  return (
    <CriterionClient
      reportId={report.id}
      coupleId={report.couple_id}
      profileId={profile.id}
      reportType={report.report_type}
      initialAnswers={initialAnswers}
    />
  );
}
