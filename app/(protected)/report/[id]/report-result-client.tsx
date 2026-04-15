"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ChevronLeft, Loader2 } from "lucide-react";
import { retryReport } from "../actions";
import { submitReportReview } from "./actions";
import { handleDownloadPdf } from "@/lib/report-pdf";
import { toast } from "sonner";
import type {
  CareReport,
  Grade,
  ReportType,
  TheoryReference,
  IndicatorAnalysis,
} from "@/lib/care-report";

interface ReportResultClientProps {
  reportId: string;
  reportType: ReportType;
  childName: string | null;
  status: "generating" | "completed" | "failed";
  content: CareReport | null;
  profileId: string;
  hasReview: boolean;
}

// ── Grade config ──

const GRADE_CONFIG: Record<
  Grade,
  { emoji: string; color: string; bg: string; border: string }
> = {
  A: {
    emoji: "\u2728",
    color: "#D4735C",
    bg: "linear-gradient(160deg, #FFF6F2, #FFF0EB)",
    border: "#D4735C",
  },
  B: {
    emoji: "\uD83D\uDC4D",
    color: "#5B9BD5",
    bg: "linear-gradient(160deg, #F0F6FC, #EEF4FB)",
    border: "#5B9BD5",
  },
  C: {
    emoji: "\uD83C\uDF31",
    color: "#C49A30",
    bg: "linear-gradient(160deg, #FFFBF0, #FFF8E8)",
    border: "#C49A30",
  },
  D: {
    emoji: "\uD83D\uDCAA",
    color: "#8B72BE",
    bg: "linear-gradient(160deg, #F8F5FC, #F3EFF9)",
    border: "#8B72BE",
  },
};

const INDICATOR_META: Record<string, { emoji: string; gradient: string }> = {
  ESB: {
    emoji: "\uD83E\uDDE1",
    gradient: "linear-gradient(160deg, #D4735C, #C0614A)",
  },
  CSP: {
    emoji: "\uD83E\uDD1D",
    gradient: "linear-gradient(160deg, #5B9BD5, #4A8AC4)",
  },
  PCI: {
    emoji: "\uD83D\uDCCB",
    gradient: "linear-gradient(160deg, #7BA872, #6A9562)",
  },
  STB: {
    emoji: "\uD83D\uDEE1\uFE0F",
    gradient: "linear-gradient(160deg, #8B72BE, #7462A8)",
  },
};

// ── Theory box ──

function RoundStar({ color }: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.5c.4 0 .8.3 1 .7l2.3 4.7 5.2.8c.8.1 1.1 1.1.5 1.6l-3.8 3.7.9 5.1c.1.8-.7 1.4-1.4 1l-4.7-2.5-4.7 2.5c-.7.4-1.5-.2-1.4-1l.9-5.1L3 9.3c-.6-.5-.3-1.5.5-1.6l5.2-.8L11 2.2c.2-.4.6-.7 1-.7z" />
    </svg>
  );
}

function ReviewStars({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const handleClick = (starIdx: number, isRight: boolean) => {
    const v = starIdx + (isRight ? 1 : 0.5);
    onChange(value === v ? 0 : v);
  };

  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-foreground">{label}</p>
      <div className="flex gap-0">
        {[0, 1, 2, 3, 4].map((starIdx) => {
          const full = value >= starIdx + 1;
          const half = !full && value >= starIdx + 0.5;

          return (
            <div key={starIdx} className="relative h-10 w-10 cursor-pointer select-none">
              {/* 빈 별 */}
              <span className="absolute inset-0 flex items-center justify-center">
                <RoundStar color="#E8E2DC" />
              </span>
              {/* 채워진 별 */}
              {(full || half) && (
                <span
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  style={{ clipPath: full ? undefined : "inset(0 50% 0 0)" }}
                >
                  <RoundStar color="#D4735C" />
                </span>
              )}
              {/* 왼쪽 반 클릭 */}
              <span
                className="absolute inset-0 w-1/2"
                onClick={() => handleClick(starIdx, false)}
              />
              {/* 오른쪽 반 클릭 */}
              <span
                className="absolute right-0 top-0 h-full w-1/2"
                onClick={() => handleClick(starIdx, true)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TheoryBox({ theory }: { theory: TheoryReference }) {
  return (
    <div
      className="rounded-2xl p-[16px_18px]"
      style={{
        background: "linear-gradient(160deg, #F8F6F3, #F4F1ED)",
        borderLeft: "3px solid #B8A898",
      }}
    >
      <div className="mb-1 text-[11px] font-bold text-[#9A918A]">
        {theory.title}
      </div>
      <div className="mb-2 text-[10px] text-[#B8A898]">{theory.author}</div>
      <p className="text-[12px] leading-[1.75] text-[#6B6360]">
        {theory.description}
      </p>
    </div>
  );
}

// ── Indicator section ──

function IndicatorSection({
  indicator,
  style,
}: {
  indicator: IndicatorAnalysis;
  style?: React.CSSProperties;
}) {
  const grade = GRADE_CONFIG[indicator.grade];
  const meta = INDICATOR_META[indicator.code];

  return (
    <div className="mt-7" style={style}>
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-[20px] p-[22px_20px] text-white"
        style={{ background: meta.gradient }}
      >
        <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/[0.08]" />
        <div className="relative z-[1]">
          <div className="mb-1 text-[11px] font-medium opacity-70">
            {indicator.name_en}
          </div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="text-xl font-extrabold tracking-[-0.5px]">
              {indicator.name}
            </span>
            <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold">
              {indicator.grade}
            </span>
          </div>
          <div className="text-[12px] font-medium opacity-85">
            {indicator.grade_label}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-3 rounded-[18px] border border-black/[0.03] bg-white p-[20px_18px]">
        <div className="mb-2 text-[13px] font-bold text-foreground">
          이 지표는 무엇을 측정하나요?
        </div>
        <p className="text-[13px] leading-[1.85] text-[#555]">
          {indicator.description}
        </p>
      </div>

      {/* Description theory */}
      <div className="mt-2.5">
        <TheoryBox theory={indicator.description_theory} />
      </div>

      {/* Interpretation */}
      <div className="mt-3 rounded-[18px] border border-black/[0.03] bg-white p-[20px_18px]">
        <div className="mb-2 text-[13px] font-bold text-foreground">
          현재 점수 해석
        </div>
        <p className="text-[13px] leading-[1.85] text-[#555]">
          {indicator.interpretation}
        </p>
      </div>

      {/* Scenes */}
      <div className="mt-3 rounded-[18px] border border-black/[0.03] bg-white p-[20px_18px]">
        <div className="mb-3 text-[13px] font-bold text-foreground">
          육아에서 이렇게 나타나요
        </div>
        {indicator.scenes.map((scene, i) => (
          <div
            key={i}
            className="mb-3 last:mb-0 rounded-2xl p-[16px_16px]"
            style={{
              background: grade.bg,
              border: `1.5px solid ${grade.border}20`,
            }}
          >
            <div
              className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold"
              style={{ color: grade.color }}
            >
              <span>
                {scene.type === "strength" ? "\u2728" : "\uD83C\uDF31"}
              </span>
              <span>
                {scene.type === "strength"
                  ? "강점이 빛나는 장면"
                  : "성장이 필요한 장면"}
              </span>
            </div>
            <div className="mb-1.5 text-[13px] font-semibold text-foreground">
              {scene.title}
            </div>
            <p className="text-[12px] leading-[1.8] text-[#555]">
              {scene.content}
            </p>
          </div>
        ))}
      </div>

      {/* Scenes theory */}
      {indicator.scenes_theory && (
        <div className="mt-2.5">
          <TheoryBox theory={indicator.scenes_theory} />
        </div>
      )}

      {/* Tips */}
      <div className="mt-3 rounded-[18px] border border-black/[0.03] bg-white p-[20px_18px]">
        <div
          className="mb-3 text-[13px] font-bold"
          style={{ color: grade.color }}
        >
          맞춤 조언
        </div>
        {indicator.tips.map((tip, i) => (
          <div key={i} className="mb-3 flex gap-2 last:mb-0">
            <span
              className="mt-[2px] shrink-0 text-[12px] font-bold"
              style={{ color: grade.color }}
            >
              {"\u2714"}
            </span>
            <p className="text-[12px] leading-[1.8] text-[#555]">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──

export function ReportResultClient({
  reportId,
  reportType,
  childName,
  status: initialStatus,
  content: initialContent,
  profileId,
  hasReview: initialHasReview,
}: ReportResultClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [content, setContent] = useState(initialContent);
  const [retrying, startRetry] = useTransition();
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState(false);

  // Review state
  const [hasReview, setHasReview] = useState(initialHasReview);
  const [reviewR1, setReviewR1] = useState(0);
  const [reviewR2, setReviewR2] = useState(0);
  const [reviewR3, setReviewR3] = useState(0);
  const [reviewR4, setReviewR4] = useState("");
  const [submittingReview, startSubmittingReview] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(18px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  // Polling — 서버가 created_at 기준 5분 초과 시 failed 반환
  useEffect(() => {
    if (status !== "generating") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/report/${reportId}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "completed" && data.content) {
          setContent(data.content);
          setStatus("completed");
          clearInterval(interval);
        } else if (data.status === "failed") {
          setStatus("failed");
          clearInterval(interval);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reportId, status]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.push("/report/list")}
          className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <span className="text-center text-[15px] font-semibold text-foreground">
          {childName ? `${childName}의 육아 케어 리포트` : "예비 부모 육아 케어 리포트"}
        </span>
        <div />
      </div>

      {/* Generating */}
      {status === "generating" && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "scale(1)" : "scale(0.8)",
              transition: "all 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s",
            }}
          >
            <div
              className="mx-auto flex h-[100px] w-[100px] items-center justify-center rounded-full text-4xl"
              style={{
                background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
                boxShadow: "0 8px 24px rgba(212,115,92,0.08)",
                animation: ready ? "float 3s ease-in-out infinite" : "none",
              }}
            >
              <Loader2
                size={40}
                className="animate-spin text-primary"
                style={{ animationDuration: "2s" }}
              />
            </div>
          </div>
          <h1
            className="mt-8 text-[22px] font-extrabold leading-[1.4] tracking-[-0.8px] text-foreground"
            style={ease(0.2)}
          >
            리포트를 생성하고 있어요
          </h1>
          <p
            className="mt-3 text-[13px] leading-[1.7] text-muted"
            style={ease(0.3)}
          >
            AI가 두 분의 검사 결과를 분석 중이에요.
            <br />
            보통 1~2분 정도 소요됩니다.
          </p>
          <div
            className="mt-8 flex items-center gap-2"
            style={ease(0.4)}
          >
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
              style={{ animationDelay: "0.6s" }}
            />
          </div>
          <p
            className="mt-6 text-[11px] text-[#B8A898]"
            style={ease(0.5)}
          >
            페이지를 나가도 리포트는 계속 생성돼요
          </p>
        </main>
      )}

      {/* Failed */}
      {status === "failed" && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">{"\uD83D\uDE22"}</div>
          <h1 className="mt-5 text-xl font-bold text-foreground">
            리포트 생성에 실패했어요
          </h1>
          <p className="mt-2 text-sm text-muted">
            네트워크 문제일 수 있어요.
            <br />
            다시 시도해 보세요.
          </p>
          <button
            disabled={retrying}
            onClick={() => {
              startRetry(async () => {
                const result = await retryReport(reportId);
                if (!result.error) {
                  setStatus("generating");
                }
              });
            }}
            className="mt-8 flex h-[52px] w-full max-w-[280px] items-center justify-center rounded-2xl text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #D4735C, #C0614A)",
              boxShadow: "0 4px 16px rgba(212,115,92,0.25)",
            }}
          >
            {retrying ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "다시 시도하기"
            )}
          </button>
        </main>
      )}

      {/* Completed */}
      {status === "completed" && content && (
        <div className="flex-1 overflow-y-auto px-5 pb-10">
          {/* ── Grade badges ── */}
          <div className="mt-6 flex justify-center gap-2" style={ease(0.05)}>
            {(
              [
                ["ESB", content.grades.esb],
                ["CSP", content.grades.csp],
                ["PCI", content.grades.pci],
                ["STB", content.grades.stb],
              ] as const
            ).map(([code, grade]) => (
              <div
                key={code}
                className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5"
                style={{
                  borderColor: `${GRADE_CONFIG[grade].border}30`,
                  background: GRADE_CONFIG[grade].bg,
                }}
              >
                <span className="text-[12px] font-semibold text-[#6B6360]">
                  {code}
                </span>
                <span
                  className="text-[14px] font-extrabold"
                  style={{ color: GRADE_CONFIG[grade].color }}
                >
                  {grade}
                </span>
              </div>
            ))}
          </div>

          {/* ── Summary ── */}
          <div className="mt-7" style={ease(0.1)}>
            <div className="mb-3.5 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF0EB] text-base">
                {"\uD83D\uDCCB"}
              </div>
              <div>
                <div className="text-[15px] font-bold text-foreground">
                  종합 총평
                </div>
                <div className="text-[11px] text-[#B8A898]">
                  Overall Assessment
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-black/[0.03] bg-white p-[20px_18px]">
              <p className="text-[13px] leading-[1.85] text-[#555]">
                {content.summary.text}
              </p>
            </div>

            <div className="mt-2.5">
              <TheoryBox theory={content.summary.theory} />
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="my-7 h-px bg-[#ECE8E3]" style={ease(0.15)} />

          {/* ── Indicators ── */}
          <div
            className="mb-3.5 flex items-center gap-2.5 px-1"
            style={ease(0.2)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F3EFF9] text-base">
              {"\uD83D\uDD0D"}
            </div>
            <div>
              <div className="text-[15px] font-bold text-foreground">
                세부 지표 분석
              </div>
              <div className="text-[11px] text-[#B8A898]">
                Detailed Indicator Analysis
              </div>
            </div>
          </div>

          {content.indicators.map((indicator, i) => (
            <IndicatorSection
              key={i}
              indicator={indicator}
              style={ease(0.25 + i * 0.05)}
            />
          ))}

          {/* ── Divider ── */}
          <div className="my-7 h-px bg-[#ECE8E3]" style={ease(0.5)} />

          {/* ── Closing ── */}
          <div
            className="rounded-[22px] border border-[rgba(212,115,92,0.1)] p-[28px_22px]"
            style={{
              background: "linear-gradient(160deg, #FFF8F0, #FFF0E6)",
              ...ease(0.55),
            }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white text-base">
                {"\uD83C\uDF3F"}
              </div>
              <div className="text-[15px] font-bold text-foreground">
                앞으로의 방향 제언
              </div>
            </div>

            <p className="text-[13px] leading-[1.85] text-[#555]">
              {content.closing.text}
            </p>

            <div className="mt-4">
              <TheoryBox theory={content.closing.theory} />
            </div>
          </div>

          {/* ── Prenatal Guide (예비 부모 전용) ── */}
          {content.prenatal && (
            <div
              className="mt-5 rounded-[20px] border border-black/[0.03] bg-white px-5 py-6"
              style={ease(0.58)}
            >
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF0EB] text-base">
                  🤰
                </div>
                <div className="text-[15px] font-bold text-foreground">
                  태교 커뮤니케이션 가이드
                </div>
              </div>

              {/* 소통 스타일 */}
              <div className="mb-5">
                <div className="mb-2 text-[13px] font-bold text-primary">
                  💬 두 분의 소통 스타일
                </div>
                <p className="text-[13px] leading-[1.85] text-[#555]">
                  {content.prenatal.communication_style}
                </p>
              </div>

              {/* 태교 활동 */}
              <div className="mb-5">
                <div className="mb-3 text-[13px] font-bold text-primary">
                  🎯 맞춤 태교 활동
                </div>
                <div className="flex flex-col gap-3">
                  {content.prenatal.activities.map((activity, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[#ECE8E3] bg-[#FEFCF9] px-4 py-3.5"
                    >
                      <div className="text-[13px] font-bold text-foreground">
                        {activity.type_name}
                      </div>
                      <div className="mt-1 text-[11px] text-[#9A918A]">
                        {activity.reason}
                      </div>
                      <ul className="mt-2 flex flex-col gap-1">
                        {activity.activities.map((act, j) => (
                          <li key={j} className="flex items-start gap-1.5 text-[12px] leading-[1.6] text-[#555]">
                            <span className="mt-0.5 text-primary">•</span>
                            {act}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 text-[11px] leading-[1.6] text-[#9A918A]">
                        {activity.how_to_start} · {activity.together}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 매일 태교 대화법 */}
              <div className="mb-5">
                <div className="mb-2 text-[13px] font-bold text-primary">
                  🗓️ 매일 태교 대화법
                </div>
                <p className="text-[13px] leading-[1.85] text-[#555]">
                  {content.prenatal.daily_conversation}
                </p>
              </div>

              {/* 대화 스크립트 */}
              <div
                className="mb-5 rounded-xl px-4 py-3.5"
                style={{ background: "linear-gradient(160deg, #FFF6F2, #FFF0EB)" }}
              >
                <div className="mb-2 text-[12px] font-bold text-primary">
                  💌 오늘의 태교 대화 스크립트
                </div>
                <p className="whitespace-pre-line text-[13px] leading-[1.85] text-[#555]">
                  {content.prenatal.script}
                </p>
              </div>

              {/* 한줄 메시지 */}
              <div className="rounded-xl bg-[#F8F6F3] px-4 py-3 text-center">
                <p className="text-[13px] font-semibold leading-[1.6] text-foreground">
                  {content.prenatal.one_line_message}
                </p>
              </div>
            </div>
          )}

          {/* ── Report Review ── */}
          <div className="mt-7" style={ease(0.6)}>
            {hasReview ? (
              <div className="flex flex-col items-center gap-2 rounded-[18px] border border-[#ECE8E3] bg-white py-6">
                <span className="text-2xl">💌</span>
                <p className="text-[13px] font-semibold text-foreground">
                  소중한 의견을 남겨 주셨어요!
                </p>
                <p className="text-[11px] text-[#9A918A]">
                  두 분의 이야기가 더 나은 리포트를 만드는 데 큰 도움이 돼요
                </p>
              </div>
            ) : (
              <div className="rounded-[18px] border border-[#ECE8E3] bg-white px-5 py-6">
                <div className="mb-1 text-center text-[15px] font-bold text-foreground">
                  이 리포트는 어떠셨나요?
                </div>
                <p className="mb-5 text-center text-[11px] text-[#9A918A]">
                  두 분의 소중한 의견이 더 나은 리포트를 만듭니다.
                </p>

                <div className="flex flex-col gap-4">
                  <ReviewStars
                    label="우리 부부의 모습을 잘 묘사했나요?"
                    value={reviewR1}
                    onChange={setReviewR1}
                  />
                  <ReviewStars
                    label="제안한 조언이 도움이 될 것 같나요?"
                    value={reviewR2}
                    onChange={setReviewR2}
                  />
                  <ReviewStars
                    label="양육에 대한 자신감이 생겼나요?"
                    value={reviewR3}
                    onChange={setReviewR3}
                  />
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-[12px] text-[#9A918A]">
                    인상 깊은 부분이나 아쉬운 점 (선택)
                  </label>
                  <textarea
                    value={reviewR4}
                    onChange={(e) => setReviewR4(e.target.value)}
                    placeholder="자유롭게 적어주세요."
                    rows={3}
                    className="w-full resize-none rounded-xl border-[1.5px] border-[#ECE8E3] bg-[#FEFCF9] px-3.5 py-3 text-[13px] text-foreground outline-none placeholder:text-[#C4BEB8] focus:border-primary"
                  />
                </div>

                <button
                  disabled={!reviewR1 || !reviewR2 || !reviewR3 || submittingReview}
                  onClick={() => {
                    startSubmittingReview(async () => {
                      await submitReportReview(
                        reportId,
                        profileId,
                        reviewR1 * 2,
                        reviewR2 * 2,
                        reviewR3 * 2,
                        reviewR4.trim() || undefined,
                      );
                      setHasReview(true);
                      toast("소중한 의견 감사합니다!");
                    });
                  }}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border-none text-[13px] font-semibold text-white transition-all disabled:opacity-40"
                  style={{
                    background:
                      reviewR1 && reviewR2 && reviewR3
                        ? "linear-gradient(135deg, #D4735C, #C0614A)"
                        : "#D4CFC8",
                  }}
                >
                  {submittingReview ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "제출하기"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="mt-7 flex flex-col gap-2" style={ease(0.65)}>
            <button
              onClick={() => router.push("/report/list")}
              className="h-12 w-full cursor-pointer rounded-[14px] border-none text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #D4735C, #C0614A)",
                boxShadow: "0 4px 14px rgba(212,115,92,0.25)",
              }}
            >
              목록으로 돌아가기
            </button>
            <button
              disabled={downloading}
              onClick={async () => {
                if (!content) return;
                setDownloading(true);
                try {
                  await handleDownloadPdf(content);
                } catch (e) {
                  console.error("PDF generation failed:", e);
                } finally {
                  setDownloading(false);
                }
              }}
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] border-[#ECE8E3] bg-white text-[13px] font-medium text-[#6B6360] disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 size={16} className="animate-spin text-[#6B6360]" />
              ) : (
                "PDF로 저장하기"
              )}
            </button>
          </div>

          {/* ── Footer ── */}
          <div className="mt-7 pb-3 text-center" style={ease(0.65)}>
            <p className="text-[10px] leading-[1.7] text-[#B8A898] opacity-60">
              심리학 이론 기반 분석 · 비임상 참고 목적 리포트
              <br />
              BeFe × Chemistry 2026
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
