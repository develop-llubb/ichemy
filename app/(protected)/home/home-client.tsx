"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { acceptInvitationFromHome } from "./actions";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { AppBar } from "@/components/app-bar";

// ── Types ──

interface PendingInvitation {
  id: string;
  inviterProfileId: string;
  inviterNickname: string;
}

interface HomeClientProps {
  nickname: string;
  role: "mom" | "dad";
  partnerNickname: string | null;
  status: "done_no_partner" | "waiting_partner" | "both_complete";
  profileId: string;
  tags: Array<{ label: string; bg: string; color: string }> | null;
  hasCouple: boolean;
  heartBalance: number | null;
  pendingInvitation: PendingInvitation | null;
  reportId: string | null;
  reportCount: number;
  hasPersonalityReport: boolean;
}

// ── Main ──

export function HomeClient({
  nickname,
  role,
  status,
  hasCouple,
  heartBalance,
  pendingInvitation,
  reportId,
  reportCount,
  hasPersonalityReport,
}: HomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [acceptPending, startAcceptTransition] = useTransition();
  const [invitationAccepted, setInvitationAccepted] = useState(false);

  useEffect(() => {
    router.refresh();
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 하트 충전 완료 복귀 시 토스트
  useEffect(() => {
    if (searchParams.get("hearts_charged") === "1") {
      toast("하트 충전이 완료되었어요!");
      router.replace("/home", { scroll: false });
    }
  }, [searchParams, router]);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const handleViewCareReport = useCallback(() => {
    if (reportCount >= 1) {
      router.push("/report/list");
    } else if (hasCouple && status === "both_complete") {
      router.push("/report?from=/home");
    } else if (status === "waiting_partner") {
      router.push("/home/waiting");
    } else {
      router.push("/home/invite");
    }
  }, [reportCount, reportId, hasCouple, status, router]);

  return (
    <>
      <style>{`
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes confettiBurst {
          0% { transform: scale(0.5); }
          100% { transform: scale(1); }
        }
        @keyframes checkDraw {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        <AppBar
          variant="home"
          nickname={nickname}
          role={role}
          hasCouple={hasCouple}
          heartBalance={heartBalance}
        />

        {/* ── Complete Page Content ── */}
        <div className="flex flex-1 flex-col items-center px-5">
          {/* Success icon */}
          <div className="relative mt-[48px]" style={ease(0)}>
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -mt-12 -ml-12 h-24 w-24 rounded-full border-2 border-primary"
              style={{
                animation: ready ? "ringPulse 1.5s ease-out 0.3s" : "none",
                opacity: 0,
              }}
            />
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -mt-12 -ml-12 h-24 w-24 rounded-full border-2 border-primary"
              style={{
                animation: ready ? "ringPulse 1.5s ease-out 0.6s" : "none",
                opacity: 0,
              }}
            />
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(145deg, #D4735C, #C0614A)",
                boxShadow: "0 12px 32px rgba(212,115,92,0.25)",
                animation: ready
                  ? "confettiBurst 0.5s cubic-bezier(0.22,1,0.36,1)"
                  : "none",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 24,
                    strokeDashoffset: 0,
                    animation: ready
                      ? "checkDraw 0.4s ease 0.3s backwards"
                      : "none",
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="mt-7 text-center text-2xl font-extrabold tracking-[-0.8px] text-foreground"
            style={ease(0.15)}
          >
            {nickname}님,
            <br />
            검사가 완료되었어요!
          </h1>
          <p
            className="mt-2.5 text-center text-sm text-muted"
            style={ease(0.2)}
          >
            {/* 응답이 저장되었습니다.
            <br /> */}
            지금 바로 결과를 확인해 보세요.
          </p>

          {/* Pending invitation banner */}
          {pendingInvitation && !invitationAccepted && (
            <div
              className="mt-6 w-full rounded-[20px] border-2 border-primary p-5"
              style={{
                background: "linear-gradient(160deg, #FFF6F2, #FFF0EB)",
                boxShadow: "0 4px 16px rgba(212,115,92,0.1)",
                ...ease(0.25),
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{
                    background: "linear-gradient(145deg, #D4735C, #C0614A)",
                  }}
                >
                  💌
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-base font-bold text-primary">
                    {pendingInvitation.inviterNickname}님의 초대
                  </div>
                  <div className="text-xs leading-[1.5] text-muted">
                    수락하고 육아 케미를 확인해보세요!
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  startAcceptTransition(async () => {
                    const result = await acceptInvitationFromHome(
                      pendingInvitation.inviterProfileId,
                    );
                    if (result.success) {
                      setInvitationAccepted(true);
                      toast(
                        `${pendingInvitation.inviterNickname}님의 초대를 수락했어요!`,
                        {
                          action: {
                            label: "확인",
                            onClick: () => {},
                          },
                        },
                      );
                      router.refresh();
                    }
                  });
                }}
                disabled={acceptPending}
                className="mt-4 h-11 w-full flex items-center justify-center rounded-xl bg-primary text-[14px] font-semibold text-white shadow-[0_4px_16px_rgba(212,115,92,0.25)] transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {acceptPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "수락하기"
                )}
              </button>
            </div>
          )}

          {/* Two CTA cards */}
          <div
            className={`${pendingInvitation && !invitationAccepted ? "mt-4" : "mt-9"} flex w-full flex-col gap-3`}
            style={ease(0.3)}
          >
            {/* Card 1: 나의 육아 성향 리포트 */}
            <button
              onClick={() =>
                router.push(
                  hasPersonalityReport ? "/report/me" : "/report/me/intro",
                )
              }
              className="flex w-full items-center gap-4 rounded-[20px] border-[1.5px] border-[#ECE8E3] bg-white p-[22px_20px] text-left transition-all duration-150"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}
            >
              <div
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{
                  background: "linear-gradient(145deg, #F3EFF9, #EDE8F5)",
                }}
              >
                🧩
              </div>
              <div className="flex-1">
                <div className="mb-1 text-base font-bold text-foreground">
                  나의 육아 성향 리포트
                </div>
                <div className="text-xs leading-[1.5] text-muted">
                  {hasPersonalityReport
                    ? "AI 맞춤 분석 리포트 보기"
                    : "무료로 AI 맞춤 분석 받기"}
                </div>
              </div>
              <span className="text-lg text-[#D4CFC8]">→</span>
            </button>

            {/* Card 2: 육아 케어 리포트 */}
            <button
              onClick={handleViewCareReport}
              className="flex w-full items-center gap-4 rounded-[20px] border-2 border-primary p-[22px_20px] text-left transition-all duration-150"
              style={{
                background: "linear-gradient(160deg, #FFF6F2, #FFF0EB)",
                boxShadow: "0 4px 16px rgba(212,115,92,0.1)",
              }}
            >
              <div
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{
                  background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
                }}
              >
                <Image
                  src="/baby.png"
                  alt="아기"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-base font-bold text-primary">
                  육아 케어 리포트
                </div>
                <div className="text-xs leading-[1.5] text-muted">
                  부부 육아 점수 · 4대 지표 분석
                </div>
              </div>
              <span className="text-lg text-primary">→</span>
            </button>
          </div>

          {/* Info note — couple이 없을 때만 표시 */}
          {!hasCouple && (
            <div
              className="mt-6 mb-8 w-full rounded-[14px] bg-[#F8F6F3] p-[14px_18px]"
              style={ease(0.4)}
            >
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 text-base">💡</span>
                <p className="text-xs leading-[1.6] text-muted">
                  육아 케어 리포트는 배우자와 함께 검사를 완료해야 생성돼요.
                  아직 배우자가 검사를 하지 않았다면 초대 링크를 보내보세요.
                </p>
              </div>
              <button
                onClick={() => router.push("/home/invite")}
                className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border-none bg-[#ECE8E3] text-[12px] font-medium text-[#6B6360] transition-all active:scale-[0.98]"
              >
                배우자 초대하기
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
