"use server";

import { db } from "@/db";
import { befeCouples, befeReports, befeReportTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

export async function requestReport(
  coupleId: string,
  reportType: ReportType,
  childId?: string,
): Promise<{ reportId: string } | { error: string }> {
  // 기존 리포트 확인
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
    return { reportId: existing.id };
  }

  // couple 데이터 조회
  const [couple] = await db
    .select({
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

  const grades = {
    esb: couple.esb_grade,
    csp: couple.csp_grade,
    pci: couple.pci_grade,
    stb: couple.stb_grade,
  };

  // 자녀 스냅샷 조회
  const childInfo = childId ? await getChildInfo(childId) : null;

  // 템플릿 캐시 확인
  const template = await findTemplate(grades, reportType);

  if (template) {
    // 템플릿이 있으면 즉시 completed 리포트 생성
    const [report] = await db
      .insert(befeReports)
      .values({
        couple_id: coupleId,
        report_type: reportType,
        child_id: childId ?? null,
        child_name: childInfo?.name ?? null,
        child_gender: childInfo?.gender ?? null,
        child_birth_date: childInfo?.birthDate ?? null,
        child_age: childInfo?.age ?? null,
        status: "completed",
        content: template.content,
        model_version: template.model_version,
        prompt_version: template.prompt_version,
      })
      .returning({ id: befeReports.id });

    return { reportId: report.id };
  }

  // 템플릿이 없으면 generating 상태로 리포트 생성
  const [report] = await db
    .insert(befeReports)
    .values({
      couple_id: coupleId,
      report_type: reportType,
      child_id: childId ?? null,
      child_name: childInfo?.name ?? null,
      child_gender: childInfo?.gender ?? null,
      child_birth_date: childInfo?.birthDate ?? null,
      child_age: childInfo?.age ?? null,
      status: "generating",
    })
    .returning({ id: befeReports.id });

  // 백그라운드에서 리포트 생성 + 템플릿 저장
  after(async () => {
    try {
      const { content, modelVersion } = await generateCareReport({
        sequence: 1,
        coupleId,
        reportType,
        grades,
        childAge: childInfo?.age,
      });

      await db
        .update(befeReports)
        .set({
          status: "completed",
          content,
          model_version: modelVersion,
          prompt_version: PROMPT_VERSION,
        })
        .where(eq(befeReports.id, report.id));

      // 템플릿에도 저장
      await saveTemplate(grades, reportType, content, modelVersion);
    } catch (e) {
      console.error("Report generation failed:", e);
      await db
        .update(befeReports)
        .set({ status: "failed" })
        .where(eq(befeReports.id, report.id));
    }
  });

  return { reportId: report.id };
}

export async function retryReport(reportId: string): Promise<{ error?: string }> {
  // 리포트 조회
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

  // couple 데이터 조회
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

  // generating으로 상태 변경
  await db
    .update(befeReports)
    .set({ status: "generating" })
    .where(eq(befeReports.id, reportId));

  // 백그라운드에서 리포트 재생성 + 템플릿 저장
  after(async () => {
    try {
      const retryChildInfo = report.child_id ? await getChildInfo(report.child_id) : null;
      const { content, modelVersion } = await generateCareReport({
        sequence: 1,
        coupleId: report.couple_id,
        reportType: report.report_type,
        grades,
        childAge: retryChildInfo?.age,
      });

      await db
        .update(befeReports)
        .set({
          status: "completed",
          content,
          model_version: modelVersion,
          prompt_version: PROMPT_VERSION,
        })
        .where(eq(befeReports.id, reportId));

      await saveTemplate(grades, report.report_type, content, modelVersion);
    } catch (e) {
      console.error("Report generation retry failed:", e);
      await db
        .update(befeReports)
        .set({ status: "failed" })
        .where(eq(befeReports.id, reportId));
    }
  });

  return {};
}
