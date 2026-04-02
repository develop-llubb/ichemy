import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, befeChildren } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ChildrenClient } from "./children-client";

export default async function ChildrenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  const [couple] = await db
    .select({ id: befeCouples.id })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
      ),
    )
    .limit(1);

  if (!couple) {
    redirect("/home");
  }

  const childrenRaw = await db
    .select({
      id: befeChildren.id,
      name: befeChildren.name,
      gender: befeChildren.gender,
      birth_date: befeChildren.birth_date,
      photo_url: befeChildren.photo_url,
    })
    .from(befeChildren)
    .where(eq(befeChildren.couple_id, couple.id));

  const children = childrenRaw.map((c) => ({
    ...c,
    photo_url: c.photo_url
      ? supabase.storage.from("images").getPublicUrl(c.photo_url).data.publicUrl
      : null,
  }));

  return (
    <ChildrenClient
      coupleId={couple.id}
      children={children}
    />
  );
}
