import { db } from "@/db";
import { befeReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const STALE_TIMEOUT_MS = 5 * 60 * 1000; // 5분

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [report] = await db
    .select({
      status: befeReports.status,
      content: befeReports.content,
      created_at: befeReports.created_at,
    })
    .from(befeReports)
    .where(eq(befeReports.id, id))
    .limit(1);

  if (!report) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // generating 상태가 5분 이상이면 failed로 전환
  if (report.status === "generating") {
    const elapsed = Date.now() - new Date(report.created_at).getTime();
    if (elapsed > STALE_TIMEOUT_MS) {
      await db
        .update(befeReports)
        .set({ status: "failed" })
        .where(eq(befeReports.id, id));

      return NextResponse.json({ status: "failed" });
    }
  }

  return NextResponse.json({
    status: report.status,
    ...(report.status === "completed" && report.content ? { content: report.content } : {}),
  });
}
