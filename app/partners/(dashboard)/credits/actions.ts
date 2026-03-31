"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befePartners, befePartnerOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

export async function createPartnerOrder(
  creditAmount: number,
  amount: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const [partner] = await db
    .select({ id: befePartners.id })
    .from(befePartners)
    .where(eq(befePartners.user_id, user.id))
    .limit(1);

  if (!partner) {
    redirect("/partners/register");
  }

  const orderId = `partner_order_${nanoid()}`;

  const [order] = await db
    .insert(befePartnerOrders)
    .values({
      partner_id: partner.id,
      order_id: orderId,
      credit_amount: creditAmount,
      amount,
      status: "pending",
    })
    .returning({
      id: befePartnerOrders.id,
      order_id: befePartnerOrders.order_id,
      amount: befePartnerOrders.amount,
    });

  return order;
}
