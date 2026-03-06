"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestPersonalityReport } from "../actions";

interface PersonalityIntroClientProps {
  nickname: string;
  role: "mom" | "dad";
  profileId: string;
}

const FEATURES = [
  {
    icon: "\uD83C\uDF08",
    title: "Big5 성격 기반 육아 특성",
    desc: "5가지 성격 요인이 육아에서 어떻게 나타나는지 분석해요",
  },
  {
    icon: "\uD83E\uDEC6",
    title: "애착 유형 양육 패턴",
    desc: "나의 애착 유형이 아이와의 관계에 미치는 영향을 알려드려요",
  },
  {
    icon: "\uD83D\uDCAC",
    title: "정서적 유연성 분석",
    desc: "유머 활용력과 갈등 대처력을 2축으로 분석해요",
  },
  {
    icon: "\u2728",
    title: "맞춤 육아 강점 & 조언",
    desc: "나만의 육아 강점 3가지와 성장 포인트를 제안해요",
  },
];

export function PersonalityIntroClient({
  nickname,
  role,
  profileId,
}: PersonalityIntroClientProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [requesting, startRequesting] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(18px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
          <button
            onClick={() => router.back()}
            className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3A3A3A"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 5 9 12 15 19" />
            </svg>
          </button>
          <span className="text-center text-[15px] font-semibold text-foreground">
            나의 육아 성향 리포트
          </span>
          <div />
        </div>

        {/* Content */}
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
                background: "linear-gradient(145deg, #F3EFF9, #EDE8F5)",
                boxShadow: "0 8px 24px rgba(139,114,190,0.1)",
                animation: ready ? "float 3s ease-in-out infinite" : "none",
              }}
            >
              🧩
            </div>
          </div>

          {/* Heading */}
          <h1
            className="mt-6 text-center text-[22px] font-extrabold leading-[1.4] tracking-[-0.8px] text-foreground"
            style={ease(0.1)}
          >
            {nickname}{role === "dad" ? " 아빠" : " 엄마"}의
            <br />
            육아 성향을 분석해 드릴게요
          </h1>
          <p
            className="mt-2 text-center text-[13px] leading-[1.7] text-muted"
            style={ease(0.15)}
          >
            검사 결과를 바탕으로 AI가
            <br />
            나만의 맞춤 육아 성향 리포트를 생성해요.
          </p>

          {/* Feature cards */}
          <div className="mt-7 flex flex-col gap-2.5" style={ease(0.2)}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 rounded-[16px] border border-black/[0.03] bg-white p-[16px_18px]"
                style={ease(0.22 + i * 0.04)}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{
                    background: "linear-gradient(145deg, #F3EFF9, #EDE8F5)",
                  }}
                >
                  {f.icon}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="text-[14px] font-semibold text-foreground">
                    {f.title}
                  </div>
                  <div className="mt-0.5 text-xs leading-[1.5] text-muted">
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Free badge */}
          <div
            className="mt-7 mb-6 w-full rounded-[18px] p-[18px_20px]"
            style={{
              background: "linear-gradient(160deg, #F3EFF9, #EDE8F5)",
              border: "1.5px solid rgba(139,114,190,0.15)",
              ...ease(0.42),
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B72BE] text-lg font-bold text-white">
                0
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#8B72BE]">
                  무료로 생성할 수 있어요
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  결제 없이 바로 리포트를 받아보세요
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="sticky bottom-0 border-t border-black/[0.03] bg-background/95 px-5 py-4 backdrop-blur-sm"
          style={ease(0.45)}
        >
          <button
            disabled={requesting}
            onClick={() => {
              startRequesting(async () => {
                const result = await requestPersonalityReport(profileId);
                if ("error" in result) {
                  toast(result.error);
                  return;
                }
                router.replace(`/report/me`);
              });
            }}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl border-none text-base font-bold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #8B72BE, #7462A8)",
              boxShadow: "0 4px 16px rgba(139,114,190,0.25)",
              cursor: "pointer",
            }}
          >
            {requesting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "리포트 생성하기"
            )}
          </button>
          <p className="mt-2.5 text-center text-[11px] text-[#B8A898]">
            AI가 검사 결과를 분석하여 맞춤 리포트를 생성합니다
          </p>
        </div>
      </div>
    </>
  );
}
