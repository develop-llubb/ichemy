import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  befePartnerOrders,
  befePartners,
  befePartnerCreditTransactions,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;

export default async function PartnerCreditSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}) {
  const { paymentKey, orderId, amount } = await searchParams;

  if (!paymentKey || !orderId || !amount) {
    redirect(
      "/partners/credits/fail?code=INVALID_PARAMS&message=결제 정보가 올바르지 않습니다.",
    );
  }

  const [order] = await db
    .select()
    .from(befePartnerOrders)
    .where(eq(befePartnerOrders.order_id, orderId))
    .limit(1);

  if (!order) {
    redirect(
      "/partners/credits/fail?code=ORDER_NOT_FOUND&message=주문 정보를 찾을 수 없습니다.",
    );
  }

  if (order.amount !== Number(amount)) {
    redirect(
      "/partners/credits/fail?code=AMOUNT_MISMATCH&message=결제 금액이 일치하지 않습니다.",
    );
  }

  if (order.status === "paid") {
    redirect("/partners/credits");
  }

  // TossPayments confirm
  const encryptedSecretKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString(
    "base64",
  );

  const confirmResponse = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    },
  );

  if (!confirmResponse.ok) {
    const errorData = await confirmResponse.json();
    await db
      .update(befePartnerOrders)
      .set({ status: "failed" })
      .where(eq(befePartnerOrders.id, order.id));
    redirect(
      `/partners/credits/fail?code=${errorData.code}&message=${encodeURIComponent(errorData.message)}`,
    );
  }

  // Update order status
  await db
    .update(befePartnerOrders)
    .set({ status: "paid", payment_key: paymentKey })
    .where(eq(befePartnerOrders.id, order.id));

  // Add credits
  const [updated] = await db
    .update(befePartners)
    .set({
      credit_balance: sql`${befePartners.credit_balance} + ${order.credit_amount}`,
      updated_at: new Date().toISOString(),
    })
    .where(eq(befePartners.id, order.partner_id))
    .returning({ credit_balance: befePartners.credit_balance });

  // Record transaction
  await db.insert(befePartnerCreditTransactions).values({
    partner_id: order.partner_id,
    type: "purchase",
    amount: order.credit_amount,
    balance_after: updated.credit_balance,
    description: `${order.credit_amount}건 구매`,
  });

  redirect("/partners/credits");
}
