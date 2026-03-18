"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // 카카오 계정 세션도 로그아웃
  const headerList = await headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "https://www.ichemy.co.kr";
  const logoutRedirectUri = encodeURIComponent(`${origin}/`);

  redirect(
    `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_REST_API_KEY}&logout_redirect_uri=${logoutRedirectUri}`,
  );
}
