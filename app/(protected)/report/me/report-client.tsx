"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ParentingProfileReport, ParentingTrait } from "@/lib/parenting-profile-report";
import { handleDownloadPersonalityPdf } from "@/lib/personality-report-pdf";
import { requestPersonalityReport, retryPersonalityReport } from "./actions";

interface ReportClientProps {
  profileId: string;
  reportId: string | null;
  status: "generating" | "completed" | "failed" | null;
  content: ParentingProfileReport | null;
}

// ── Trait colors ──

const TRAIT_COLORS: Record<string, { color: string; bg: string }> = {
  "개방성": { color: "#C49A30", bg: "#FFF8E8" },
  "성실성": { color: "#7BA872", bg: "#F0F7F0" },
  "외향성": { color: "#D4735C", bg: "#FFF0EB" },
  "우호성": { color: "#5B9BD5", bg: "#EEF4FB" },
  "신경성": { color: "#8B72BE", bg: "#F3EFF9" },
};

function getTraitColor(source: string) {
  return TRAIT_COLORS[source] ?? { color: "#6B6360", bg: "#F8F6F3" };
}

// ── LevelDots ──

function LevelDots({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full"
          style={{ background: i < level ? color : "#ECE8E3" }}
        />
      ))}
    </div>
  );
}

// ── Theory box ──

function TheoryBox({ theory }: { theory: { title: string; author: string; description: string } }) {
  return (
    <div
      className="mt-3 rounded-2xl p-[14px_16px]"
      style={{ background: "#F8F6F3", borderLeft: "3px solid #B8A898" }}
    >
      <div className="mb-0.5 text-[11px] font-bold text-[#9A918A]">{theory.title}</div>
      <div className="mb-1.5 text-[10px] text-[#B8A898]">{theory.author}</div>
      <p className="text-[12px] leading-[1.75] text-[#6B6360]">{theory.description}</p>
    </div>
  );
}

// ── Trait card ──

function TraitCard({ trait, style }: { trait: ParentingTrait; style?: React.CSSProperties }) {
  const tc = getTraitColor(trait.source);
  return (
    <div className="mb-3 rounded-[18px] border border-black/[0.03] bg-white p-[18px]" style={style}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="rounded-lg px-2 py-0.5 text-[11px] font-bold"
            style={{ background: tc.bg, color: tc.color }}
          >
            {trait.source}
          </span>
          <span className="text-[14px] font-bold text-foreground">{trait.trait}</span>
        </div>
        <LevelDots level={trait.level} color={tc.color} />
      </div>
      <p className="text-[13px] leading-[1.85] text-[#555]">{trait.description}</p>
      <div
        className="mt-3 rounded-xl p-[12px_14px]"
        style={{ background: tc.bg }}
      >
        <div className="mb-1 text-[11px] font-semibold" style={{ color: tc.color }}>
          {trait.type === "strength" ? "강점이 빛나는 장면" : trait.type === "growth" ? "성장할 수 있는 장면" : "일상 속 장면"}
        </div>
        <p className="text-[12px] leading-[1.75] text-[#6B6360]">{trait.scene}</p>
      </div>
    </div>
  );
}

// ── Main ──

export function ReportClient({
  profileId,
  reportId: initialReportId,
  status: initialStatus,
  content: initialContent,
}: ReportClientProps) {
  const router = useRouter();
  const [reportId, setReportId] = useState(initialReportId);
  const [status, setStatus] = useState(initialStatus);
  const [content, setContent] = useState(initialContent);
  const [requesting, startRequesting] = useTransition();
  const [retrying, startRetry] = useTransition();
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  // Polling
  useEffect(() => {
    if (status !== "generating" || !reportId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/personality-report/${reportId}/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          if (data.status === "completed") {
            router.refresh();
          }
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [reportId, status, router]);

  useEffect(() => {
    if (status === "completed" && !content) {
      router.refresh();
    }
  }, [status, content, router]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.push("/home")}
          className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <span className="text-center text-[15px] font-semibold text-foreground">
          나의 육아 성향 리포트
        </span>
        <div />
      </div>

      {/* No report yet */}
      {!reportId && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div
            className="flex h-[100px] w-[100px] items-center justify-center rounded-full text-4xl"
            style={{
              background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
              boxShadow: "0 8px 24px rgba(212,115,92,0.08)",
              ...ease(0.1),
            }}
          >
            {"\uD83E\uDDE9"}
          </div>
          <h1 className="mt-8 text-[22px] font-extrabold leading-[1.4] tracking-[-0.8px] text-foreground" style={ease(0.2)}>
            나의 육아 성향을
            <br />
            분석해 드릴게요
          </h1>
          <p className="mt-3 text-[13px] leading-[1.7] text-muted" style={ease(0.3)}>
            검사 결과를 바탕으로 AI가
            <br />
            맞춤형 육아 성향 리포트를 생성해요.
          </p>
          <button
            disabled={requesting}
            onClick={() => {
              startRequesting(async () => {
                const result = await requestPersonalityReport(profileId);
                if ("error" in result) {
                  toast(result.error);
                  return;
                }
                setReportId(result.reportId);
                setStatus("generating");
              });
            }}
            className="mt-8 flex h-[54px] w-full max-w-[280px] items-center justify-center rounded-2xl border-none text-base font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #D4735C, #C0614A)",
              boxShadow: "0 4px 16px rgba(212,115,92,0.25)",
              cursor: "pointer",
              ...ease(0.4),
            }}
          >
            {requesting ? <Loader2 size={20} className="animate-spin" /> : "리포트 생성하기"}
          </button>
        </main>
      )}

      {/* Generating */}
      {status === "generating" && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div style={{ opacity: ready ? 1 : 0, transform: ready ? "scale(1)" : "scale(0.8)", transition: "all 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s" }}>
            <div
              className="mx-auto flex h-[100px] w-[100px] items-center justify-center rounded-full"
              style={{ background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)", boxShadow: "0 8px 24px rgba(212,115,92,0.08)" }}
            >
              <Loader2 size={40} className="animate-spin text-primary" style={{ animationDuration: "2s" }} />
            </div>
          </div>
          <h1 className="mt-8 text-[22px] font-extrabold leading-[1.4] tracking-[-0.8px] text-foreground" style={ease(0.2)}>
            리포트를 생성하고 있어요
          </h1>
          <p className="mt-3 text-[13px] leading-[1.7] text-muted" style={ease(0.3)}>
            AI가 검사 결과를 분석 중이에요.
            <br />
            보통 1~2분 정도 소요됩니다.
          </p>
          <div className="mt-8 flex items-center gap-2" style={ease(0.4)}>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.3s" }} />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.6s" }} />
          </div>
          <p className="mt-6 text-[11px] text-[#B8A898]" style={ease(0.5)}>
            페이지를 나가도 리포트는 계속 생성돼요
          </p>
        </main>
      )}

      {/* Failed */}
      {status === "failed" && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">{"\uD83D\uDE22"}</div>
          <h1 className="mt-5 text-xl font-bold text-foreground">리포트 생성에 실패했어요</h1>
          <p className="mt-2 text-sm text-muted">네트워크 문제일 수 있어요.</p>
          <button
            disabled={retrying}
            onClick={() => {
              if (!reportId) return;
              startRetry(async () => {
                const result = await retryPersonalityReport(reportId);
                if (result.error) {
                  toast(result.error);
                  return;
                }
                setStatus("generating");
              });
            }}
            className="mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl border-none px-8 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #D4735C, #C0614A)", cursor: "pointer" }}
          >
            {retrying ? <Loader2 size={18} className="animate-spin" /> : "다시 시도하기"}
          </button>
        </main>
      )}

      {/* Completed */}
      {status === "completed" && content && (
        <div className="px-4 pb-[60px]">
          {/* Hero card */}
          <div
            className="relative mb-5 mt-4 overflow-hidden rounded-3xl px-[22px] pt-8 pb-7 text-white"
            style={{ background: "linear-gradient(160deg, #3A3A3A, #2C2C2C)", ...ease(0) }}
          >
            <div className="pointer-events-none absolute -top-[30px] -right-[30px] h-[120px] w-[120px] rounded-full" style={{ background: "rgba(212,115,92,0.15)", filter: "blur(30px)" }} />
            <div className="relative z-[1]">
              <div className="mb-3 text-[10px] font-semibold tracking-[1.5px] opacity-50">
                MY PARENTING PROFILE
              </div>
              <div className="mb-1.5 text-2xl font-bold leading-[1.3]">
                {content.parenting_type.title}
              </div>
              <div className="text-xs leading-[1.6] opacity-60">
                {content.parenting_type.subtitle}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-5 rounded-[18px] border border-black/[0.03] bg-white p-[20px_18px]" style={ease(0.05)}>
            <div className="mb-2 text-sm font-bold text-foreground">종합 분석</div>
            <p className="text-[13px] leading-[1.85] text-[#555]">{content.summary.text}</p>
            <TheoryBox theory={content.summary.theory} />
          </div>

          {/* Parenting traits */}
          <div style={ease(0.1)}>
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF0EB] text-base">{"\uD83C\uDF08"}</div>
              <div>
                <div className="text-[15px] font-bold text-foreground">육아 성격 특성</div>
                <div className="text-[11px] text-[#B8A898]">Big5 기반 5가지 육아 특성</div>
              </div>
            </div>
            {content.parenting_traits.map((trait, i) => (
              <TraitCard key={i} trait={trait} style={ease(0.12 + i * 0.03)} />
            ))}
          </div>

          <div className="my-7 h-px bg-[#ECE8E3]" />

          {/* Attachment */}
          <div style={ease(0.25)}>
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F3EFF9] text-base">{"\uD83E\uDEC6"}</div>
              <div>
                <div className="text-[15px] font-bold text-foreground">애착 기반 양육 패턴</div>
                <div className="text-[11px] text-[#B8A898]">관계 속 나의 육아 방식</div>
              </div>
            </div>

            <div
              className="relative mb-3 overflow-hidden rounded-[18px] p-[22px_20px] text-white"
              style={{ background: "linear-gradient(160deg, #8B72BE, #7462A8)" }}
            >
              <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/[0.08]" />
              <div className="relative z-[1]">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold">
                    {content.attachment_parenting.type_text}
                  </span>
                  <div className="flex gap-[3px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i < content.attachment_parenting.intensity ? "#fff" : "rgba(255,255,255,0.25)" }} />
                    ))}
                  </div>
                </div>
                <div className="mb-2.5 text-xl font-extrabold tracking-[-0.5px]">
                  {content.attachment_parenting.title}
                </div>
                <p className="text-xs leading-[1.75] opacity-85">{content.attachment_parenting.description}</p>
              </div>
            </div>

            <div className="mb-2 rounded-[18px] border border-black/[0.03] bg-white p-[18px]">
              <div className="mb-1.5 text-[12px] font-bold text-[#7BA872]">강점</div>
              <p className="text-[13px] leading-[1.85] text-[#555]">{content.attachment_parenting.strength}</p>
            </div>
            <div className="mb-3 rounded-[18px] border border-black/[0.03] bg-white p-[18px]">
              <div className="mb-1.5 text-[12px] font-bold text-[#C49A30]">주의할 점</div>
              <p className="text-[13px] leading-[1.85] text-[#555]">{content.attachment_parenting.watchpoint}</p>
            </div>

            <TheoryBox theory={content.attachment_parenting.theory} />
          </div>

          <div className="my-7 h-px bg-[#ECE8E3]" />

          {/* Emotional flexibility */}
          <div style={ease(0.3)}>
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F0F7F0] text-base">{"\uD83D\uDCAC"}</div>
              <div>
                <div className="text-[15px] font-bold text-foreground">정서적 유연성</div>
                <div className="text-[11px] text-[#B8A898]">육아 대응력 분석</div>
              </div>
            </div>

            <div
              className="relative mb-3 overflow-hidden rounded-[18px] p-[22px_20px] text-white"
              style={{ background: "linear-gradient(160deg, #7BA872, #6A9562)" }}
            >
              <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/[0.08]" />
              <div className="relative z-[1]">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold">
                    Lv.{content.emotional_flexibility.level}
                  </span>
                  <span className="text-xs font-medium opacity-70">
                    상위 {(100 - content.emotional_flexibility.percentage).toFixed(1)}%
                  </span>
                </div>
                <div className="mb-2.5 text-xl font-extrabold tracking-[-0.5px]">
                  {content.emotional_flexibility.title}
                </div>
                <p className="text-xs leading-[1.75] opacity-85">{content.emotional_flexibility.description}</p>
              </div>
            </div>

            <div className="mb-2 rounded-[18px] border border-black/[0.03] bg-white p-[18px]">
              <div className="mb-1.5 text-[12px] font-bold text-[#D4735C]">유머 활용 능력</div>
              <p className="text-[13px] leading-[1.85] text-[#555]">{content.emotional_flexibility.humor_analysis}</p>
            </div>
            <div className="mb-3 rounded-[18px] border border-black/[0.03] bg-white p-[18px]">
              <div className="mb-1.5 text-[12px] font-bold text-[#5B9BD5]">갈등 대처 능력</div>
              <p className="text-[13px] leading-[1.85] text-[#555]">{content.emotional_flexibility.conflict_analysis}</p>
            </div>

            <TheoryBox theory={content.emotional_flexibility.theory} />
          </div>

          <div className="my-7 h-px bg-[#ECE8E3]" />

          {/* Highlights */}
          <div style={ease(0.35)}>
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF0EB] text-base">{"\u2728"}</div>
              <div>
                <div className="text-[15px] font-bold text-foreground">육아 강점 & 성장 포인트</div>
              </div>
            </div>

            {content.highlights.strengths.map((s, i) => (
              <div key={i} className="mb-2 rounded-[18px] border border-black/[0.03] bg-white p-[18px]">
                <div className="mb-1 text-[13px] font-bold text-primary">{s.title}</div>
                <p className="text-[13px] leading-[1.85] text-[#555]">{s.description}</p>
              </div>
            ))}

            <div className="mt-3 rounded-2xl p-[16px_18px]" style={{ background: "#FFF8E8", borderLeft: "3px solid #C49A30" }}>
              <div className="mb-1.5 text-xs font-bold text-[#C49A30]">성장 포인트</div>
              <div className="mb-1 text-[13px] font-semibold text-foreground">{content.highlights.growth_point.title}</div>
              <p className="text-[12px] leading-[1.8] text-[#6B6360]">{content.highlights.growth_point.description}</p>
            </div>
          </div>

          <div className="my-7 h-px bg-[#ECE8E3]" />

          {/* Tips */}
          <div style={ease(0.4)}>
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F0F7F0] text-base">{"\uD83D\uDCA1"}</div>
              <div>
                <div className="text-[15px] font-bold text-foreground">맞춤 조언</div>
              </div>
            </div>
            {content.tips.map((tip, i) => (
              <div key={i} className="mb-2 rounded-[18px] border border-black/[0.03] bg-white p-[18px]">
                <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </div>
                <p className="mt-2 text-[13px] leading-[1.85] text-[#555]">{tip}</p>
              </div>
            ))}
          </div>

          {/* Closing */}
          <div
            className="mt-8 rounded-[22px] border border-[rgba(212,115,92,0.1)] p-[28px_22px] text-center"
            style={{ background: "linear-gradient(160deg, #FFF8F0, #FFF0E6)", ...ease(0.45) }}
          >
            <p className="text-sm font-semibold leading-[1.7] text-foreground">
              {content.closing.text}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-2" style={ease(0.5)}>
            <button
              onClick={() => router.push("/home")}
              className="h-12 w-full cursor-pointer rounded-[14px] border-none text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #D4735C, #C0614A)",
                boxShadow: "0 4px 14px rgba(212,115,92,0.25)",
              }}
            >
              홈으로 돌아가기
            </button>
            <button
              disabled={downloading}
              onClick={async () => {
                if (!content) return;
                setDownloading(true);
                try {
                  await handleDownloadPersonalityPdf(content);
                } catch (e) {
                  console.error("PDF generation failed:", e);
                } finally {
                  setDownloading(false);
                }
              }}
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] border-[#ECE8E3] bg-transparent text-[13px] font-medium text-[#6B6360] disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 size={16} className="animate-spin text-[#6B6360]" />
              ) : (
                "PDF로 저장하기"
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-7 pb-3 text-center" style={ease(0.55)}>
            <p className="text-[10px] leading-[1.7] text-[#B8A898] opacity-60">
              심리학 이론 기반 · 비임상 참고 목적
              <br />
              BeFe × Chemistry 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
