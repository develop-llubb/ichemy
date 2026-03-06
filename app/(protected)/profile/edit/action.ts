"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export type EditProfileState = {
  error?: string;
  success?: boolean;
};

export async function editProfile(
  _prev: EditProfileState,
  formData: FormData,
): Promise<EditProfileState> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const nickname = (formData.get("nickname") as string)?.trim();
  const role = formData.get("role") as "mom" | "dad";

  if (!nickname || nickname.length < 2) {
    return { error: "닉네임은 2자 이상 입력해주세요." };
  }

  if (nickname.length > 10) {
    return { error: "닉네임은 10자 이하로 입력해주세요." };
  }

  if (!role) {
    return { error: "역할을 선택해주세요." };
  }

  const [profile] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    redirect("/profile/create");
  }

  await db
    .update(befeProfiles)
    .set({
      nickname,
      role,
      updated_at: new Date().toISOString(),
    })
    .where(eq(befeProfiles.id, profile.id));

  redirect("/home");
}
