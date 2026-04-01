"use server";

import { db } from "@/db";
import { befeChildren, befeCouples } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function getUploadUrl(coupleId: string, ext: string) {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
  const path = `children/${coupleId}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage
    .from("images")
    .createSignedUploadUrl(path);
  if (error) throw new Error(error.message);
  return { signedUrl: data.signedUrl, path };
}

export async function addChild(
  coupleId: string,
  data: { name: string; birthDate: string; photoUrl?: string },
) {
  const [child] = await db
    .insert(befeChildren)
    .values({
      couple_id: coupleId,
      name: data.name,
      birth_date: data.birthDate,
      photo_url: data.photoUrl ?? null,
    })
    .returning({ id: befeChildren.id });

  // has_children을 true로 설정
  await db
    .update(befeCouples)
    .set({ has_children: true, updated_at: new Date().toISOString() })
    .where(eq(befeCouples.id, coupleId));

  return { id: child.id };
}

export async function updateChild(
  childId: string,
  data: { name?: string; birthDate?: string; photoUrl?: string | null },
) {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.name !== undefined) updates.name = data.name;
  if (data.birthDate !== undefined) updates.birth_date = data.birthDate;
  if (data.photoUrl !== undefined) updates.photo_url = data.photoUrl;

  await db
    .update(befeChildren)
    .set(updates)
    .where(eq(befeChildren.id, childId));
}

export async function deleteChild(childId: string, coupleId: string) {
  await db.delete(befeChildren).where(eq(befeChildren.id, childId));

  // 남은 자녀가 없으면 has_children 리셋
  const remaining = await db
    .select({ id: befeChildren.id })
    .from(befeChildren)
    .where(eq(befeChildren.couple_id, coupleId))
    .limit(1);

  if (remaining.length === 0) {
    await db
      .update(befeCouples)
      .set({ has_children: null, updated_at: new Date().toISOString() })
      .where(eq(befeCouples.id, coupleId));
  }
}
