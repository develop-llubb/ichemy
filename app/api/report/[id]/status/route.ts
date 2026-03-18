import { db } from "@/db";
import { befeReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [report] = await db
    .select({
      status: befeReports.status,
      content: befeReports.content,
    })
    .from(befeReports)
    .where(eq(befeReports.id, id))
    .limit(1);

  if (!report) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: report.status,
    ...(report.status === "completed" && report.content ? { content: report.content } : {}),
  });
}
