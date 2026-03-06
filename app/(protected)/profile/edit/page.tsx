import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EditProfileForm } from "./form";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile] = await db
    .select({
      nickname: befeProfiles.nickname,
      role: befeProfiles.role,
    })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  return (
    <EditProfileForm
      currentNickname={profile.nickname ?? ""}
      currentRole={profile.role}
    />
  );
}
