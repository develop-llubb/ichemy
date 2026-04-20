import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befePersonalityReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PersonalityIntroClient } from "./personality-intro-client";
import { getNavData } from "@/lib/nav-data";

export default async function PersonalityIntroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile] = await db
    .select({
      id: befeProfiles.id,
      nickname: befeProfiles.nickname,
      role: befeProfiles.role,
    })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  // 이미 리포트가 있으면 바로 결과 페이지로
  const [existing] = await db
    .select({ id: befePersonalityReports.id })
    .from(befePersonalityReports)
    .where(eq(befePersonalityReports.profile_id, profile.id))
    .limit(1);

  if (existing) {
    redirect("/report/me");
  }

  const navData = await getNavData();

  return (
    <PersonalityIntroClient
      nickname={profile.nickname ?? "회원"}
      role={profile.role}
      profileId={profile.id}
      navData={navData}
    />
  );
}
