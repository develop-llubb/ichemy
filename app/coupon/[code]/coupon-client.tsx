"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { Loader2 } from "lucide-react";
import { redeemCoupon } from "./action";
import { toast } from "sonner";
import { CollabLogo } from "@/components/collab-logo";
import { CouponTicket } from "@/components/coupon-ticket";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";

export function CouponClient({
  couponCode,
  eventName,
  alreadyRedeemed = false,
}: {
  couponCode: string;
  eventName: string;
  alreadyRedeemed?: boolean;
}) {
  const router = useRouter();
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
      {/* 이미 받은 쿠폰 안내 Drawer */}
      <Drawer open={alreadyRedeemed} dismissible={false}>
        <DrawerContent className="mx-auto max-w-[430px] rounded-t-[20px] px-6 pb-8 pt-6">
          <DrawerTitle className="sr-only">쿠폰 안내</DrawerTitle>
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl">🎟️</div>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              이미 쿠폰을 받았어요
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              이 쿠폰은 이미 적용되었어요.
              <br />
              홈에서 육아 케어 리포트를 확인해보세요!
            </p>
            <button
              onClick={() => router.push("/home")}
              className="mt-6 flex h-[48px] w-full cursor-pointer items-center justify-center rounded-2xl border-none bg-primary text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(212,115,92,0.25)] transition-transform active:scale-[0.98]"
            >
              홈으로 가기
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <CollabLogo />

        <Link href="/home" className="mt-2">
          <span className="font-display text-5xl tracking-wider text-primary">
            아이케미
          </span>
        </Link>

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
