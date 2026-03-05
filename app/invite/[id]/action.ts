"use server";

import { db } from "@/db";
import { befeProfiles, befeCouples } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function acceptInvite(inviterProfileId: string) {
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

  if (!profile || profile.id === inviterProfileId) {
    redirect("/home");
  }

  // invited_by 설정
  if (!profile.invited_by) {
    await db
      .update(befeProfiles)
      .set({ invited_by: inviterProfileId })
      .where(eq(befeProfiles.id, profile.id));
  }

  // 양쪽 검사 완료 시 couple 생성
  const [inviter] = await db
    .select({ test_completed: befeProfiles.test_completed })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, inviterProfileId))
    .limit(1);

  if (profile.test_completed && inviter?.test_completed) {
    const [existing] = await db
      .select({ id: befeCouples.id })
      .from(befeCouples)
      .where(
        or(
          eq(befeCouples.inviter_profile_id, profile.id),
          eq(befeCouples.invitee_profile_id, profile.id),
        ),
      )
      .limit(1);

    if (!existing) {
      await db
        .insert(befeCouples)
        .values({
          inviter_profile_id: inviterProfileId,
          invitee_profile_id: profile.id,
        })
        .onConflictDoNothing();
    }
  }

  // 검사 미완료면 테스트로, 완료면 홈으로
  if (!profile.test_completed) {
    redirect("/test/intro");
  }

  redirect("/home");
}
