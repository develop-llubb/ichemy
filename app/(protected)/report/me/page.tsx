import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befeProfiles, befePersonalityReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ReportClient } from "./report-client";
import { getNavData } from "@/lib/nav-data";

export default async function MyReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  const [report] = await db
    .select({
      id: befePersonalityReports.id,
      status: befePersonalityReports.status,
      content: befePersonalityReports.content,
    })
    .from(befePersonalityReports)
    .where(eq(befePersonalityReports.profile_id, profile.id))
    .limit(1);

  const navData = await getNavData();

  return (
    <ReportClient
      profileId={profile.id}
      reportId={report?.id ?? null}
      status={report?.status ?? null}
      content={report?.content ?? null}
      navData={navData}
    />
  );
}
