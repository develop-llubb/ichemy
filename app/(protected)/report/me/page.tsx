import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befePersonalityReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ReportClient } from "./report-client";

export default async function MyReportPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    redirect("/profile/create");
  }

  if (!profile.test_completed) {
    redirect("/test");
  }

  // 기존 성향 리포트 조회
  const [report] = await db
    .select({
      id: befePersonalityReports.id,
      status: befePersonalityReports.status,
      content: befePersonalityReports.content,
    })
    .from(befePersonalityReports)
    .where(eq(befePersonalityReports.profile_id, profile.id))
    .limit(1);

  return (
    <ReportClient
      profileId={profile.id}
      reportId={report?.id ?? null}
      status={report?.status ?? null}
      content={report?.content ?? null}
    />
  );
}
