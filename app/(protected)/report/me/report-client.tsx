"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  BefeProfile,
  ReportBig5,
  ReportAAS,
  ReportFlexibility,
  DetailEvaluation,
} from "@/db/schema";

// ── Big5 trait config ──

const BIG5_TRAITS = [
  { key: "extraversion" as const, label: "외향성", color: "#D4735C", bg: "#FFF0EB" },
  { key: "agreeableness" as const, label: "우호성", color: "#5B9BD5", bg: "#EEF4FB" },
  { key: "conscientiousness" as const, label: "성실성", color: "#7BA872", bg: "#F0F7F0" },
  { key: "neuroticism" as const, label: "신경성", color: "#8B72BE", bg: "#F3EFF9" },
  { key: "openness" as const, label: "개방성", color: "#C49A30", bg: "#FFF8E8" },
] as const;

// ── LevelDots ──

function LevelDots({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full transition-colors duration-300"
          style={{ background: i < level ? color : "#ECE8E3" }}
        />
      ))}
    </div>
  );
}

// ── Expandable ──

function Expandable({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2 overflow-hidden rounded-2xl border border-black/[0.03] bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-[16px_18px] text-left"
      >
        <span className="text-sm font-semibold text-[#3A3A3A]">{title}</span>
        <span
          className="text-sm text-[#B8A898] transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        >
          ▾
        </span>
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-400 ease-in-out"
        style={{ maxHeight: open ? 2000 : 0 }}
      >
        <div className="px-[18px] pb-[18px]">{children}</div>
      </div>
    </div>
  );
}

// ── Main ──

export function ReportClient({
  profile,
  big5Report,
  aasReport,
  flexReport,
}: {
  profile: BefeProfile;
  big5Report: ReportBig5 | null;
  aasReport: ReportAAS | null;
  flexReport: ReportFlexibility | null;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setReady(true), 80);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  // Parse big5 detail_evaluations (stored as JSON string in text column)
  const big5Details: DetailEvaluation[] = big5Report
    ? (() => {
        try {
          return JSON.parse(big5Report.detail_evaluations);
        } catch {
          return [];
        }
      })()
    : [];

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3.5"
        style={{
          background: "rgba(254,252,249,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="cursor-pointer border-none bg-transparent pr-2 py-1 text-xl text-foreground"
        >
          ←
        </button>
        <span className="text-[15px] font-semibold text-foreground">
          나의 성향 리포트
        </span>
      </div>

      <div className="px-4 pb-[60px]">
        {/* ── Hero card ── */}
        <div
          className="relative mb-5 overflow-hidden rounded-3xl px-[22px] pt-8 pb-7 text-white"
          style={{
            background: "linear-gradient(160deg, #3A3A3A 0%, #2C2C2C 100%)",
            ...ease(0),
          }}
        >
          <div
            className="pointer-events-none absolute -top-[30px] -right-[30px] h-[120px] w-[120px] rounded-full"
            style={{
              background: "rgba(212,115,92,0.15)",
              filter: "blur(30px)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-5 -left-5 h-20 w-20 rounded-full"
            style={{
              background: "rgba(139,114,190,0.1)",
              filter: "blur(20px)",
            }}
          />
          <div className="relative z-[1]">
            <div className="mb-3 text-[10px] font-semibold tracking-[1.5px] opacity-50">
              MY PERSONALITY REPORT
            </div>
            <div className="mb-1.5 text-4xl font-bold leading-[1.2]">
              {big5Report?.title ?? "나의 성향"}
            </div>
            <div className="mb-5 text-xs opacity-50">
              #{big5Report?.sequence ?? ""}
            </div>

            {/* Three badge pills */}
            <div className="flex flex-wrap gap-1.5">
              {big5Report && (
                <span
                  className="rounded-full px-3 py-[5px] text-[11px] font-semibold"
                  style={{
                    background: "rgba(212,115,92,0.2)",
                    color: "#F4A08C",
                  }}
                >
                  🌈 {big5Report.title}
                </span>
              )}
              {aasReport && (
                <span
                  className="rounded-full px-3 py-[5px] text-[11px] font-semibold"
                  style={{
                    background: "rgba(139,114,190,0.2)",
                    color: "#C8B8E8",
                  }}
                >
                  🫶 {aasReport.title}
                </span>
              )}
              {flexReport && (
                <span
                  className="rounded-full px-3 py-[5px] text-[11px] font-semibold"
                  style={{
                    background: "rgba(123,168,114,0.2)",
                    color: "#A8C5A0",
                  }}
                >
                  💬 {flexReport.title}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ═══ SECTION 1: Big5 성격 유형 ═══ */}
        {big5Report && (
          <div style={ease(0.1)}>
            {/* Section header */}
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF0EB] text-base">
                🌈
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#3A3A3A]">
                  Big5 성격 유형
                </div>
                <div className="text-[11px] text-[#B8A898]">
                  5가지 성격 요인 분석
                </div>
              </div>
            </div>

            {/* Overall evaluation */}
            <div className="mb-2.5 rounded-[18px] border border-black/[0.03] bg-white p-[20px_18px]">
              <p className="text-[13px] leading-[1.85] text-[#555]">
                {big5Report.overall_evaluation}
              </p>
            </div>

            {/* 5 trait cards */}
            {big5Details.map((detail, i) => {
              const trait = BIG5_TRAITS[i];
              if (!trait) return null;
              const level = Math.round(profile[trait.key] ?? 3);
              return (
                <Expandable
                  key={i}
                  title={detail.title}
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <LevelDots level={level} color={trait.color} />
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: trait.color }}
                    >
                      {level}/5
                    </span>
                  </div>
                  <p className="text-[13px] leading-[1.85] text-[#555]">
                    {detail.content}
                  </p>
                </Expandable>
              );
            })}

            {/* Counseling */}
            <div
              className="mb-2.5 rounded-2xl p-[16px_18px]"
              style={{
                background: "#FFF8E8",
                borderLeft: "3px solid #C49A30",
              }}
            >
              <div className="mb-1.5 text-xs font-bold text-[#C49A30]">
                💡 성장 조언
              </div>
              <p className="text-xs leading-[1.8] text-[#6B6360]">
                {big5Report.counseling_text}
              </p>
            </div>
          </div>
        )}

        {/* Divider */}
        {big5Report && aasReport && (
          <div
            className="my-7 h-px bg-[#ECE8E3]"
            style={ease(0.2)}
          />
        )}

        {/* ═══ SECTION 2: 애착 성향 ═══ */}
        {aasReport && (
          <div style={ease(0.2)}>
            {/* Section header */}
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F3EFF9] text-base">
                🫶
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#3A3A3A]">
                  애착 성향
                </div>
                <div className="text-[11px] text-[#B8A898]">
                  관계 속 나의 패턴 분석
                </div>
              </div>
            </div>

            {/* Type card */}
            <div
              className="relative mb-2.5 overflow-hidden rounded-[18px] p-[22px_20px] text-white"
              style={{
                background: "linear-gradient(160deg, #8B72BE, #7462A8)",
              }}
            >
              <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/[0.08]" />
              <div className="relative z-[1]">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold">
                    {aasReport.type_text}
                  </span>
                  <div className="flex gap-[3px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background:
                            i < (profile.aas_intensity ?? 0)
                              ? "#fff"
                              : "rgba(255,255,255,0.25)",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-2.5 text-xl font-extrabold tracking-[-0.5px]">
                  {aasReport.title}
                </div>
                <p className="text-xs leading-[1.75] opacity-85">
                  {aasReport.overall_evaluation}
                </p>
              </div>
            </div>

            {/* Detail sections */}
            {aasReport.detail_evaluations.map((item, i) => (
              <Expandable key={i} title={item.title}>
                <p className="text-[13px] leading-[1.85] text-[#555]">
                  {item.content}
                </p>
              </Expandable>
            ))}

            {/* Counseling */}
            {aasReport.counseling_evaluations.map((item, i) => (
              <div
                key={i}
                className="mb-2 rounded-2xl p-[16px_18px]"
                style={{
                  background: "#F3EFF9",
                  borderLeft: "3px solid #8B72BE",
                }}
              >
                <div className="mb-1.5 text-xs font-bold text-[#8B72BE]">
                  💜 {item.title}
                </div>
                <p className="text-xs leading-[1.8] text-[#6B6360]">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        {aasReport && flexReport && (
          <div
            className="my-7 h-px bg-[#ECE8E3]"
            style={ease(0.3)}
          />
        )}

        {/* ═══ SECTION 3: 정서적 유연성 ═══ */}
        {flexReport && (
          <div style={ease(0.3)}>
            {/* Section header */}
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F0F7F0] text-base">
                💬
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#3A3A3A]">
                  정서적 유연성
                </div>
                <div className="text-[11px] text-[#B8A898]">
                  감정 조절 & 소통 능력
                </div>
              </div>
            </div>

            {/* Level card */}
            <div
              className="relative mb-2.5 overflow-hidden rounded-[18px] p-[22px_20px] text-white"
              style={{
                background: "linear-gradient(160deg, #7BA872, #6A9562)",
              }}
            >
              <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/[0.08]" />
              <div className="relative z-[1]">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold">
                    Lv.{profile.flexibility_level ?? 0}
                  </span>
                  <div className="flex gap-[3px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background:
                            i < (profile.flexibility_level ?? 0)
                              ? "#fff"
                              : "rgba(255,255,255,0.25)",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-2.5 text-xl font-extrabold tracking-[-0.5px]">
                  {flexReport.title}
                </div>
                <p className="text-xs leading-[1.75] opacity-85">
                  {flexReport.overall_evaluation}
                </p>
              </div>
            </div>

            {/* Detail */}
            <Expandable title="상세 분석" defaultOpen>
              <p className="text-[13px] leading-[1.85] text-[#555]">
                {flexReport.detail_evaluation}
              </p>
            </Expandable>

            {/* Counseling */}
            <div
              className="mb-2 rounded-2xl p-[16px_18px]"
              style={{
                background: "#F0F7F0",
                borderLeft: "3px solid #7BA872",
              }}
            >
              <div className="mb-1.5 text-xs font-bold text-[#7BA872]">
                🌿 성장 조언
              </div>
              <p className="text-xs leading-[1.8] text-[#6B6360]">
                {flexReport.counseling_text}
              </p>
            </div>
          </div>
        )}

        {/* ── Closing ── */}
        <div
          className="mt-8 rounded-[22px] border border-[rgba(212,115,92,0.1)] p-[28px_22px] text-center"
          style={{
            background: "linear-gradient(160deg, #FFF8F0, #FFF0E6)",
            ...ease(0.4),
          }}
        >
          <div className="mb-3 text-[32px]">✨</div>
          <p className="mb-1.5 text-sm font-semibold leading-[1.7] text-[#3A3A3A]">
            당신만의 색깔이 아름답습니다
          </p>
          <p className="text-xs leading-[1.7] text-[#9A918A]">
            이 리포트가 나를 더 깊이 이해하는
            <br />
            따뜻한 거울이 되길 바랍니다.
          </p>

          <div className="mt-[22px] flex flex-col gap-2">
            <button
              onClick={() => router.push("/home")}
              className="h-12 w-full cursor-pointer rounded-[14px] border-none text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #D4735C, #C0614A)",
                boxShadow: "0 4px 14px rgba(212,115,92,0.25)",
              }}
            >
              육아 케어 리포트 확인하기
            </button>
            <button
              onClick={() => window.print()}
              className="h-11 w-full cursor-pointer rounded-[14px] border-[1.5px] border-[#ECE8E3] bg-transparent text-[13px] font-medium text-[#6B6360]"
            >
              PDF로 저장하기
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-7 pb-3 text-center">
          <p className="text-[10px] leading-[1.7] text-[#B8A898] opacity-60">
            심리학 이론 기반 · 비임상 참고 목적
            <br />
            아이케미 × 베이비페어 2026
          </p>
        </div>
      </div>
    </div>
  );
}
