"use server";

import { db } from "@/db";
import { befeCriterionResponses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { ReportType } from "@/lib/care-report";

const CV_COLUMNS = ["cv1", "cv2", "cv3", "cv4", "cv5", "cv6"] as const;

export async function saveCriterionAnswer(
  coupleId: string,
  profileId: string,
  reportType: ReportType,
  questionIndex: number,
  value: number,
) {
  const column = CV_COLUMNS[questionIndex];
  if (!column) return;

  // 기존 행 확인
  const [existing] = await db
    .select({ id: befeCriterionResponses.id })
    .from(befeCriterionResponses)
    .where(
      and(
        eq(befeCriterionResponses.couple_id, coupleId),
        eq(befeCriterionResponses.profile_id, profileId),
        eq(befeCriterionResponses.report_type, reportType),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(befeCriterionResponses)
      .set({ [column]: value })
      .where(eq(befeCriterionResponses.id, existing.id));
  } else {
    await db
      .insert(befeCriterionResponses)
      .values({
        couple_id: coupleId,
        profile_id: profileId,
        report_type: reportType,
        [column]: value,
      } as typeof befeCriterionResponses.$inferInsert);
  }
}
