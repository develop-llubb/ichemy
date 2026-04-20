import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples, questions } from "@/db/schema";
import { eq, or, count } from "drizzle-orm";
import { WaitingClient } from "./waiting-client";
import { getNavData } from "@/lib/nav-data";

export default async function WaitingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  const [couple] = await db
    .select({
      inviter_profile_id: befeCouples.inviter_profile_id,
      invitee_profile_id: befeCouples.invitee_profile_id,
    })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
      ),
    )
    .limit(1);

  if (!couple) {
    redirect("/home/invite");
  }

  const partnerId =
    couple.inviter_profile_id === profile.id
      ? couple.invitee_profile_id
      : couple.inviter_profile_id;

  const [partner] = await db
    .select({
      nickname: befeProfiles.nickname,
      test_index: befeProfiles.test_index,
      test_completed: befeProfiles.test_completed,
    })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, partnerId))
    .limit(1);

  if (!partner) {
    redirect("/home");
  }

  if (partner.test_completed) {
    redirect("/home");
  }

  const [{ total }] = await db
    .select({ total: count() })
    .from(questions);

  const navData = await getNavData();

  return (
    <WaitingClient
      nickname={profile.nickname ?? "회원"}
      partnerNickname={partner.nickname ?? "배우자"}
      partnerTestIndex={partner.test_index}
      totalQuestions={total}
      navData={navData}
    />
  );
}
