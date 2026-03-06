import { db } from "@/db";
import { befeReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReportResultClient } from "./report-result-client";

export default async function ReportResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [report] = await db
    .select({
      id: befeReports.id,
      has_children: befeReports.has_children,
      status: befeReports.status,
      content: befeReports.content,
    })
    .from(befeReports)
    .where(eq(befeReports.id, id))
    .limit(1);

  if (!report) {
    notFound();
  }

  return (
    <ReportResultClient
      reportId={report.id}
      hasChildren={report.has_children}
      status={report.status}
      content={report.content}
    />
  );
}
