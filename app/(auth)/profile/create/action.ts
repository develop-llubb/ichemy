"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeCoupons, befePartnerInvitations } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export type CreateProfileState = {
  error?: string;
};

export async function createProfile(
  _prev: CreateProfileState,
  formData: FormData,
): Promise<CreateProfileState> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const nickname = (formData.get("nickname") as string)?.trim();
  const role = formData.get("role") as "mom" | "dad";
  const thirdPartyAgreed = formData.get("third_party_agreed") === "true";

  if (!nickname || nickname.length < 2) {
    return { error: "닉네임은 2자 이상 입력해주세요." };
  }

  if (!role) {
    return { error: "역할을 선택해주세요." };
  }

  // 중복 체크
  const [existing] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (existing) {
    redirect("/home");
  }

  const cookieStore = await cookies();
  const inviterIdCookie = cookieStore.get("invited_by")?.value || null;
  const partnerInviteCode = cookieStore.get("partner_invite")?.value || null;

  // 초대자 프로필이 실제 존재하는지 확인
  let inviterProfileId: string | null = null;
  if (inviterIdCookie) {
    const [inviter] = await db
      .select({ id: befeProfiles.id })
      .from(befeProfiles)
      .where(eq(befeProfiles.id, inviterIdCookie))
      .limit(1);
    inviterProfileId = inviter ? inviter.id : null;
  }

  const [newProfile] = await db
    .insert(befeProfiles)
    .values({
      user_id: user.id,
      nickname,
      role,
      third_party_agreed: thirdPartyAgreed,
    })
    .returning({ id: befeProfiles.id });

  // couple 생성 (초대자가 있고, 초대자가 아직 커플이 아닌 경우만)
  if (inviterProfileId && newProfile) {
    const [inviterCouple] = await db
      .select({ id: befeCouples.id })
      .from(befeCouples)
      .where(
        or(
          eq(befeCouples.inviter_profile_id, inviterProfileId),
          eq(befeCouples.invitee_profile_id, inviterProfileId),
        ),
      )
      .limit(1);

    if (!inviterCouple) {
      const [newCouple] = await db
        .insert(befeCouples)
        .values({
          inviter_profile_id: inviterProfileId,
          invitee_profile_id: newProfile.id,
        })
        .onConflictDoNothing()
        .returning({ id: befeCouples.id });

      // 파트너 초대와 커플 연결
      if (newCouple && partnerInviteCode) {
        const [inv] = await db
          .select({ id: befePartnerInvitations.id })
          .from(befePartnerInvitations)
          .where(eq(befePartnerInvitations.code, partnerInviteCode))
          .limit(1);

        if (inv) {
          await db
            .update(befePartnerInvitations)
            .set({ couple_id: newCouple.id, updated_at: new Date().toISOString() })
            .where(eq(befePartnerInvitations.id, inv.id));
        }
      }
    }
  }

  // partner_invite 쿠키 처리
  if (partnerInviteCode && newProfile) {
    const [invitation] = await db
      .select({ id: befePartnerInvitations.id })
      .from(befePartnerInvitations)
      .where(eq(befePartnerInvitations.code, partnerInviteCode))
      .limit(1);

    if (invitation) {
      await db
        .update(befeProfiles)
        .set({ partner_invitation_id: invitation.id })
        .where(eq(befeProfiles.id, newProfile.id));

      await db
        .update(befePartnerInvitations)
        .set({
          profile_id: newProfile.id,
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .where(eq(befePartnerInvitations.id, invitation.id));
    }
    cookieStore.delete("partner_invite");
  }

  // coupon_code: 쿠키 또는 formData에서 가져옴
  const couponCode = cookieStore.get("coupon_code")?.value || (formData.get("coupon_code") as string) || null;

  if (couponCode && newProfile) {
    const [coupon] = await db
      .select({
        id: befeCoupons.id,
        expires_at: befeCoupons.expires_at,
        max_uses: befeCoupons.max_uses,
        current_uses: befeCoupons.current_uses,
        used_by_profile_ids: befeCoupons.used_by_profile_ids,
      })
      .from(befeCoupons)
      .where(eq(befeCoupons.code, couponCode))
      .limit(1);

    if (coupon) {
      const expired = coupon.expires_at
        ? new Date(coupon.expires_at) < new Date()
        : false;
      const exhausted =
        coupon.max_uses !== null ? coupon.current_uses >= coupon.max_uses : false;

      const alreadyUsed = coupon.used_by_profile_ids?.includes(newProfile.id);

      if (!expired && !exhausted && !alreadyUsed) {
        await db
          .update(befeCoupons)
          .set({
            current_uses: sql`${befeCoupons.current_uses} + 1`,
            used_by_profile_ids: sql`array_append(${befeCoupons.used_by_profile_ids}, ${newProfile.id}::uuid)`,
          })
          .where(eq(befeCoupons.id, coupon.id));

        await db
          .update(befeProfiles)
          .set({ coupon_id: coupon.id })
          .where(eq(befeProfiles.id, newProfile.id));

      }
    }
    cookieStore.delete("coupon_code");
  }

  // 쿠키 제거
  if (inviterProfileId) {
    cookieStore.delete("invited_by");
  }

  redirect("/test/intro");
}
