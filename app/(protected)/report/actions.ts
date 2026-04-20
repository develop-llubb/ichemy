"use server";

import { db } from "@/db";
import {
  befeCouples,
  befeProfiles,
  befeReports,
  befeReportTemplates,
  befeHeartTransactions,
  befeCriterionResponses,
} from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, inArray, sql } from "drizzle-orm";
import { after } from "next/server";
import { generateCareReport, PROMPT_VERSION } from "@/lib/generate-report";
import type { CareReport, Grade, ReportType } from "@/lib/care-report";
import { befeChildren } from "@/db/schema";

async function getChildInfo(childId: string): Promise<{ name: string; gender: string; birthDate: string; age: number } | null> {
  const [child] = await db
    .select({ name: befeChildren.name, gender: befeChildren.gender, birth_date: befeChildren.birth_date })
    .from(befeChildren)
    .where(eq(befeChildren.id, childId))
    .limit(1);
  if (!child) return null;
  const birth = new Date(child.birth_date);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return { name: child.name, gender: child.gender, birthDate: child.birth_date, age };
}

export async function saveHasChildren(coupleId: string, hasChildren: boolean) {
  await db
    .update(befeCouples)
    .set({
      has_children: hasChildren,
      updated_at: new Date().toISOString(),
    })
    .where(eq(befeCouples.id, coupleId));
}

async function findTemplate(grades: { esb: Grade; csp: Grade; pci: Grade; stb: Grade }, reportType: ReportType) {
  const [template] = await db
    .select()
    .from(befeReportTemplates)
    .where(
      and(
        eq(befeReportTemplates.esb_grade, grades.esb),
        eq(befeReportTemplates.csp_grade, grades.csp),
        eq(befeReportTemplates.pci_grade, grades.pci),
        eq(befeReportTemplates.stb_grade, grades.stb),
        eq(befeReportTemplates.report_type, reportType),
      ),
    )
    .limit(1);
  return template ?? null;
}

async function saveTemplate(
  grades: { esb: Grade; csp: Grade; pci: Grade; stb: Grade },
  reportType: ReportType,
  content: CareReport,
  modelVersion: string,
) {
  await db
    .insert(befeReportTemplates)
    .values({
      esb_grade: grades.esb,
      csp_grade: grades.csp,
      pci_grade: grades.pci,
      stb_grade: grades.stb,
      report_type: reportType,
      content,
      model_version: modelVersion,
      prompt_version: PROMPT_VERSION,
    })
    .onConflictDoNothing();
}

async function generateWithRetry(params: {
  coupleId: string;
  reportType: ReportType;
  grades: { esb: Grade; csp: Grade; pci: Grade; stb: Grade };
  childAge?: number;
  reportId: string;
}) {
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { content, modelVersion } = await generateCareReport({
        sequence: 1,
        coupleId: params.coupleId,
        reportType: params.reportType,
        grades: params.grades,
        childAge: params.childAge,
      });

      await db
        .update(befeReports)
        .set({
          status: "completed",
          content,
          model_version: modelVersion,
          prompt_version: PROMPT_VERSION,
        })
        .where(eq(befeReports.id, params.reportId));

      await saveTemplate(params.grades, params.reportType, content, modelVersion);
      return;
    } catch (e) {
      console.error(
        `Report generation attempt ${attempt}/${MAX_ATTEMPTS} failed (report ${params.reportId}):`,
        e,
      );
      if (attempt === MAX_ATTEMPTS) {
        await db
          .update(befeReports)
          .set({ status: "failed" })
          .where(eq(befeReports.id, params.reportId));
        return;
      }
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function checkCriterionComplete(
  coupleId: string,
  profileId: string,
  reportType: ReportType,
): Promise<boolean> {
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
        eq(befeCriterionResponses.couple_id, coupleId),
        eq(befeCriterionResponses.profile_id, profileId),
        eq(befeCriterionResponses.report_type, reportType),
      ),
    )
    .limit(1);
  if (!existing) return false;
  return [existing.cv1, existing.cv2, existing.cv3, existing.cv4, existing.cv5, existing.cv6].every(
    (v) => v !== null,
  );
}

export async function requestReport(
  coupleId: string,
  reportType: ReportType,
  childId?: string,
): Promise<
  { reportId: string; criterionComplete: boolean } | { error: string }
> {
  // 현재 유저 프로필
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [myProfile] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  // 기존 리포트 확인 (중복 과금 방지)
  const conditions = [
    eq(befeReports.couple_id, coupleId),
    eq(befeReports.report_type, reportType),
  ];
  if (childId) {
    conditions.push(eq(befeReports.child_id, childId));
  }

  const [existing] = await db
    .select({ id: befeReports.id })
    .from(befeReports)
    .where(and(...conditions))
    .limit(1);

  if (existing) {
    const criterionComplete = await checkCriterionComplete(
      coupleId,
      myProfile.id,
      reportType,
    );
    return { reportId: existing.id, criterionComplete };
  }

  // couple + 점수 조회
  const [couple] = await db
    .select({
      id: befeCouples.id,
      heart_balance: befeCouples.heart_balance,
      inviter_profile_id: befeCouples.inviter_profile_id,
      invitee_profile_id: befeCouples.invitee_profile_id,
      esb_grade: befeCouples.esb_grade,
      csp_grade: befeCouples.csp_grade,
      pci_grade: befeCouples.pci_grade,
      stb_grade: befeCouples.stb_grade,
    })
    .from(befeCouples)
    .where(eq(befeCouples.id, coupleId))
    .limit(1);

  if (
    !couple ||
    !couple.esb_grade ||
    !couple.csp_grade ||
    !couple.pci_grade ||
    !couple.stb_grade
  ) {
    return { error: "점수 데이터가 없어요." };
  }

  // 쿠폰 여부 확인 (본인 또는 배우자)
  const profilesRows = await db
    .select({ id: befeProfiles.id, coupon_id: befeProfiles.coupon_id })
    .from(befeProfiles)
    .where(
      inArray(befeProfiles.id, [
        couple.inviter_profile_id,
        couple.invitee_profile_id,
      ]),
    );
  const hasCoupon = profilesRows.some((p) => p.coupon_id !== null);

  // 하트 잔액 확인
  if (!hasCoupon && couple.heart_balance < 1) {
    return { error: "하트가 부족해요. 상점에서 충전해주세요." };
  }

  const grades = {
    esb: couple.esb_grade,
    csp: couple.csp_grade,
    pci: couple.pci_grade,
    stb: couple.stb_grade,
  };

  const childInfo = childId ? await getChildInfo(childId) : null;
  const template = await findTemplate(grades, reportType);
  const initialStatus = template ? "completed" : "generating";

  // 리포트 생성 + 하트 차감 (트랜잭션)
  const report = await db.transaction(async (tx) => {
    // 하트 차감 (쿠폰 사용자는 스킵)
    let balanceAfter: number | null = null;
    if (!hasCoupon) {
      const [updated] = await tx
        .update(befeCouples)
        .set({
          heart_balance: sql`${befeCouples.heart_balance} - 1`,
          updated_at: new Date().toISOString(),
        })
        .where(
          and(
            eq(befeCouples.id, coupleId),
            sql`${befeCouples.heart_balance} >= 1`,
          ),
        )
        .returning({ balance: befeCouples.heart_balance });

      if (!updated) {
        throw new Error("INSUFFICIENT_HEARTS");
      }
      balanceAfter = updated.balance;
    }

    const [created] = await tx
      .insert(befeReports)
      .values({
        couple_id: coupleId,
        report_type: reportType,
        child_id: childId ?? null,
        child_name: childInfo?.name ?? null,
        child_gender: childInfo?.gender ?? null,
        child_birth_date: childInfo?.birthDate ?? null,
        child_age: childInfo?.age ?? null,
        status: initialStatus,
        content: template ? template.content : null,
        model_version: template?.model_version ?? null,
        prompt_version: template?.prompt_version ?? null,
      })
      .returning({ id: befeReports.id });

    if (!hasCoupon && balanceAfter !== null) {
      await tx.insert(befeHeartTransactions).values({
        couple_id: coupleId,
        type: "use",
        amount: -1,
        balance_after: balanceAfter,
        report_id: created.id,
      });
    }

    return created;
  });

  // 템플릿이 없으면 백그라운드에서 AI 생성 (실패 시 자동 재시도)
  if (!template) {
    after(async () => {
      await generateWithRetry({
        coupleId,
        reportType,
        grades,
        childAge: childInfo?.age,
        reportId: report.id,
      });
    });
  }

  const criterionComplete = await checkCriterionComplete(
    coupleId,
    myProfile.id,
    reportType,
  );

  return { reportId: report.id, criterionComplete };
}

export async function retryReport(reportId: string): Promise<{ error?: string }> {
  const [report] = await db
    .select({
      id: befeReports.id,
      couple_id: befeReports.couple_id,
      report_type: befeReports.report_type,
      child_id: befeReports.child_id,
      status: befeReports.status,
    })
    .from(befeReports)
    .where(eq(befeReports.id, reportId))
    .limit(1);

  if (!report || report.status !== "failed") {
    return { error: "재시도할 수 없는 상태예요." };
  }

  const [couple] = await db
    .select({
      esb_grade: befeCouples.esb_grade,
      csp_grade: befeCouples.csp_grade,
      pci_grade: befeCouples.pci_grade,
      stb_grade: befeCouples.stb_grade,
    })
    .from(befeCouples)
    .where(eq(befeCouples.id, report.couple_id))
    .limit(1);

  if (
    !couple ||
    !couple.esb_grade ||
    !couple.csp_grade ||
    !couple.pci_grade ||
    !couple.stb_grade
  ) {
    return { error: "점수 데이터가 없어요." };
  }

  const grades = {
    esb: couple.esb_grade,
    csp: couple.csp_grade,
    pci: couple.pci_grade,
    stb: couple.stb_grade,
  };

  // 재시도 전에도 템플릿 확인
  const template = await findTemplate(grades, report.report_type);

  if (template) {
    await db
      .update(befeReports)
      .set({
        status: "completed",
        content: template.content,
        model_version: template.model_version,
        prompt_version: template.prompt_version,
      })
      .where(eq(befeReports.id, reportId));

    return {};
  }

  await db
    .update(befeReports)
    .set({ status: "generating" })
    .where(eq(befeReports.id, reportId));

  after(async () => {
    const retryChildInfo = report.child_id
      ? await getChildInfo(report.child_id)
      : null;
    await generateWithRetry({
      coupleId: report.couple_id,
      reportType: report.report_type,
      grades,
      childAge: retryChildInfo?.age,
      reportId,
    });
  });

  return {};
}
