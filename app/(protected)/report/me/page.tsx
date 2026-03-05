import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  befeProfiles,
  reportBig5,
  reportAas,
  reportFlexibility,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ReportClient } from "./report-client";

export default async function MyReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  // 3개 report 조회
  const [big5Report] = profile.big_5_type != null
    ? await db
        .select()
        .from(reportBig5)
        .where(eq(reportBig5.big_5_type, profile.big_5_type))
        .limit(1)
    : [undefined];

  const [aasReport] = profile.attachment_type && profile.aas_intensity != null
    ? await db
        .select()
        .from(reportAas)
        .where(
          and(
            eq(reportAas.type, profile.attachment_type),
            eq(reportAas.aas_intensity, profile.aas_intensity),
          ),
        )
        .limit(1)
    : [undefined];

  const [flexReport] = profile.flexibility_level != null
    ? await db
        .select()
        .from(reportFlexibility)
        .where(
          eq(reportFlexibility.flexibility_level, profile.flexibility_level),
        )
        .limit(1)
    : [undefined];

  return (
    <ReportClient
      profile={profile}
      big5Report={big5Report ?? null}
      aasReport={aasReport ?? null}
      flexReport={flexReport ?? null}
    />
  );
}
