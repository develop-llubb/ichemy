"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { logout } from "@/lib/auth-actions";
import { acceptInvitationFromHome } from "./actions";
import { deleteAccount } from "./delete-account-action";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Loader2, X, PencilIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

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
  pendingInvitation,
  reportId,
  reportCount,
  hasPersonalityReport,
}: HomeClientProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [acceptPending, startAcceptTransition] = useTransition();
  const [invitationAccepted, setInvitationAccepted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, startDeleting] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const handleViewCareReport = useCallback(() => {
    if (reportCount >= 1) {
      router.push("/report/list");
    } else if (hasCouple && status === "both_complete") {
      router.push("/report");
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

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) setDrawerOpen(false);
        }}
        direction="right"
      >
        <DrawerContent direction="right">
          <DrawerTitle className="sr-only">메뉴</DrawerTitle>
          {/* Close button */}
          <div className="flex items-center justify-end px-5 pt-4">
            <DrawerClose className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-[#9A918A] transition-colors hover:bg-[#F0EDE9] hover:text-foreground">
              <X size={20} strokeWidth={2} />
            </DrawerClose>
          </div>

          {/* Profile section */}
          <div className="border-b border-[#ECE8E3] px-5 pt-4 pb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                style={{
                  background: "linear-gradient(135deg, #FFE8D6, #FFF0E6)",
                }}
              >
                {role === "mom" ? "👩" : "👨"}
              </div>
              <div>
                <div className="text-base font-bold text-foreground">
                  {nickname}
                </div>
                <div className="mt-0.5 text-xs text-[#9A918A]">
                  {role === "mom" ? "엄마" : "아빠"}
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="px-2 pt-2">
            <button
              onClick={() => {
                setDrawerOpen(false);
                router.push("/profile/edit");
              }}
              className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium text-foreground hover:bg-[#F8F6F3] transition-colors"
            >
              <PencilIcon size={14} className="" />내 정보 수정
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: logout + footer */}
          <div className="border-t border-[#ECE8E3] px-5 pt-4 pb-6">
            <button
              onClick={() => logout()}
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-[#ECE8E3] bg-white text-[13px] font-medium text-[#6B6360]"
            >
              로그아웃
            </button>
            <button
              onClick={() => {
                setDrawerOpen(false);
                setTimeout(() => setDeleteDialogOpen(true), 300);
              }}
              className="mt-3 w-full cursor-pointer border-none bg-transparent text-center text-[11px] text-[#D4CFC8] underline transition-colors hover:text-[#8A8078]"
            >
              회원탈퇴
            </button>
            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-[#C4BEB8]">
              <Link
                href="/terms"
                onClick={() => setDrawerOpen(false)}
                className="hover:text-[#8A8078] transition-colors"
              >
                이용약관
              </Link>
              <span className="text-[#D4CFC8]">·</span>
              <Link
                href="/privacy"
                onClick={() => setDrawerOpen(false)}
                className="hover:text-[#8A8078] transition-colors"
              >
                개인정보 처리방침
              </Link>
            </div>
            <div className="mt-3 text-center">
              <div className="text-[11px] text-[#C4BEB8]">
                아이케미 · 부부 육아 케어 리포트
              </div>
              <div className="mt-1 text-[10px] text-[#D4CFC8]">
                © 2025 LLUBB
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        {/* ── Header (sticky) ── */}
        <div className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
          <span className="font-display text-2xl tracking-wider text-primary">
            아이케미
          </span>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="#3A3A3A"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="3" y1="5" x2="17" y2="5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="15" x2="17" y2="15" />
            </svg>
          </button>
        </div>

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
                <Image src="/baby.png" alt="아기" width={32} height={32} className="h-8 w-8 object-contain" />
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
                  육아 케어 리포트는 배우자와 함께 검사를 완료해야 생성돼요. 아직
                  배우자가 검사를 하지 않았다면 초대 링크를 보내보세요.
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="정말 탈퇴하시겠어요?"
        description="탈퇴하면 모든 검사 결과와 리포트가 삭제되며 복구할 수 없습니다."
        confirmLabel="탈퇴하기"
        cancelLabel="취소"
        loading={deleting}
        onConfirm={() => {
          startDeleting(async () => {
            const result = await deleteAccount();
            if (result?.error) {
              toast(result.error);
              setDeleteDialogOpen(false);
            }
          });
        }}
      />
    </>
  );
}
