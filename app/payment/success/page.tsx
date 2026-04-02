import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requestReport } from "@/app/(protected)/report/actions";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}) {
  const { paymentKey, orderId, amount } = await searchParams;

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

  if (order.status === "paid") {
    // 이미 결제 완료된 주문 → 리포트 페이지로
    const result = await requestReport(order.couple_id, order.report_type, order.child_id ?? undefined);
    if ("reportId" in result) {
      redirect(`/report/${result.reportId}/criterion`);
    }
    redirect("/home");
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

  // 3. 결제 성공 → 주문 상태 업데이트
  await db
    .update(befeOrders)
    .set({ status: "paid", payment_key: paymentKey })
    .where(eq(befeOrders.id, order.id));

  // 4. 리포트 생성
  const result = await requestReport(order.couple_id, order.report_type, order.child_id ?? undefined);
  if ("reportId" in result) {
    redirect(`/report/${result.reportId}/criterion`);
  }

  redirect("/home");
}
