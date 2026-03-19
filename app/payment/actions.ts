"use server";

import { db } from "@/db";
import { befeOrders } from "@/db/schema";
import { nanoid } from "nanoid";

export async function createOrder(coupleId: string, hasChildren: boolean) {
  const orderId = `order_${nanoid()}`;
  const amount = 3900;

  const [order] = await db
    .insert(befeOrders)
    .values({
      couple_id: coupleId,
      order_id: orderId,
      amount,
      has_children: hasChildren,
      status: "pending",
    })
    .returning({ id: befeOrders.id, order_id: befeOrders.order_id, amount: befeOrders.amount });

  return order;
}
