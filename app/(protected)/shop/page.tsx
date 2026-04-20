import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeCouples } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ShopClient } from "./shop-client";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  const [couple] = await db
    .select({
      id: befeCouples.id,
      heart_balance: befeCouples.heart_balance,
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
    redirect("/home");
  }

  return (
    <ShopClient
      coupleId={couple.id}
      heartBalance={couple.heart_balance}
      justPaid={success === "1"}
    />
  );
}
