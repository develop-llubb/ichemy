"use server";

import { db } from "@/db";
import { befeOrders } from "@/db/schema";
import { nanoid } from "nanoid";
import {
  HEART_PACKAGES,
  type HeartPackageKey,
} from "@/lib/heart-packages";

export async function createHeartOrder(
  coupleId: string,
  packageKey: HeartPackageKey,
): Promise<{ id: string; order_id: string; amount: number; hearts: number }> {
  const pkg = HEART_PACKAGES[packageKey];
  const orderId = `order_${nanoid()}`;

  const [order] = await db
    .insert(befeOrders)
    .values({
      couple_id: coupleId,
      order_id: orderId,
      amount: pkg.price,
      package_key: packageKey,
      hearts_amount: pkg.hearts,
      status: "pending",
    })
    .returning({
      id: befeOrders.id,
      order_id: befeOrders.order_id,
      amount: befeOrders.amount,
    });

  return { ...order, hearts: pkg.hearts };
}
