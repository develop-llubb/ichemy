"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { redeemCoupon } from "./action";
import { toast } from "sonner";
import { CollabLogo } from "@/components/collab-logo";
import { CouponTicket } from "@/components/coupon-ticket";

export function CouponClient({
  couponCode,
  eventName,
}: {
  couponCode: string;
  eventName: string;
}) {
  const [pending, startTransition] = useTransition();

  const handleRedeem = () => {
    startTransition(async () => {
      const result = await redeemCoupon(couponCode);
      if (result?.error) {
        toast(result.error);
      }
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <CollabLogo />

        <Link href="/home" className="mt-2">
          <span className="font-display text-5xl tracking-wider text-primary">
            아이케미
          </span>
        </Link>

        {/* <h1 className="mt-6 font-display text-3xl text-primary">무료 쿠폰</h1> */}

        <p className="mt-8 text-sm leading-relaxed text-muted">
          쿠폰을 받고 육아 케어 리포트를 무료로 확인해보세요!
        </p>

        <div className="mt-8 w-full">
          <CouponTicket
            title="BeFe 베이비페어 무료 쿠폰"
            description="육아 케어 리포트 무료 이용권"
          />
        </div>

        <div className="mt-8 w-full max-w-[320px]">
          <button
            onClick={handleRedeem}
            disabled={pending}
            className="h-[52px] w-full rounded-2xl bg-primary text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(212,115,92,0.25)] transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? (
              <Loader2 size={20} className="mx-auto animate-spin" />
            ) : (
              "쿠폰 받기"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
