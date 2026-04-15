"use server";

import { db } from "@/db";
import { befeReportReviews } from "@/db/schema";

export async function submitReportReview(
  reportId: string,
  profileId: string,
  r1: number,
  r2: number,
  r3: number,
  r4?: string,
) {
  await db
    .insert(befeReportReviews)
    .values({
      report_id: reportId,
      profile_id: profileId,
      r1_accuracy: r1,
      r2_usefulness: r2,
      r3_confidence: r3,
      r4_feedback: r4 || null,
    })
    .onConflictDoNothing();
}
