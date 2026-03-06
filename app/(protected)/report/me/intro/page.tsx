import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befePersonalityReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PersonalityIntroClient } from "./personality-intro-client";

export default async function PersonalityIntroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [profile] = await db
    .select({
      id: befeProfiles.id,
      nickname: befeProfiles.nickname,
      role: befeProfiles.role,
      test_completed: befeProfiles.test_completed,
    })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile || !profile.test_completed) {
    redirect("/home");
  }

  // 이미 리포트가 있으면 바로 결과 페이지로
  const [existing] = await db
    .select({ id: befePersonalityReports.id })
    .from(befePersonalityReports)
    .where(eq(befePersonalityReports.profile_id, profile.id))
    .limit(1);

  if (existing) {
    redirect("/report/me");
  }

  return (
    <PersonalityIntroClient
      nickname={profile.nickname ?? "회원"}
      role={profile.role}
      profileId={profile.id}
    />
  );
}
