import { db } from "@/db";
import { befeCoupons, befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CouponClient } from "./coupon-client";
import { KakaoLoginButton } from "@/components/kakao-login-button";
import { CollabLogo } from "@/components/collab-logo";
import { CouponTicket } from "@/components/coupon-ticket";

export default async function CouponPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // 쿠폰 유효성 확인
  const [coupon] = await db
    .select({
      id: befeCoupons.id,
      event_name: befeCoupons.event_name,
      expires_at: befeCoupons.expires_at,
      max_uses: befeCoupons.max_uses,
      current_uses: befeCoupons.current_uses,
      used_by: befeCoupons.used_by,
    })
    .from(befeCoupons)
    .where(eq(befeCoupons.code, code))
    .limit(1);

  if (!coupon) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">😢</div>
          <h1 className="mt-5 text-xl font-bold text-foreground">
            유효하지 않은 쿠폰이에요
          </h1>
          <p className="mt-2 text-sm text-muted">
            쿠폰 코드를 다시 확인해주세요.
          </p>
        </main>
      </div>
    );
  }

  const expired = coupon.expires_at
    ? new Date(coupon.expires_at) < new Date()
    : false;
  const exhausted =
    coupon.max_uses !== null ? coupon.current_uses >= coupon.max_uses : false;

  if (expired || exhausted) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">⏰</div>
          <h1 className="mt-5 text-xl font-bold text-foreground">
            {expired ? "만료된 쿠폰이에요" : "쿠폰 사용 한도를 초과했어요"}
          </h1>
          <p className="mt-2 text-sm text-muted">다른 쿠폰을 이용해주세요.</p>
        </main>
      </div>
    );
  }

  // 로그인 확인
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <CollabLogo />

          <span className="mt-2 font-display text-5xl tracking-wider text-primary">
            아이케미
          </span>

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
            <KakaoLoginButton />
          </div>
        </main>
      </div>
    );
  }

  // 프로필 확인
  const [profile] = await db
    .select({ id: befeProfiles.id, coupon_id: befeProfiles.coupon_id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    redirect("/profile/create");
  }

  // 이미 쿠폰을 받은 경우 (프로필에 쿠폰이 연결되었거나, 이 쿠폰의 used_by에 포함)
  if (profile.coupon_id || coupon.used_by?.includes(user.id)) {
    return <CouponClient couponCode={code} eventName={coupon.event_name} alreadyRedeemed />;
  }

  return <CouponClient couponCode={code} eventName={coupon.event_name} />;
}
