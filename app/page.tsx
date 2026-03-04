import Image from "next/image";
import Link from "next/link";

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
          className="animate-fade-up mt-14 flex items-center gap-2"
          style={{ animationDelay: "0ms" }}
        >
          <Image
            src="/befe-logo.png"
            alt="BeFe"
            width={56}
            height={24}
            priority
            className="h-5 w-auto mb-1"
          />
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="#B8A898"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-[family-name:var(--font-mogra)] text-[14px] text-accent mt-0.5">
            Chemistry
          </span>
        </div>

        {/* Brand name */}
        <h1
          className="animate-scale-reveal mt-2 font-display text-[64px] leading-none tracking-wider text-primary"
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
            <span className="text-5xl leading-none">👶</span>
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
          className="animate-fade-up mt-11 text-center"
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
          <Link
            href="/login"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-[15px] font-semibold text-[#191919] shadow-[0_4px_16px_rgba(254,229,0,0.25)] transition-transform active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 0.6C4.029 0.6 0 3.713 0 7.55C0 9.947 1.558 12.055 3.931 13.335L2.933 16.803C2.845 17.108 3.199 17.35 3.465 17.169L7.565 14.455C8.036 14.49 8.515 14.5 9 14.5C13.971 14.5 18 11.387 18 7.55C18 3.713 13.971 0.6 9 0.6Z"
                fill="#191919"
              />
            </svg>
            카카오로 시작하기
          </Link>

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

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-black/[0.03] bg-black/[0.02] px-6 pt-4 pb-5">
        <div className="space-y-0 text-[11px] leading-[1.7] text-muted-light">
          <p>주식회사 럽(LLUBB Co., Ltd.) | 대표: 김유승</p>
          <p>사업자등록번호: 880-87-03398</p>
          <p>경기도 용인시 기흥구 덕영대로 2077번길 8, 103동 1201호</p>
          <p>Tel: 031-8007-1222</p>
          <p className="mt-1.5 text-[10px] opacity-60">
            Copyright © LLUBB Co., Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
