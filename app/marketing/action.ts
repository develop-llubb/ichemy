"use server";

import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function updateThirdPartyAgreed(agreed: boolean) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return;

  await db
    .update(befeProfiles)
    .set({ third_party_agreed: agreed })
    .where(eq(befeProfiles.user_id, user.id));
}
