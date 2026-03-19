import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { KakaoLoginButton } from "@/components/kakao-login-button";

import { CollabLogo } from "@/components/collab-logo";
import { AuthErrorToast } from "./auth-error-toast";

const pills = [
  {
    label: "마음여유",
    code: "ESB",
    color: "#7BA872",
    bg: "#F0F7F0",
    x: 8,
    y: 0,
    delay: 0,
  },
  {
    label: "서로돕기",
    code: "CSP",
    color: "#D4735C",
    bg: "#FFF0EB",
    x: 210,
    y: 20,
    delay: 0.8,
  },
  {
    label: "규칙일관",
    code: "PCI",
    color: "#5B9BD5",
    bg: "#EEF4FB",
    x: 0,
    y: 120,
    delay: 1.6,
  },
  {
    label: "스트레스차단",
    code: "STB",
    color: "#8B72BE",
    bg: "#F3EFF9",
    x: 200,
    y: 150,
    delay: 2.4,
  },
];

const trustChips = [
  { icon: "🧠", text: "심리학 기반" },
  { icon: "📊", text: "4대 지표" },
  { icon: "📋", text: "맞춤 리포트" },
];

export default function LandingPage() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <Suspense>
        <AuthErrorToast />
      </Suspense>
      {/* Ambient orbs */}
      <div
        className="animate-orb-1 pointer-events-none absolute -top-[60px] -right-[80px] h-[280px] w-[280px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,216,190,0.5) 0%, rgba(255,232,214,0.2) 50%, transparent 70%)",
        }}
      />
      <div
        className="animate-orb-2 pointer-events-none absolute top-[280px] -left-[100px] h-[240px] w-[240px] rounded-full blur-[50px]"
        style={{
          background:
            "radial-gradient(circle, rgba(200,184,232,0.3) 0%, rgba(168,197,160,0.15) 50%, transparent 70%)",
        }}
      />
      <div
        className="animate-orb-1 pointer-events-none absolute -right-[40px] bottom-[120px] h-[200px] w-[200px] rounded-full blur-[35px]"
        style={{
          background:
            "radial-gradient(circle, rgba(168,200,232,0.25) 0%, transparent 60%)",
          animationDirection: "reverse",
        }}
      />

      {/* Main */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-6">
        {/* Collab label */}
        <div
          className="animate-fade-up mt-14"
          style={{ animationDelay: "0ms" }}
        >
          <CollabLogo />
        </div>

        {/* Brand name */}
        <h1
          className="animate-scale-reveal mt-2 font-display text-[46px] leading-none tracking-wider text-primary"
          style={{ animationDelay: "100ms" }}
        >
          아이케미
        </h1>
        <p
          className="animate-fade-up mt-1.5 text-[11px] font-normal uppercase tracking-[4px] text-accent"
          style={{ animationDelay: "200ms" }}
        >
          Parenting Chemistry
        </p>

        {/* Visual center piece */}
        <div
          className="animate-scale-reveal relative mt-10 w-full max-w-[320px]"
          style={{ animationDelay: "200ms" }}
        >
          {/* Central circle */}
          <div
            className="mx-auto flex h-[180px] w-[180px] flex-col items-center justify-center rounded-full"
            style={{
              background:
                "linear-gradient(145deg, #FFE8D6 0%, #FFF0E6 40%, #F8EDE4 100%)",
              border: "1px solid rgba(212,115,92,0.1)",
              boxShadow:
                "0 12px 40px rgba(212,115,92,0.1), inset 0 -4px 12px rgba(255,255,255,0.6)",
            }}
          >
            <Image src="/baby.png" alt="아기" width={64} height={64} className="h-16 w-16 object-contain" />
            <span className="mt-2 text-[11px] font-semibold tracking-wide text-primary">
              우리 부부 육아 점수
            </span>
            <span className="mt-0.5 text-[11px] text-accent">몇 점일까?</span>
          </div>

          {/* Floating pills */}
          {pills.map((pill, i) => (
            <div
              key={pill.code}
              className="animate-float-pill absolute flex items-center gap-1.5 rounded-xl border bg-white/85 px-3 py-[7px] shadow-sm backdrop-blur-sm"
              style={{
                left: pill.x,
                top: pill.y,
                borderColor: `${pill.color}22`,
                animationDelay: `${pill.delay}s`,
              }}
            >
              <div
                className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px] text-[8px] font-black"
                style={{ background: pill.bg, color: pill.color }}
              >
                {pill.code}
              </div>
              <span className="text-[11px] font-semibold text-foreground">
                {pill.label}
              </span>
            </div>
          ))}
        </div>

        {/* Hook text */}
        <div
          className="animate-fade-up mt-8 text-center"
          style={{ animationDelay: "400ms" }}
        >
          <p className="text-[13px] font-normal leading-relaxed tracking-tight text-muted-light">
            심리학 기반 3분 검사로
            <br />
            부부의 육아 강점과 위험 신호를 한눈에
          </p>
        </div>

        {/* Trust chips */}
        <div
          className="animate-fade-up mt-5 flex gap-2"
          style={{ animationDelay: "600ms" }}
        >
          {trustChips.map((chip) => (
            <div
              key={chip.text}
              className="flex items-center gap-1 rounded-full border border-border bg-white/60 px-2.5 py-1 text-[11px] font-medium text-muted"
            >
              <span className="text-xs">{chip.icon}</span>
              {chip.text}
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="min-h-10 flex-1" />

        {/* CTA */}
        <div
          className="animate-fade-up w-full pb-7"
          style={{ animationDelay: "500ms" }}
        >
          <KakaoLoginButton />

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-light">
            시작 시{" "}
            <Link href="/terms" className="underline">
              서비스 이용약관
            </Link>{" "}
            및{" "}
            <Link href="/privacy" className="underline">
              개인정보 처리방침
            </Link>
            에 동의하게 됩니다.
          </p>
        </div>
      </main>

    </div>
  );
}
