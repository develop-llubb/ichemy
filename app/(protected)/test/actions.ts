"use server";

import { db } from "@/db";
import { befeAnswers, befeProfiles, befeCouples } from "@/db/schema";
import type { BefeProfile } from "@/db/schema";
import { eq, and, lt, or } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveAnswer(
  profileId: string,
  questionId: string,
  answer: number,
  nextIndex: number,
) {
  // upsert answer
  await db
    .insert(befeAnswers)
    .values({
      profile_id: profileId,
      question_id: questionId,
      answer,
    })
    .onConflictDoUpdate({
      target: [befeAnswers.profile_id, befeAnswers.question_id],
      set: { answer },
    });

  // test_index를 nextIndex로 업데이트 (현재값보다 클 때만)
  await db
    .update(befeProfiles)
    .set({ test_index: nextIndex })
    .where(
      and(
        eq(befeProfiles.id, profileId),
        lt(befeProfiles.test_index, nextIndex),
      ),
    );
}

export async function completeTest(
  profileId: string,
  patch: Partial<BefeProfile>,
) {
  await db
    .update(befeProfiles)
    .set(patch)
    .where(eq(befeProfiles.id, profileId));

  // 양쪽 다 검사 완료 시 couple 자동 생성
  await tryCreateCouple(profileId);
}

async function tryCreateCouple(profileId: string) {
  // 이미 couple이 있으면 스킵
  const [existingCouple] = await db
    .select({ id: befeCouples.id })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profileId),
        eq(befeCouples.invitee_profile_id, profileId),
      ),
    )
    .limit(1);

  if (existingCouple) return;

  // 내 프로필 조회
  const [me] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.id, profileId))
    .limit(1);

  if (!me) return;

  // 파트너 찾기: invited_by 관계
  let partner: { id: string; test_completed: boolean | null } | null = null;

  if (me.invited_by) {
    const [inviter] = await db
      .select({ id: befeProfiles.id, test_completed: befeProfiles.test_completed })
      .from(befeProfiles)
      .where(eq(befeProfiles.id, me.invited_by))
      .limit(1);
    partner = inviter ?? null;
  } else {
    const [invitee] = await db
      .select({ id: befeProfiles.id, test_completed: befeProfiles.test_completed })
      .from(befeProfiles)
      .where(eq(befeProfiles.invited_by, profileId))
      .limit(1);
    partner = invitee ?? null;
  }

  if (!partner || !partner.test_completed) return;

  // 초대한 쪽이 inviter
  const inviterProfileId = me.invited_by ? me.invited_by : profileId;
  const inviteeProfileId = me.invited_by ? profileId : partner.id;

  await db
    .insert(befeCouples)
    .values({
      inviter_profile_id: inviterProfileId,
      invitee_profile_id: inviteeProfileId,
    })
    .onConflictDoNothing();
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
