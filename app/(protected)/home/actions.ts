"use server";

import { db } from "@/db";
import { befeProfiles, befeCouples, befeInvitations } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { populateCoupleScores } from "@/lib/populate-couple-scores";

export async function acceptInvitationFromHome(
  inviterProfileId: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

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

  if (profile.id === inviterProfileId) {
    redirect("/home");
  }

  // 나 또는 초대자가 이미 couple이면 스킵
  const [existingCouple] = await db
    .select({ id: befeCouples.id })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
        eq(befeCouples.inviter_profile_id, inviterProfileId),
        eq(befeCouples.invitee_profile_id, inviterProfileId),
      ),
    )
    .limit(1);

  if (!existingCouple) {
    const [newCouple] = await db
      .insert(befeCouples)
      .values({
        inviter_profile_id: inviterProfileId,
        invitee_profile_id: profile.id,
      })
      .onConflictDoNothing()
      .returning({ id: befeCouples.id });

    if (newCouple) {
      const [inviter] = await db
        .select({ test_completed: befeProfiles.test_completed })
        .from(befeProfiles)
        .where(eq(befeProfiles.id, inviterProfileId))
        .limit(1);

      if (profile.test_completed && inviter?.test_completed) {
        await populateCoupleScores(newCouple.id);
      }
    }
  }

  // invitation 상태 업데이트
  await db
    .update(befeInvitations)
    .set({ status: "accepted", updated_at: new Date().toISOString() })
    .where(
      and(
        eq(befeInvitations.inviter_profile_id, inviterProfileId),
        eq(befeInvitations.invitee_profile_id, profile.id),
      ),
    );

  return { success: true };
}

export async function updateThirdPartyAgreed(agreed: boolean) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  await db
    .update(befeProfiles)
    .set({ third_party_agreed: agreed })
    .where(eq(befeProfiles.user_id, user.id));
}
