import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeCoupons, befePartnerInvitations } from "@/db/schema";
import { eq, or } from "drizzle-orm";

function getOrigin(request: NextRequest) {
  const host = request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = getOrigin(request);

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  // 1. code → token 교환
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_REST_API_KEY!,
      redirect_uri: `${origin}/auth/callback`,
      client_secret: process.env.KAKAO_CLIENT_SECRET!,
      code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.id_token) {
    console.error("Kakao token exchange failed:", tokenData);
    return NextResponse.redirect(`${origin}/?error=token_failed`);
  }

  // 2. signInWithIdToken → 쿠키에 세션 저장
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "kakao",
    token: tokenData.id_token,
  });

  if (error) {
    console.error("signInWithIdToken failed:", error);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  // 로그인한 유저 정보 + 프로필 조회 (공통으로 사용)
  const { data: { user: authedUser } } = await supabase.auth.getUser();
  let profile: { id: string; coupon_id: string | null; partner_invitation_id: string | null } | undefined;
  if (authedUser) {
    const [p] = await db
      .select({ id: befeProfiles.id, coupon_id: befeProfiles.coupon_id, partner_invitation_id: befeProfiles.partner_invitation_id })
      .from(befeProfiles)
      .where(eq(befeProfiles.user_id, authedUser.id))
      .limit(1);
    profile = p;
  }

  // coupon_code 쿠키 처리 (invited_by보다 먼저 — 쿠폰 페이지에서 로그인한 경우)
  const couponCode = cookieStore.get("coupon_code")?.value;
  if (couponCode) {
    // 프로필이 없으면 바로 프로필 생성 페이지로 (쿠폰 코드 전달)
    if (!profile) {
      return NextResponse.redirect(
        `${origin}/profile/create?coupon=${encodeURIComponent(couponCode)}`,
      );
    }

    // 이미 쿠폰 보유 → 쿠키 삭제하고 fall through
    if (profile.coupon_id) {
      cookieStore.delete("coupon_code");
    } else {
      // 프로필 있고 쿠폰 미보유 → 쿠폰 페이지로
      const [coupon] = await db
        .select({
          id: befeCoupons.id,
          expires_at: befeCoupons.expires_at,
          max_uses: befeCoupons.max_uses,
          current_uses: befeCoupons.current_uses,
        })
        .from(befeCoupons)
        .where(eq(befeCoupons.code, couponCode))
        .limit(1);

      const expired = coupon?.expires_at
        ? new Date(coupon.expires_at) < new Date()
        : false;
      const exhausted =
        coupon?.max_uses !== null && coupon?.max_uses !== undefined
          ? coupon.current_uses >= coupon.max_uses
          : false;

      if (coupon && !expired && !exhausted) {
        return NextResponse.redirect(`${origin}/coupon/${couponCode}`);
      }
      cookieStore.delete("coupon_code");
    }
  }

  // partner_invite 쿠키 처리
  const partnerInviteCode = cookieStore.get("partner_invite")?.value;
  if (partnerInviteCode) {
    const [invitation] = await db
      .select({ id: befePartnerInvitations.id })
      .from(befePartnerInvitations)
      .where(eq(befePartnerInvitations.code, partnerInviteCode))
      .limit(1);

    if (invitation) {
      if (!profile) {
        // 프로필 없으면 프로필 생성으로 (쿠키 유지)
        return NextResponse.redirect(`${origin}/profile/create`);
      }

      // 프로필이 있고 아직 partner_invitation_id가 없으면 설정
      if (!profile.partner_invitation_id) {
        await db
          .update(befeProfiles)
          .set({ partner_invitation_id: invitation.id })
          .where(eq(befeProfiles.id, profile.id));

        // 초대의 profile_id도 업데이트
        await db
          .update(befePartnerInvitations)
          .set({
            profile_id: profile.id,
            status: "accepted",
            updated_at: new Date().toISOString(),
          })
          .where(eq(befePartnerInvitations.id, invitation.id));
      }
    }
    cookieStore.delete("partner_invite");
  }

  // invited_by 쿠키 처리
  const invitedBy = cookieStore.get("invited_by")?.value;
  if (invitedBy) {
    const [inviter] = await db
      .select({ id: befeProfiles.id })
      .from(befeProfiles)
      .where(eq(befeProfiles.id, invitedBy))
      .limit(1);

    if (inviter) {
      const [inviterCouple] = await db
        .select({ id: befeCouples.id })
        .from(befeCouples)
        .where(
          or(
            eq(befeCouples.inviter_profile_id, inviter.id),
            eq(befeCouples.invitee_profile_id, inviter.id),
          ),
        )
        .limit(1);

      if (!inviterCouple) {
        // 프로필 없으면 바로 프로필 생성으로 (invited_by 쿠키는 유지)
        if (!profile) {
          return NextResponse.redirect(`${origin}/profile/create`);
        }
        return NextResponse.redirect(`${origin}/invite/${invitedBy}`);
      }
    }
    cookieStore.delete("invited_by");
  }

  return NextResponse.redirect(`${origin}/home`);
}
