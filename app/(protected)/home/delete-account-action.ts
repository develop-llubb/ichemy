"use server";

import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const [profile] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    return { error: "프로필을 찾을 수 없어요." };
  }

  // soft delete
  await db.execute(
    sql`UPDATE befe_profiles SET deleted_at = now() WHERE id = ${profile.id}`,
  );

  // 로그아웃
  await supabase.auth.signOut();

  const headerList = await headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "https://www.ichemy.co.kr";
  const logoutRedirectUri = encodeURIComponent(`${origin}/`);

  redirect(
    `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_REST_API_KEY}&logout_redirect_uri=${logoutRedirectUri}`,
  );
}
