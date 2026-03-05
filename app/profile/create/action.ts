"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
  const invitedByCookie = cookieStore.get("invited_by")?.value || null;

  // invited_by 프로필이 실제 존재하는지 확인
  let invitedBy: string | null = null;
  if (invitedByCookie) {
    const [inviter] = await db
      .select({ id: befeProfiles.id })
      .from(befeProfiles)
      .where(eq(befeProfiles.id, invitedByCookie))
      .limit(1);
    invitedBy = inviter ? inviter.id : null;
  }

  await db.insert(befeProfiles).values({
    user_id: user.id,
    nickname,
    role,
    third_party_agreed: thirdPartyAgreed,
    invited_by: invitedBy,
  });

  // 쿠키 제거
  if (invitedBy) {
    cookieStore.delete("invited_by");
  }

  redirect("/test/intro");
}
