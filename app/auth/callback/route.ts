import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

  // invited_by 쿠키가 있으면 초대 페이지로 (invite page가 상태별 분기 처리)
  const invitedBy = cookieStore.get("invited_by")?.value;
  if (invitedBy) {
    return NextResponse.redirect(`${origin}/invite/${invitedBy}`);
  }

  return NextResponse.redirect(`${origin}/home`);
}
