"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { logout } from "@/lib/auth-actions";

const stats = [
  { value: "약 3분", label: "소요 시간", icon: "⏱" },
  { value: "55문항", label: "총 문항 수", icon: "✏️" },
  { value: "4개", label: "분석 지표", icon: "📊" },
];

const indicators = [
  {
    code: "ESB",
    name: "마음 여유 균형",
    desc: "부부가 서로의 지침을 얼마나 잘 알아차리는지",
    color: "#7BA872",
    bg: "#F0F7F0",
  },
  {
    code: "CSP",
    name: "서로 돕기 점수",
    desc: "성격 강점이 육아 팀워크로 이어지는 정도",
    color: "#D4735C",
    bg: "#FFF0EB",
  },
  {
    code: "PCI",
    name: "육아 규칙 일관성",
    desc: "부부 사이 육아 기준이 얼마나 일치하는지",
    color: "#5B9BD5",
    bg: "#EEF4FB",
  },
  {
    code: "STB",
    name: "스트레스 차단력",
    desc: "부모의 스트레스가 아이에게 전이되는 정도",
    color: "#8B72BE",
    bg: "#F3EFF9",
  },
];

const sampleBars = [
  { code: "ESB", score: 92, color: "#A8C5A0" },
  { code: "CSP", score: 88, color: "#F4C4A0" },
  { code: "PCI", score: 95, color: "#A8C8E8" },
  { code: "STB", score: 90, color: "#C8B8E8" },
];

const tips = [
  { icon: "💡", text: "정답은 없어요. 평소 느끼는 대로 솔직하게 답해주세요." },
  { icon: "⏸", text: "중간에 나가도 이어서 할 수 있어요." },
  {
    icon: "⚠️",
    text: "정확한 성향 분석을 위해 검사는 단 한 번만 가능해요. 신중하게 답해주세요.",
  },
  { icon: "💑", text: "배우자도 같은 검사를 완료해야 리포트가 생성돼요." },
  {
    icon: "🎪",
    text: "베이비페어 현장에서 QR을 통해 무료로 리포트를 받을 수 있어요.",
  },
];

export function TestIntroClient() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(14px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-12 items-center bg-background/80 px-4 backdrop-blur-sm">
        <button onClick={() => logout()} className="text-foreground">
          <ChevronLeft size={24} />
        </button>
      </header>

      {/* Scroll content */}
      <main className="flex-1 overflow-y-auto px-6">
        {/* Hero */}
        <div className="pt-5 text-center" style={ease(0)}>
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl"
            style={{
              background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
              boxShadow: "0 8px 24px rgba(212,115,92,0.1)",
            }}
          >
            📋
          </div>
          <h1 className="mt-4 font-display text-3xl text-primary">검사 안내</h1>
          <p className="mt-2 text-sm text-muted">
            간단한 안내를 읽고 편하게 시작하세요
          </p>
        </div>

        {/* Quick stats */}
        <div className="mt-7 flex gap-2" style={ease(0.08)}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-1 flex-col items-center rounded-xl border border-border bg-white px-2.5 py-4"
            >
              <span className="mb-1.5 text-xl">{s.icon}</span>
              <span className="text-base font-bold text-primary">
                {s.value}
              </span>
              <span className="mt-0.5 text-[11px] text-muted-light">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <section className="mt-8" style={ease(0.16)}>
          <h2 className="mb-3.5 text-base font-bold tracking-tight text-foreground">
            이런 걸 알 수 있어요
          </h2>
          <div className="flex flex-col gap-2">
            {indicators.map((ind) => (
              <div
                key={ind.code}
                className="flex items-center gap-3.5 rounded-xl border border-border bg-white px-4 py-3.5"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black"
                  style={{ background: ind.bg, color: ind.color }}
                >
                  {ind.code}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground">
                    {ind.name}
                  </div>
                  <div className="text-xs text-muted-light">{ind.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Report preview */}
        <section className="mt-8" style={ease(0.24)}>
          <h2 className="mb-3.5 text-base font-bold tracking-tight text-foreground">
            이런 리포트를 받게 돼요
          </h2>
          <div
            className="relative overflow-hidden rounded-[20px] px-5 py-6 text-white"
            style={{
              background: "linear-gradient(160deg, #D4735C, #C0614A)",
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-[30px] -right-[30px] h-[100px] w-[100px] rounded-full bg-white/[0.08]" />
            <div className="absolute -bottom-[20px] -left-[20px] h-[70px] w-[70px] rounded-full bg-white/[0.06]" />

            <div className="relative z-10">
              <div className="text-[10px] font-semibold uppercase tracking-[1.5px] opacity-60">
                SAMPLE REPORT
              </div>
              <div className="mt-2 text-[17px] font-extrabold tracking-tight">
                유아기 부부 육아 케어 리포트
              </div>

              {/* Bars */}
              <div className="mt-4 flex flex-col gap-2.5">
                {sampleBars.map((bar) => (
                  <div key={bar.code} className="flex items-center gap-2.5">
                    <span className="w-8 text-[11px] font-bold opacity-80">
                      {bar.code}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${bar.score}%`,
                          background: bar.color,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-[11px] font-semibold opacity-70">
                      A
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-white/[0.12] px-3.5 py-2.5 text-xs leading-relaxed opacity-85">
                &ldquo;두 분의 강점은 서로의 정서적 균형을 함께 지켜가는 힘과,
                성격 강점이 자연스럽게 팀워크로 연결되는 구조입니다…&rdquo;
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mt-8 mb-6" style={ease(0.32)}>
          <h2 className="mb-3.5 text-base font-bold tracking-tight text-foreground">
            검사 전 참고해주세요
          </h2>
          <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-white px-4 py-5">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-base">
                  {tip.icon}
                </span>
                <p className="text-[13px] leading-relaxed text-muted">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-4 pb-8" style={ease(0.4)}>
          <button
            onClick={() => router.push("/test")}
            className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          >
            검사 시작하기
          </button>
          <p className="mt-2.5 text-center text-[11px] text-muted-light">
            약 10분 소요 · 55문항 · 정답 없음
          </p>
        </div>
      </main>
    </div>
  );
}
