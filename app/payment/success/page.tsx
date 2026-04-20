import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeOrders, befeCouples, befeHeartTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;

function sanitizeFrom(from?: string): string | null {
  if (!from) return null;
  if (!from.startsWith("/") || from.startsWith("//")) return null;
  return from;
}

function appendQuery(path: string, key: string, value: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${key}=${value}`;
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
    from?: string;
  }>;
}) {
  const { paymentKey, orderId, amount, from } = await searchParams;
  const safeFrom = sanitizeFrom(from);
  const successRedirect = safeFrom
    ? appendQuery(safeFrom, "hearts_charged", "1")
    : "/shop?success=1";

  if (!paymentKey || !orderId || !amount) {
    redirect("/payment/fail?code=INVALID_PARAMS&message=결제 정보가 올바르지 않습니다.");
  }

  // 1. 서버에 저장된 주문 조회 + 금액 검증
  const [order] = await db
    .select()
    .from(befeOrders)
    .where(eq(befeOrders.order_id, orderId))
    .limit(1);

  if (!order) {
    redirect("/payment/fail?code=ORDER_NOT_FOUND&message=주문 정보를 찾을 수 없습니다.");
  }

  if (order.amount !== Number(amount)) {
    redirect("/payment/fail?code=AMOUNT_MISMATCH&message=결제 금액이 일치하지 않습니다.");
  }

  if (!order.hearts_amount || !order.package_key) {
    redirect("/payment/fail?code=INVALID_ORDER&message=주문 정보가 올바르지 않습니다.");
  }

  // 이미 결제 완료 (중복 진입 방지)
  if (order.status === "paid") {
    redirect(successRedirect);
  }

  // 2. 토스 결제 승인 API 호출
  const encryptedSecretKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");

  const confirmResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
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
  });

  if (!confirmResponse.ok) {
    const errorData = await confirmResponse.json();
    await db
      .update(befeOrders)
      .set({ status: "failed" })
      .where(eq(befeOrders.id, order.id));
    redirect(
      `/payment/fail?code=${errorData.code}&message=${encodeURIComponent(errorData.message)}`,
    );
  }

  // 3. 하트 증액 + 주문 상태 업데이트 + 트랜잭션 기록 (트랜잭션)
  const hearts = order.hearts_amount;
  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(befeCouples)
      .set({
        heart_balance: sql`${befeCouples.heart_balance} + ${hearts}`,
        updated_at: new Date().toISOString(),
      })
      .where(eq(befeCouples.id, order.couple_id))
      .returning({ balance: befeCouples.heart_balance });

    await tx
      .update(befeOrders)
      .set({ status: "paid", payment_key: paymentKey })
      .where(eq(befeOrders.id, order.id));

    await tx.insert(befeHeartTransactions).values({
      couple_id: order.couple_id,
      type: "purchase",
      amount: hearts,
      balance_after: updated.balance,
      order_id: order.id,
    });
  });

  redirect(successRedirect);
}
