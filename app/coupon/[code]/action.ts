"use server";

import { db } from "@/db";
import { befeProfiles, befeCoupons } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function redeemCoupon(
  couponCode: string,
): Promise<{ error: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const [profile] = await db
    .select({ id: befeProfiles.id, coupon_id: befeProfiles.coupon_id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    redirect("/profile/create");
  }

  if (profile.coupon_id) {
    return { error: "이미 쿠폰을 받으셨어요." };
  }

  const [coupon] = await db
    .select()
    .from(befeCoupons)
    .where(eq(befeCoupons.code, couponCode))
    .limit(1);

  if (!coupon) {
    return { error: "유효하지 않은 쿠폰이에요." };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { error: "만료된 쿠폰이에요." };
  }

  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return { error: "쿠폰 사용 한도를 초과했어요." };
  }

  if (profile.coupon_id) {
    return { error: "이미 쿠폰을 받았어요." };
  }

  // 쿠폰 사용 처리
  await db
    .update(befeCoupons)
    .set({
      current_uses: sql`${befeCoupons.current_uses} + 1`,
      used_by_profile_ids: sql`array_append(${befeCoupons.used_by_profile_ids}, ${profile.id}::uuid)`,
    })
    .where(eq(befeCoupons.id, coupon.id));

  // 프로필에 쿠폰 적용
  await db
    .update(befeProfiles)
    .set({ coupon_id: coupon.id })
    .where(eq(befeProfiles.id, profile.id));

  // 쿠키 제거
  const cookieStore = await cookies();
  cookieStore.delete("coupon_code");

  redirect("/home");
}
