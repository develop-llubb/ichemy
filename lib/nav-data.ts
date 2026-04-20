import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befeProfiles, befeCouples } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export interface NavData {
  nickname: string;
  role: "mom" | "dad";
  hasCouple: boolean;
  heartBalance: number | null;
}

export async function getNavData(): Promise<NavData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile] = await db
    .select({
      id: befeProfiles.id,
      nickname: befeProfiles.nickname,
      role: befeProfiles.role,
    })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  const [couple] = await db
    .select({
      id: befeCouples.id,
      heart_balance: befeCouples.heart_balance,
    })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
      ),
    )
    .limit(1);

  return {
    nickname: profile.nickname ?? "회원",
    role: profile.role,
    hasCouple: !!couple,
    heartBalance: couple?.heart_balance ?? null,
  };
}
