"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2 } from "lucide-react";
import { saveCriterionAnswer } from "./actions";
import {
  CRITERION_QUESTIONS,
  LIKERT_LABELS,
} from "@/lib/criterion-questions";
import type { ReportType } from "@/lib/care-report";

// ── Scale options (5점 리커트, 기존 테스트와 동일 구조) ──

const OPTIONS = LIKERT_LABELS.map((label, i) => ({
  value: i + 1,
  label,
  short: String.fromCharCode(65 + i), // A, B, C, D, E
}));

// ── OptionCard (기존 테스트 UI 그대로) ──

function OptionCard({
  opt,
  isSelected,
  isFlashing,
  disabled,
  onClick,
}: {
  opt: { value: number; label: string; short: string };
  isSelected: boolean;
  isFlashing: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: "14px 16px",
        borderRadius: 14,
        border: isSelected ? "2px solid #D4735C" : "1.5px solid #ECE8E3",
        background: isSelected ? "#FFF0EB" : "#fff",
        cursor: disabled ? "default" : "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.15s ease",
        textAlign: "left",
        position: "relative",
        overflow: "hidden",
        animation: isFlashing
          ? "flashPop 0.5s cubic-bezier(0.22,1,0.36,1)"
          : "none",
      }}
    >
      {/* Shimmer overlay */}
      {isFlashing && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            animation: "shimmerSlide 0.5s ease-out",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Key badge */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          border: isSelected ? "2px solid #D4735C" : "1.5px solid #E8E2DC",
          background: isSelected
            ? "linear-gradient(135deg, #D4735C, #C0614A)"
            : "#FAFAF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s ease",
          animation: isFlashing ? "badgeBounce 0.35s ease" : "none",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isSelected ? "#fff" : "#B8A898",
            transition: "all 0.15s ease",
          }}
        >
          {opt.short}
        </span>
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 14,
          fontWeight: isSelected ? 600 : 400,
          color: isSelected ? "#D4735C" : "#6B6360",
          transition: "all 0.15s ease",
        }}
      >
        {opt.label}
      </span>

      {/* Check */}
      {isSelected && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 16,
            color: "#D4735C",
            animation: "checkPop 0.3s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

// ── Main ──

interface CriterionClientProps {
  reportId: string;
  coupleId: string;
  profileId: string;
  reportType: ReportType;
  initialAnswers: (number | null)[];
}

export function CriterionClient({
  reportId,
  coupleId,
  profileId,
  reportType,
  initialAnswers,
}: CriterionClientProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // 첫 번째 미응답 문항부터 시작
  const startIdx = initialAnswers.findIndex((v) => v === null);
  const [idx, setIdx] = useState(startIdx === -1 ? 0 : startIdx);
  const [answers, setAnswers] = useState<(number | null)[]>(initialAnswers);
  const [flashingValue, setFlashingValue] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<"visible" | "exit" | "enter">("visible");
  const [direction, setDirection] = useState(1);
  const [submitting, startSubmitting] = useTransition();

  const questions = CRITERION_QUESTIONS[reportType];
  const total = questions.length;
  const progress = idx / total;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((nextIdx: number, dir: number) => {
    setDirection(dir);
    setPhase("exit");
    setTimeout(() => {
      setIdx(nextIdx);
      setFlashingValue(null);
      setLocked(false);
      setPhase("enter");
      setTimeout(() => setPhase("visible"), 30);
    }, 250);
  }, []);

  const handleSelect = useCallback(
    (value: number) => {
      if (locked) return;

      setFlashingValue(value);
      setLocked(true);

      const newAnswers = [...answers];
      newAnswers[idx] = value;
      setAnswers(newAnswers);

      if (idx < total - 1) {
        // 중간 문항 — fire-and-forget 저장 후 다음으로
        saveCriterionAnswer(coupleId, profileId, reportType, idx, value);
        setTimeout(() => goTo(idx + 1, 1), 600);
      } else {
        // 마지막 문항 — 저장 완료 대기 후 리포트로 이동
        startSubmitting(async () => {
          await saveCriterionAnswer(coupleId, profileId, reportType, idx, value);
          router.replace(`/report/${reportId}`);
        });
      }
    },
    [locked, idx, total, answers, goTo, coupleId, profileId, reportType, reportId, router],
  );

  const handlePrev = useCallback(() => {
    if (locked) return;
    if (idx > 0) {
      goTo(idx - 1, -1);
    } else {
      router.push("/report/list");
    }
  }, [idx, locked, goTo, router]);

  // 키보드 단축키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "visible" || locked) return;
      if (e.key === "ArrowLeft") {
        handlePrev();
        return;
      }
      const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4 };
      const ki = keyMap[e.key.toLowerCase()];
      if (ki !== undefined) {
        handleSelect(OPTIONS[ki].value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, locked, handleSelect, handlePrev]);

  const q = questions[idx];

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 px-5 pt-4">
        <div className="mb-3.5 flex items-center justify-between">
          <button
            onClick={handlePrev}
            className={`border-none bg-transparent pr-2.5 py-1.5 text-xl ${
              !locked
                ? "cursor-pointer text-foreground"
                : "cursor-default text-[#D4CFC8]"
            }`}
          >
            ←
          </button>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-extrabold text-primary">
              {idx + 1}
            </span>
            <span className="text-[13px] font-medium text-accent">
              /{total}
            </span>
          </div>
          <div className="w-[30px]" />
        </div>
        <div className="h-[3px] w-full overflow-hidden rounded-sm bg-[#ECE8E3]">
          <div
            className="h-full rounded-sm transition-[width] duration-400 ease-out"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #D4735C, #E8927C)",
            }}
          />
        </div>
      </div>

      {/* Header message */}
      <div
        className="flex flex-col items-center px-6 pt-5 pb-2 text-center"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm"
          style={{ background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)" }}
        >
          <Loader2
            size={15}
            className="animate-spin text-primary"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <span className="mt-2 text-[13px] font-semibold text-foreground">
          리포트 준비 중
        </span>
        <p className="mt-1.5 text-[12px] leading-[1.6] text-[#9A918A]">
          리포트가 만들어지는 동안, 몇 가지만 더 여쭤볼게요!
        </p>
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col px-6 pt-5">
        <p
          className="text-[16px] font-bold leading-[1.6] text-foreground"
          style={{
            opacity: phase === "visible" ? 1 : 0,
            transform:
              phase === "exit"
                ? `translateY(${direction * 40}px)`
                : phase === "enter"
                  ? `translateY(${-direction * 30}px)`
                  : "translateY(0)",
            transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {q.text}
        </p>

        {/* Options */}
        <div
          className="mt-6 flex flex-col gap-2"
          style={{
            opacity: phase === "visible" ? 1 : 0,
            transform:
              phase === "exit"
                ? `translateY(${direction * 40}px)`
                : phase === "enter"
                  ? `translateY(${-direction * 30}px)`
                  : "translateY(0)",
            transition: "all 0.25s cubic-bezier(0.22,1,0.36,1) 0.03s",
          }}
        >
          {OPTIONS.map((opt) => {
            const isSelected =
              answers[idx] === opt.value || flashingValue === opt.value;
            const isFlashing = flashingValue === opt.value;
            return (
              <OptionCard
                key={opt.value}
                opt={opt}
                isSelected={isSelected}
                isFlashing={isFlashing}
                disabled={locked}
                onClick={() => handleSelect(opt.value)}
              />
            );
          })}
        </div>
      </div>

      {/* Submitting overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              응답을 저장하고 있어요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
