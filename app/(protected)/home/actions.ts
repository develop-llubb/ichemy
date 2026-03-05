"use server";

import { db } from "@/db";
import { befeProfiles, befeCouples, befeInvitations } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { populateCoupleScores } from "@/lib/populate-couple-scores";

export async function acceptInvitationFromHome(inviterProfileId: string) {
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

  if (profile.id === inviterProfileId) {
    redirect("/home");
  }

  // 이미 couple이 있으면 스킵
  const [existingCouple] = await db
    .select({ id: befeCouples.id })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
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

  redirect("/home");
}
