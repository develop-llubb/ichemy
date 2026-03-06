import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { befeProfiles, befeCouples } from "@/db/schema";
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

  // invited_by 쿠키가 있으면 초대 페이지로 (초대자 프로필이 존재할 때만)
  const invitedBy = cookieStore.get("invited_by")?.value;
  if (invitedBy) {
    const [inviter] = await db
      .select({ id: befeProfiles.id })
      .from(befeProfiles)
      .where(eq(befeProfiles.id, invitedBy))
      .limit(1);

    if (inviter) {
      // 초대자가 이미 커플이 있으면 초대 무효
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
        return NextResponse.redirect(`${origin}/invite/${invitedBy}`);
      }
    }
    // 초대자 없거나 이미 커플 → 쿠키 제거하고 fall through
    cookieStore.delete("invited_by");
  }

  // coupon_code 쿠키가 있으면 쿠폰 페이지로
  const couponCode = cookieStore.get("coupon_code")?.value;
  if (couponCode) {
    return NextResponse.redirect(`${origin}/coupon/${couponCode}`);
  }

  return NextResponse.redirect(`${origin}/home`);
}
