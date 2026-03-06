import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InviteClient } from "./invite-client";

export default async function InvitePage() {
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

  return <InviteClient profileId={profile.id} nickname={profile.nickname ?? "회원"} />;
}
