"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befePartners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export type RegisterPartnerState = {
  error?: string;
};

export async function registerPartner(
  _prev: RegisterPartnerState,
  formData: FormData,
): Promise<RegisterPartnerState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  // Already a partner
  const [existing] = await db
    .select({ id: befePartners.id })
    .from(befePartners)
    .where(eq(befePartners.user_id, user.id))
    .limit(1);

  if (existing) {
    redirect("/partners");
  }

  const name = (formData.get("name") as string)?.trim();
  const partnerType = formData.get("partner_type") as
    | "academy"
    | "insurance"
    | "other";
  const phone = (formData.get("phone") as string)?.trim() || null;
  const company = (formData.get("company") as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "이름은 2자 이상 입력해주세요." };
  }

  if (!partnerType) {
    return { error: "업종을 선택해주세요." };
  }

  await db.insert(befePartners).values({
    user_id: user.id,
    name,
    partner_type: partnerType,
    phone,
    company,
  });

  redirect("/partners");
}
