"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { BefeProfile, BefeAnswer, Question } from "@/db/schema";
import { calculateProfileScores } from "@/lib/scorer";
import { saveAnswer, completeTest } from "./actions";
import { Loader2 } from "lucide-react";

// ── Scale map ──

const scaleMap: Record<
  number,
  { value: number; label: string; short: string }[]
> = {
  5: [
    { value: 1, label: "전혀 아니다", short: "A" },
    { value: 2, label: "아닌 편이다", short: "B" },
    { value: 3, label: "보통이다", short: "C" },
    { value: 4, label: "그런 편이다", short: "D" },
    { value: 5, label: "매우 그렇다", short: "E" },
  ],
  7: [
    { value: 1, label: "전혀 아니다", short: "A" },
    { value: 2, label: "아니다", short: "B" },
    { value: 3, label: "약간 아니다", short: "C" },
    { value: 4, label: "보통이다", short: "D" },
    { value: 5, label: "약간 그렇다", short: "E" },
    { value: 6, label: "그렇다", short: "F" },
    { value: 7, label: "매우 그렇다", short: "G" },
  ],
};

// ── Option Card ──

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

export function TestClient({
  profile,
  questions,
  initialAnswers,
}: {
  profile: BefeProfile;
  questions: Question[];
  initialAnswers: BefeAnswer[];
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(profile.test_index);
  const [answers, setAnswers] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const a of initialAnswers) {
      map.set(a.question_id, a.answer);
    }
    return map;
  });
  const [flashingValue, setFlashingValue] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<"visible" | "exit" | "enter">("visible");
  const [direction, setDirection] = useState(1);
  const [completing, setCompleting] = useState(false);

  const total = questions.length;
  const done = idx >= total;
  const progress = total > 0 ? Math.min((idx / total) * 100, 100) : 0;

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
      if (locked || done) return;
      const q = questions[idx];

      setFlashingValue(value);
      setLocked(true);

      setAnswers((prev) => new Map(prev).set(q.id, value));
      saveAnswer(profile.id, q.id, value, idx + 1);

      setTimeout(() => {
        if (idx < total - 1) {
          goTo(idx + 1, 1);
        } else {
          setIdx(total);
        }
      }, 600);
    },
    [locked, done, idx, total, questions, profile.id, goTo],
  );

  const handlePrev = useCallback(() => {
    if (idx > 0 && !locked) {
      goTo(idx - 1, -1);
    } else if (idx === 0 && !locked) {
      router.push("/test/intro");
    }
  }, [idx, locked, goTo, router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done || phase !== "visible" || locked) return;
      const q = questions[idx];
      const opts = scaleMap[q.test_id === "big-5" ? 5 : 7];
      const keyMap: Record<string, number> = {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
        f: 5,
        g: 6,
      };
      const ki = keyMap[e.key.toLowerCase()];
      if (ki !== undefined && ki < opts.length) {
        handleSelect(opts[ki].value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [idx, done, phase, locked, questions, handleSelect]);

  const handleCompleteTest = useCallback(async () => {
    if (completing) return;
    setCompleting(true);

    try {
      const answersArray = Array.from(answers.entries()).map(
        ([question_id, answer]) => ({ question_id, answer }),
      );
      const { patch } = calculateProfileScores({
        questions,
        answers: answersArray,
      });
      await completeTest(profile.id, patch);
      router.replace("/home");
    } catch (error) {
      console.error("Error completing test:", error);
      setCompleting(false);
    }
  }, [completing, answers, questions, profile.id, router]);

  // ── Done screen (auto-save and redirect) ──
  if (done) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <div
          className="animate-scale-reveal flex h-[88px] w-[88px] items-center justify-center rounded-full text-[40px]"
          style={{
            background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
            boxShadow: "0 8px 24px rgba(212,115,92,0.12)",
          }}
        >
          🎉
        </div>
        <h1
          className="animate-fade-up mt-6 text-[22px] font-extrabold text-foreground"
          style={{ animationDelay: "120ms" }}
        >
          검사 완료!
        </h1>
        <p
          className="animate-fade-up mt-2.5 text-sm leading-[1.7] text-muted"
          style={{ animationDelay: "240ms" }}
        >
          검사 결과를 저장하고
          <br />
          다음 단계로 이동해요.
        </p>
        <button
          onClick={handleCompleteTest}
          disabled={completing}
          className="animate-fade-up mt-9 flex h-[52px] w-full max-w-[320px] items-center justify-center rounded-2xl border-none text-[15px] font-bold text-white disabled:cursor-default"
          style={{
            background: completing
              ? "#E8C4BA"
              : "linear-gradient(135deg, #D4735C, #C0614A)",
            boxShadow: "0 6px 20px rgba(212,115,92,0.3)",
            animationDelay: "400ms",
          }}
        >
          {completing ? <Loader2 className="animate-spin" /> : "결과 확인하기"}
        </button>
      </div>
    );
  }

  // ── Question screen ──
  const q = questions[idx];
  const options = scaleMap[q.test_id === "big-5" ? 5 : 7];

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* ── Header ── */}
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
              width: `${progress}%`,
              background: "linear-gradient(90deg, #D4735C, #E8927C)",
            }}
          />
        </div>
      </div>

      {/* ── Question + Options ── */}
      <div
        className="flex flex-col px-5 pb-6 pt-8 transition-all duration-250"
        style={{
          opacity: phase === "visible" ? 1 : 0,
          transform:
            phase === "exit"
              ? `translateY(${direction * 40}px)`
              : phase === "enter"
                ? `translateY(${-direction * 30}px)`
                : "translateY(0)",
          transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Question text */}
        <h2 className="mb-9 whitespace-pre-line text-[22px] font-extrabold leading-[1.5] tracking-[-0.8px] text-foreground">
          {q.content.replace(/\.$/, "")}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {options.map((opt) => {
            const isSelected =
              answers.get(q.id) === opt.value || flashingValue === opt.value;
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
    </div>
  );
}
