import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befeProfiles, befeCouples } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ coupled: false });
  }

  const [couple] = await db
    .select({ id: befeCouples.id, pcq_score: befeCouples.pcq_score })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
      ),
    )
    .limit(1);

  if (!couple) {
    return NextResponse.json({ coupled: false });
  }

  return NextResponse.json({
    coupled: true,
    hasScores: couple.pcq_score !== null,
  });
}
