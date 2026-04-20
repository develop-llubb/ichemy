"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { createHeartOrder } from "@/app/payment/actions";
import {
  HEART_PACKAGES,
  HEART_PACKAGE_LIST,
  type HeartPackageKey,
} from "@/lib/heart-packages";
import { AppBar } from "@/components/app-bar";
import type { NavData } from "@/lib/nav-data";

interface ShopClientProps {
  coupleId: string;
  heartBalance: number;
  justPaid: boolean;
  from: string | null;
  navData: NavData;
}

export function ShopClient({
  coupleId,
  heartBalance,
  justPaid,
  from,
  navData,
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();
  const [selectedKey, setSelectedKey] = useState<HeartPackageKey | null>(null);

  const shopUrl = from ? `/shop?from=${encodeURIComponent(from)}` : "/shop";
  const backPath = from ?? "/home";

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (justPaid) {
      toast("하트 충전이 완료되었어요!");
      router.replace(shopUrl, { scroll: false });
    }
  }, [justPaid, router, shopUrl]);

  // 결제 실패/취소 시 toast 표시
  useEffect(() => {
    const code = searchParams.get("code");
    const message = searchParams.get("message");
    if (code) {
      const cancelCodes = [
        "PAY_PROCESS_CANCELED",
        "USER_CANCEL",
        "PAY_PROCESS_ABORTED",
      ];
      if (cancelCodes.includes(code)) {
        toast("결제가 취소되었습니다.");
      } else {
        toast(message || "결제에 실패했습니다.");
      }
      router.replace(shopUrl, { scroll: false });
    }
  }, [searchParams, router, shopUrl]);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const selected = selectedKey ? HEART_PACKAGES[selectedKey] : null;

  const handlePurchase = () => {
    if (!selectedKey || pending) return;
    startTransition(async () => {
      try {
        const order = await createHeartOrder(coupleId, selectedKey);
        const tossPayments = await loadTossPayments(
          process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!,
        );
        const payment = tossPayments.payment({ customerKey: coupleId });
        const fromQuery = from
          ? `?from=${encodeURIComponent(from)}`
          : "";
        await payment.requestPayment({
          method: "CARD",
          amount: { currency: "KRW", value: order.amount },
          orderId: order.order_id,
          orderName: `하트 ${order.hearts}개`,
          successUrl: `${window.location.origin}/payment/success${fromQuery}`,
          failUrl: `${window.location.origin}/shop${fromQuery}`,
        });
      } catch (e: unknown) {
        const error = e as { code?: string; message?: string };
        if (error.code === "USER_CANCEL") {
          toast("결제가 취소되었습니다.");
        } else {
          toast(error.message || "결제 중 오류가 발생했습니다.");
        }
      }
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <AppBar
        variant="page"
        title="하트 상점"
        onBack={() => router.push(backPath)}
        {...navData}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Balance */}
        <div
          className="relative mt-7 flex flex-col items-center overflow-hidden rounded-[24px] p-[28px_20px_26px] text-white"
          style={{
            background: `
              radial-gradient(ellipse at top right, rgba(255,255,255,0.28), transparent 55%),
              radial-gradient(ellipse at bottom left, rgba(120,44,52,0.35), transparent 60%),
              linear-gradient(145deg, #E89585 0%, #D4735C 42%, #A84A3E 100%)
            `,
            boxShadow:
              "0 14px 36px rgba(168,74,62,0.32), 0 2px 8px rgba(168,74,62,0.18), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.08)",
            ...ease(0),
          }}
        >
          {/* 장식 — 빛나는 구 */}
          <div
            className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,220,200,0.45), transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,170,140,0.25), transparent 70%)",
            }}
          />
          {/* 상단 글로스 */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-20"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.14), transparent)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[11px] font-medium tracking-[0.18em] text-white/85 uppercase">
              Hearts
            </span>
            <span className="mt-0.5 text-[11px] text-white/75">보유 하트</span>

            <div className="relative mt-2.5 flex items-baseline gap-2">
              <span
                className="text-[28px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                aria-hidden
              >
                ♥️
              </span>
              <span
                className="text-[40px] font-extrabold leading-none tracking-[-0.02em]"
                style={{
                  textShadow:
                    "0 2px 10px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                {heartBalance}
              </span>
              <span className="text-[13px] font-semibold text-white/90">
                개
              </span>
            </div>

            <div className="mt-3.5 h-px w-16 bg-white/25" />

            <p className="mt-3 text-center text-[11px] leading-[1.6] text-white/85">
              하트 1개로 육아 케어 리포트 1건을 받을 수 있어요
            </p>
          </div>
        </div>

        {/* Packages */}
        <div className="mt-6 text-sm font-semibold text-foreground" style={ease(0.08)}>
          하트 충전하기
        </div>

        <div className="mt-3 flex flex-col gap-2.5">
          {HEART_PACKAGE_LIST.map((pkg, i) => {
            const isRecommended = pkg.key === "hearts_3";
            const isSelected = selectedKey === pkg.key;
            return (
              <button
                key={pkg.key}
                disabled={pending}
                onClick={() => setSelectedKey(pkg.key)}
                className="flex w-full items-center gap-4 rounded-2xl border-2 p-[18px_20px] text-left transition-all duration-150 disabled:opacity-60"
                style={{
                  borderColor: isSelected ? "#D4735C" : "#ECE8E3",
                  background: isSelected
                    ? "linear-gradient(160deg, #FFF6F2, #FFF0EB)"
                    : "#fff",
                  boxShadow: isSelected
                    ? "0 4px 16px rgba(212,115,92,0.15)"
                    : "0 2px 8px rgba(0,0,0,0.03)",
                  ...ease(0.12 + i * 0.05),
                }}
              >
                <div
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)" }}
                >
                  <span>♥️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-foreground">
                      하트 {pkg.hearts}개
                    </span>
                    {pkg.discountPercent > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        {pkg.discountPercent}% 할인
                      </span>
                    )}
                    {isRecommended && (
                      <span className="rounded-full bg-[#FFE8D6] px-2 py-0.5 text-[10px] font-bold text-primary">
                        추천
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-[15px] font-extrabold text-primary">
                      {pkg.price.toLocaleString()}원
                    </span>
                    {pkg.discountPercent > 0 && (
                      <span className="text-[11px] text-[#9A918A]">
                        (개당 {pkg.perHeart.toLocaleString()}원)
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all"
                  style={{
                    borderColor: isSelected ? "#D4735C" : "#D4CFC8",
                    background: isSelected ? "#D4735C" : "transparent",
                  }}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <div
          className="mt-6 rounded-[14px] bg-[#F8F6F3] p-[14px_18px]"
          style={ease(0.28)}
        >
          <div className="mb-2 text-[12px] font-semibold text-[#6B6360]">
            안내사항
          </div>
          <ul className="space-y-1.5 text-[11px] leading-[1.6] text-[#6B6360]">
            <li>• 구매한 하트는 배우자와 함께 사용할 수 있어요.</li>
            <li>• 하트는 유효기간 없이 사용할 수 있어요.</li>
            <li>• 하트 1개로 육아 케어 리포트 1건이 생성돼요.</li>
            <li>
              • 환불 요청은 고객센터(010-3082-3241 · yskim@llubb.com)로
              문의해주세요.
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="sticky bottom-0 border-t border-black/[0.03] bg-background/95 px-5 py-4 backdrop-blur-sm"
        style={ease(0.34)}
      >
        <button
          disabled={!selected || pending}
          onClick={handlePurchase}
          className="flex h-[54px] w-full items-center justify-center rounded-2xl border-none text-base font-bold text-white transition-all duration-200"
          style={{
            background: selected
              ? "linear-gradient(135deg, #D4735C, #C0614A)"
              : "#D4CFC8",
            boxShadow: selected
              ? "0 4px 16px rgba(212,115,92,0.25)"
              : "none",
            cursor: selected ? "pointer" : "not-allowed",
          }}
        >
          {pending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : selected ? (
            `${selected.price.toLocaleString()}원 결제하기`
          ) : (
            "하트 패키지를 선택해주세요"
          )}
        </button>
      </div>
    </div>
  );
}
