"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { JOURNEY_STEPS } from "@/lib/steps";
import { AppBar } from "@/components/app-bar";
import type { NavData } from "@/lib/nav-data";

interface WaitingClientProps {
  nickname: string;
  partnerNickname: string;
  partnerTestIndex: number;
  totalQuestions: number;
  navData: NavData;
}

export function WaitingClient({
  nickname,
  partnerNickname,
  partnerTestIndex,
  totalQuestions,
  navData,
}: WaitingClientProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(18px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const percent =
    totalQuestions > 0
      ? Math.round((partnerTestIndex / totalQuestions) * 100)
      : 0;

  const steps = JOURNEY_STEPS.map((step, i) =>
    i === 1
      ? { ...step, desc: `${partnerNickname}님이 검사를 진행 중이에요. (${partnerTestIndex}/${totalQuestions})` }
      : step,
  );
  const activeIdx = 1;

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,115,92,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(212,115,92,0); }
        }
      `}</style>

      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        {/* ── Header (sticky, chevron back) ── */}
        <AppBar variant="page" title="배우자 검사 현황" {...navData} />

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-5">
          {/* Illustration */}
          <div
            className="mt-8 flex justify-center"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "scale(1)" : "scale(0.85)",
              transition: "all 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s",
            }}
          >
            <div
              className="flex h-[110px] w-[110px] items-center justify-center rounded-full text-5xl"
              style={{
                background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
                boxShadow: "0 8px 24px rgba(212,115,92,0.08)",
                animation: ready ? "float 3s ease-in-out infinite" : "none",
              }}
            >
              ⏳
            </div>
          </div>

          {/* Heading */}
          <h1
            className="mt-6 text-center text-[22px] font-extrabold leading-[1.4] tracking-[-0.8px] text-foreground"
            style={ease(0.1)}
          >
            {partnerNickname}님이
            <br />
            검사 중이에요
          </h1>
          <p
            className="mt-2 text-center text-[13px] leading-[1.7] text-muted"
            style={ease(0.15)}
          >
            배우자의 검사가 완료되면
            <br />
            부부 육아 케어 리포트를 확인할 수 있어요.
          </p>

          {/* Progress card */}
          <div
            className="mt-7 w-full rounded-2xl border-[1.5px] border-[#ECE8E3] bg-white p-5"
            style={ease(0.2)}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                검사 진행도
              </span>
              <span className="text-sm font-bold text-primary">
                {percent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F0EDE9]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: "linear-gradient(90deg, #D4735C, #E8907A)",
                }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-xs text-muted">
                {partnerTestIndex === 0
                  ? "아직 검사를 시작하지 않았어요"
                  : "열심히 검사에 참여하고 있어요!"}
              </span>
              <span className="text-xs font-medium text-[#9A918A]">
                {partnerTestIndex}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Journey tracker */}
          <div
            className="mt-7 mb-5 w-full rounded-[20px] border border-black/[0.03] bg-white p-[22px_20px]"
            style={ease(0.3)}
          >
            <div className="mb-4 text-sm font-medium text-foreground">
              앞으로 이렇게 진행돼요
            </div>
            {steps.map((step, i) => {
              const isDone = i < activeIdx;
              const isActive = i === activeIdx;
              const isLast = i === steps.length - 1;
              return (
                <div key={i} className="flex gap-3.5">
                  {/* Left: dot + line */}
                  <div className="flex shrink-0 flex-col items-center">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300"
                      style={{
                        background: isDone
                          ? "linear-gradient(135deg, #D4735C, #C0614A)"
                          : isActive
                            ? "#fff"
                            : "#F0EDE9",
                        border: isActive
                          ? "2.5px solid #D4735C"
                          : isDone
                            ? "none"
                            : "2px solid #E8E2DC",
                        color: isDone
                          ? "#fff"
                          : isActive
                            ? "#D4735C"
                            : "#B8A898",
                        animation: isActive
                          ? "pulse 2s ease-in-out infinite"
                          : "none",
                      }}
                    >
                      {isDone ? "✓" : step.num}
                    </div>
                    {!isLast && (
                      <div
                        className="mt-1 w-[1.5px] flex-1 transition-colors duration-300"
                        style={{
                          minHeight: 20,
                          background: isDone ? "#D4735C" : "#ECE8E3",
                        }}
                      />
                    )}
                  </div>
                  {/* Right: content */}
                  <div
                    className="flex-1 pt-[3px]"
                    style={{ paddingBottom: isLast ? 0 : 20 }}
                  >
                    <div
                      className="text-sm leading-[1.5] transition-all duration-300"
                      style={{
                        fontWeight: isDone || isActive ? 600 : 400,
                        color: isDone
                          ? "#3A3A3A"
                          : isActive
                            ? "#D4735C"
                            : "#B8A898",
                      }}
                    >
                      {step.title}
                    </div>
                    {step.desc && (isActive || isDone) && (
                      <div className="mt-1 text-xs leading-[1.5] text-[#9A918A]">
                        {step.desc}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Baby fair promo */}
          <div
            className="relative mb-6 w-full overflow-hidden rounded-[18px] p-[22px_20px] text-white"
            style={{
              background: "linear-gradient(160deg, #D4735C, #C0614A)",
              ...ease(0.38),
            }}
          >
            <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/[0.08]" />
            <div className="pointer-events-none absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-white/[0.06]" />
            <div className="relative z-10">
              <div className="mb-3 inline-block rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-bold">
                🎪 베이비페어 특별 혜택
              </div>
              <div className="mb-2.5 text-base font-extrabold leading-[1.5] tracking-[-0.3px]">
                현장 QR 스캔하면
                <br />
                리포트 무료!
              </div>
              <p className="text-xs leading-[1.7] opacity-85">
                육아 케어 리포트는 유료 서비스이지만, 베이비페어 케미스트리
                부스에서 QR을 스캔하시면 무료로 확인하실 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
