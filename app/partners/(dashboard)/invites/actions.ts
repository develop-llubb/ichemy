"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befePartners, befePartnerInvitations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPartnerInvitation(
  partnerId: string,
  label: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  // Verify ownership
  const [partner] = await db
    .select({ id: befePartners.id })
    .from(befePartners)
    .where(eq(befePartners.id, partnerId))
    .limit(1);

  if (!partner) {
    return { error: "파트너 정보를 찾을 수 없습니다." };
  }

  const code = nanoid(10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const [invitation] = await db
    .insert(befePartnerInvitations)
    .values({
      partner_id: partnerId,
      code,
      label: label || null,
      expires_at: expiresAt.toISOString(),
    })
    .returning({ id: befePartnerInvitations.id, code: befePartnerInvitations.code });

  revalidatePath("/partners/invites");

  return { code: invitation.code };
}
