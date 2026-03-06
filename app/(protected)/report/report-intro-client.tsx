"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveHasChildren, requestReport } from "./actions";
import { JOURNEY_STEPS } from "@/lib/steps";
import { CouponTicket } from "@/components/coupon-ticket";

interface ReportIntroClientProps {
  nickname: string;
  partnerNickname: string;
  coupleId: string;
  hasChildren: boolean | null;
  pcqScore: number;
  hasCoupon: boolean;
  lockedHasChildren?: boolean | null;
}

export function ReportIntroClient({
  nickname,
  partnerNickname,
  coupleId,
  hasChildren: initialHasChildren,
  pcqScore,
  hasCoupon,
  lockedHasChildren = null,
}: ReportIntroClientProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasChildren, setHasChildren] = useState<boolean | null>(
    initialHasChildren,
  );
  const [saving, setSaving] = useState(false);
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

  const handleSelect = useCallback(
    async (value: boolean) => {
      setHasChildren(value);
      setSaving(true);
      await saveHasChildren(coupleId, value);
      setSaving(false);
    },
    [coupleId],
  );

  // Step 3 완료 조건: hasChildren이 선택됨
  const step3Done = hasChildren !== null;
  // 현재 활성 스텝
  const activeIdx = step3Done ? 3 : 2;

  const steps = JOURNEY_STEPS;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,115,92,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(212,115,92,0); }
        }
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
            육아 케어 리포트
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
                background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
                boxShadow: "0 8px 24px rgba(212,115,92,0.08)",
                animation: ready ? "float 3s ease-in-out infinite" : "none",
              }}
            >
              👶
            </div>
          </div>

          {/* Heading */}
          <h1
            className="mt-6 text-center text-[22px] font-extrabold leading-[1.4] tracking-[-0.8px] text-foreground"
            style={ease(0.1)}
          >
            {nickname}님 & {partnerNickname}님의
            <br />
            육아 케어 리포트
          </h1>
          <p
            className="mt-2 text-center text-[13px] leading-[1.7] text-muted"
            style={ease(0.15)}
          >
            두 분의 검사 결과를 바탕으로
            <br />
            맞춤형 부부 육아 리포트를 생성해 드려요.
          </p>

          {/* PCQ Score preview */}
          <div
            className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-[#ECE8E3] bg-white px-5 py-2.5"
            style={ease(0.2)}
          >
            <span className="text-sm font-medium text-muted">
              부부 육아 케미 점수
            </span>
            <span className="text-lg font-extrabold text-primary">
              {Math.round(pcqScore)}점
            </span>
          </div>

          {/* Children question */}
          <div
            className="mt-7 w-full rounded-2xl border-[1.5px] border-[#ECE8E3] bg-white p-5"
            style={ease(0.25)}
          >
            <div className="mb-1.5 text-sm font-semibold text-foreground">
              현재 자녀가 있으신가요?
            </div>
            <p className="mb-4 text-xs leading-[1.5] text-[#9A918A]">
              자녀 유무에 따라 리포트 내용이 달라져요.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleSelect(true)}
                disabled={saving || lockedHasChildren !== null}
                className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all duration-200"
                style={{
                  borderColor: hasChildren === true ? "#D4735C" : "#ECE8E3",
                  background:
                    hasChildren === true
                      ? "linear-gradient(160deg, #FFF6F2, #FFF0EB)"
                      : "#fff",
                  opacity: lockedHasChildren !== null && lockedHasChildren !== true ? 0.4 : 1,
                  cursor: lockedHasChildren !== null ? "default" : "pointer",
                }}
              >
                <span className="text-3xl">👨‍👩‍👧</span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: hasChildren === true ? "#D4735C" : "#6B6360",
                  }}
                >
                  네, 있어요
                </span>
              </button>

              <button
                onClick={() => handleSelect(false)}
                disabled={saving || lockedHasChildren !== null}
                className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all duration-200"
                style={{
                  borderColor: hasChildren === false ? "#D4735C" : "#ECE8E3",
                  background:
                    hasChildren === false
                      ? "linear-gradient(160deg, #FFF6F2, #FFF0EB)"
                      : "#fff",
                  opacity: lockedHasChildren !== null && lockedHasChildren !== false ? 0.4 : 1,
                  cursor: lockedHasChildren !== null ? "default" : "pointer",
                }}
              >
                <span className="text-3xl">🤰</span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: hasChildren === false ? "#D4735C" : "#6B6360",
                  }}
                >
                  아직 없어요
                </span>
              </button>
            </div>
          </div>

          {/* Journey tracker */}
          <div
            className="mt-7 w-full rounded-[20px] border border-black/[0.03] bg-white p-[22px_20px]"
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

          {hasCoupon ? (
            <div className="mt-7 mb-6 w-full" style={ease(0.38)}>
              <CouponTicket
                title="무료 쿠폰 적용 완료!"
                description="결제 없이 바로 리포트를 받을 수 있어요"
              />
            </div>
          ) : (
            /* Baby fair promo */
            <div
              className="relative mt-7 mb-6 w-full overflow-hidden rounded-[18px] p-[22px_20px] text-white"
              style={{
                background: "linear-gradient(160deg, #D4735C, #C0614A)",
                ...ease(0.38),
              }}
            >
              <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/[0.08]" />
              <div className="pointer-events-none absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-white/[0.06]" />
              <div className="relative z-10">
                <div className="inline-block rounded-lg bg-white px-2.5 py-1.5">
                  <Image
                    src="/befe-logo.png"
                    alt="BeFe"
                    width={56}
                    height={24}
                    className="h-5 w-auto"
                  />
                </div>
                <div className="mt-3 mb-2.5 text-base font-extrabold leading-[1.5] tracking-[-0.3px]">
                  BeFe 베이비페어에서
                  <br />
                  QR 스캔하면 무료!
                </div>
                <p className="text-xs leading-[1.7] opacity-85">
                  BeFe 베이비페어 케미스트리 부스에서 QR을 스캔하시면 육아 케어
                  리포트를 무료로 받으실 수 있어요.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div
          className="sticky bottom-0 border-t border-black/[0.03] bg-background/95 px-5 py-4 backdrop-blur-sm"
          style={ease(0.4)}
        >
          <button
            disabled={hasChildren === null || requesting}
            onClick={() => {
              startRequesting(async () => {
                const result = await requestReport(coupleId, hasChildren!);
                if ("error" in result) {
                  toast(result.error);
                  return;
                }
                router.replace(`/report/${result.reportId}`);
              });
            }}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl border-none text-base font-bold text-white transition-all duration-200"
            style={{
              background:
                hasChildren !== null
                  ? "linear-gradient(135deg, #D4735C, #C0614A)"
                  : "#D4CFC8",
              boxShadow:
                hasChildren !== null
                  ? "0 4px 16px rgba(212,115,92,0.25)"
                  : "none",
              cursor: hasChildren !== null ? "pointer" : "not-allowed",
            }}
          >
            {requesting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : hasCoupon ? (
              "리포트 받기"
            ) : (
              "2,900원 결제하고 리포트 받기"
            )}
          </button>
          <p className="mt-2.5 text-center text-[11px] text-[#B8A898]">
            AI가 두 분의 데이터를 분석하여 맞춤 리포트를 생성합니다
          </p>
        </div>
      </div>
    </>
  );
}
