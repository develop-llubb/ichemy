"use server";

import { db } from "@/db";
import { befeProfiles, befePersonalityReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import {
  generateParentingProfile,
  PARENTING_PROFILE_PROMPT_VERSION,
} from "@/lib/generate-parenting-profile";

export async function requestPersonalityReport(
  profileId: string,
): Promise<{ reportId: string } | { error: string }> {
  // 기존 리포트 확인
  const [existing] = await db
    .select({ id: befePersonalityReports.id })
    .from(befePersonalityReports)
    .where(eq(befePersonalityReports.profile_id, profileId))
    .limit(1);

  if (existing) {
    return { reportId: existing.id };
  }

  // 프로필 데이터 조회
  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.id, profileId))
    .limit(1);

  if (
    !profile ||
    !profile.test_completed ||
    profile.openness === null ||
    profile.z_openness === null ||
    profile.attachment_type === null ||
    profile.aas_intensity === null ||
    profile.flexibility_level === null ||
    profile.flexibility_percentage === null
  ) {
    return { error: "검사 데이터가 없어요." };
  }

  // generating 상태로 리포트 레코드 생성
  const [report] = await db
    .insert(befePersonalityReports)
    .values({
      profile_id: profileId,
      status: "generating",
    })
    .returning({ id: befePersonalityReports.id });

  // 백그라운드에서 리포트 생성
  after(async () => {
    try {
      const { content, modelVersion } = await generateParentingProfile({
        nickname: profile.nickname ?? "회원",
        role: profile.role,
        openness: profile.openness!,
        conscientiousness: profile.conscientiousness!,
        extraversion: profile.extraversion!,
        agreeableness: profile.agreeableness!,
        neuroticism: profile.neuroticism!,
        z_openness: profile.z_openness!,
        z_conscientiousness: profile.z_conscientiousness!,
        z_extraversion: profile.z_extraversion!,
        z_agreeableness: profile.z_agreeableness!,
        z_neuroticism: profile.z_neuroticism!,
        attachment_type: profile.attachment_type!,
        aas_intensity: profile.aas_intensity!,
        avoidance: profile.avoidance!,
        anxiety: profile.anxiety!,
        z_avoidance: profile.z_avoidance!,
        z_anxiety: profile.z_anxiety!,
        flexibility_level: profile.flexibility_level!,
        flexibility_percentage: profile.flexibility_percentage!,
        humor: profile.humor!,
        conflict: profile.conflict!,
        z_humor: profile.z_humor!,
        z_conflict: profile.z_conflict!,
      });

      await db
        .update(befePersonalityReports)
        .set({
          status: "completed",
          content,
          model_version: modelVersion,
          prompt_version: PARENTING_PROFILE_PROMPT_VERSION,
        })
        .where(eq(befePersonalityReports.id, report.id));
    } catch (e) {
      console.error("Personality report generation failed:", e);
      await db
        .update(befePersonalityReports)
        .set({ status: "failed" })
        .where(eq(befePersonalityReports.id, report.id));
    }
  });

  return { reportId: report.id };
}

export async function retryPersonalityReport(
  reportId: string,
): Promise<{ error?: string }> {
  const [report] = await db
    .select({
      id: befePersonalityReports.id,
      profile_id: befePersonalityReports.profile_id,
      status: befePersonalityReports.status,
    })
    .from(befePersonalityReports)
    .where(eq(befePersonalityReports.id, reportId))
    .limit(1);

  if (!report || report.status !== "failed") {
    return { error: "재시도할 수 없는 상태예요." };
  }

  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.id, report.profile_id))
    .limit(1);

  if (
    !profile ||
    profile.openness === null ||
    profile.z_openness === null ||
    profile.attachment_type === null ||
    profile.aas_intensity === null ||
    profile.flexibility_level === null ||
    profile.flexibility_percentage === null
  ) {
    return { error: "검사 데이터가 없어요." };
  }

  await db
    .update(befePersonalityReports)
    .set({ status: "generating" })
    .where(eq(befePersonalityReports.id, reportId));

  after(async () => {
    try {
      const { content, modelVersion } = await generateParentingProfile({
        nickname: profile.nickname ?? "회원",
        role: profile.role,
        openness: profile.openness!,
        conscientiousness: profile.conscientiousness!,
        extraversion: profile.extraversion!,
        agreeableness: profile.agreeableness!,
        neuroticism: profile.neuroticism!,
        z_openness: profile.z_openness!,
        z_conscientiousness: profile.z_conscientiousness!,
        z_extraversion: profile.z_extraversion!,
        z_agreeableness: profile.z_agreeableness!,
        z_neuroticism: profile.z_neuroticism!,
        attachment_type: profile.attachment_type!,
        aas_intensity: profile.aas_intensity!,
        avoidance: profile.avoidance!,
        anxiety: profile.anxiety!,
        z_avoidance: profile.z_avoidance!,
        z_anxiety: profile.z_anxiety!,
        flexibility_level: profile.flexibility_level!,
        flexibility_percentage: profile.flexibility_percentage!,
        humor: profile.humor!,
        conflict: profile.conflict!,
        z_humor: profile.z_humor!,
        z_conflict: profile.z_conflict!,
      });

      await db
        .update(befePersonalityReports)
        .set({
          status: "completed",
          content,
          model_version: modelVersion,
          prompt_version: PARENTING_PROFILE_PROMPT_VERSION,
        })
        .where(eq(befePersonalityReports.id, reportId));
    } catch (e) {
      console.error("Personality report retry failed:", e);
      await db
        .update(befePersonalityReports)
        .set({ status: "failed" })
        .where(eq(befePersonalityReports.id, reportId));
    }
  });

  return {};
}
