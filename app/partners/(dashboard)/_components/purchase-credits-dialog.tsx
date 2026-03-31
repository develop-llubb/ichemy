"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { createPartnerOrder } from "../credits/actions";

const CREDIT_PRICE = 3900;
const PACKAGES = [
  { credits: 5, price: 5 * CREDIT_PRICE, label: "5건" },
  { credits: 10, price: 10 * CREDIT_PRICE, label: "10건" },
  { credits: 30, price: 30 * CREDIT_PRICE * 0.9, label: "30건 (10% 할인)" },
  { credits: 50, price: 50 * CREDIT_PRICE * 0.85, label: "50건 (15% 할인)" },
];

export function PurchaseCreditsDialog({ partnerId }: { partnerId: string }) {
  const [selected, setSelected] = useState(0);
  const [pending, startTransition] = useTransition();

  const handlePurchase = () => {
    const pkg = PACKAGES[selected];
    startTransition(async () => {
      try {
        const order = await createPartnerOrder(pkg.credits, pkg.price);
        const tossPayments = await loadTossPayments(
          process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!,
        );
        const payment = tossPayments.payment({ customerKey: partnerId });
        await payment.requestPayment({
          method: "CARD",
          amount: { currency: "KRW", value: order.amount },
          orderId: order.order_id,
          orderName: `파트너 크레딧 ${pkg.credits}건`,
          successUrl: `${window.location.origin}/partners/credits/success`,
          failUrl: `${window.location.origin}/partners/credits/fail`,
        });
      } catch (e: unknown) {
        const error = e as { code?: string; message?: string };
        if (error.code === "USER_CANCEL") {
          toast("결제가 취소되었습니다.");
          return;
        }
        toast(error.message || "결제 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(Number(e.target.value))}
        className="rounded-md border px-3 py-2 text-sm"
      >
        {PACKAGES.map((pkg, i) => (
          <option key={i} value={i}>
            {pkg.label} — ₩{pkg.price.toLocaleString()}
          </option>
        ))}
      </select>
      <Button onClick={handlePurchase} disabled={pending}>
        {pending ? "처리중..." : "구매하기"}
      </Button>
    </div>
  );
}
