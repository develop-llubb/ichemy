import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InviteClient } from "./invite-client";
import { getNavData } from "@/lib/nav-data";

export default async function InvitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  const navData = await getNavData();

  return (
    <InviteClient
      profileId={profile.id}
      nickname={profile.nickname ?? "회원"}
      navData={navData}
    />
  );
}
