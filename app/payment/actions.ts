"use server";

import { db } from "@/db";
import { befeOrders } from "@/db/schema";
import { nanoid } from "nanoid";
import type { ReportType } from "@/lib/care-report";

export async function createOrder(coupleId: string, reportType: ReportType, childId?: string) {
  const orderId = `order_${nanoid()}`;
  const amount = 19000;

  const [order] = await db
    .insert(befeOrders)
    .values({
      couple_id: coupleId,
      order_id: orderId,
      amount,
      report_type: reportType,
      child_id: childId ?? null,
      status: "pending",
    })
    .returning({ id: befeOrders.id, order_id: befeOrders.order_id, amount: befeOrders.amount });

  return order;
}
