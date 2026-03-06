"use server";

import { db } from "@/db";
import { befeCouples, befeReports } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { after } from "next/server";
import { generateCareReport } from "@/lib/generate-report";
import { PROMPT_VERSION } from "@/lib/report-prompt";

export async function saveHasChildren(coupleId: string, hasChildren: boolean) {
  await db
    .update(befeCouples)
    .set({
      has_children: hasChildren,
      updated_at: new Date().toISOString(),
    })
    .where(eq(befeCouples.id, coupleId));
}

export async function requestReport(
  coupleId: string,
  hasChildren: boolean,
): Promise<{ reportId: string } | { error: string }> {
  // 기존 리포트 확인 (couple_id + has_children 조합)
  const [existing] = await db
    .select({ id: befeReports.id })
    .from(befeReports)
    .where(
      and(
        eq(befeReports.couple_id, coupleId),
        eq(befeReports.has_children, hasChildren),
      ),
    )
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

  // generating 상태로 리포트 레코드 생성
  const [report] = await db
    .insert(befeReports)
    .values({
      couple_id: coupleId,
      has_children: hasChildren,
      status: "generating",
    })
    .returning({ id: befeReports.id });

  // 백그라운드에서 리포트 생성
  after(async () => {
    try {
      const { content, modelVersion } = await generateCareReport({
        sequence: 1,
        coupleId,
        hasChildren,
        grades: {
          esb: couple.esb_grade!,
          csp: couple.csp_grade!,
          pci: couple.pci_grade!,
          stb: couple.stb_grade!,
        },
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
      has_children: befeReports.has_children,
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

  // generating으로 상태 변경
  await db
    .update(befeReports)
    .set({ status: "generating" })
    .where(eq(befeReports.id, reportId));

  // 백그라운드에서 리포트 재생성
  after(async () => {
    try {
      const { content, modelVersion } = await generateCareReport({
        sequence: 1,
        coupleId: report.couple_id,
        hasChildren: report.has_children,
        grades: {
          esb: couple.esb_grade!,
          csp: couple.csp_grade!,
          pci: couple.pci_grade!,
          stb: couple.stb_grade!,
        },
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
