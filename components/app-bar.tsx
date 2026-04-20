"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  X,
  PencilIcon,
  ShieldCheck,
  Store,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import { logout } from "@/lib/auth-actions";
import { deleteAccount } from "@/app/(protected)/home/delete-account-action";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { NavData } from "@/lib/nav-data";

interface AppBarProps extends NavData {
  variant?: "home" | "page";
  title?: string;
  onBack?: () => void;
}

export function AppBar({
  variant = "page",
  title,
  onBack,
  nickname,
  role,
  hasCouple,
  heartBalance,
}: AppBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, startDeleting] = useTransition();

  const shopHref = pathname
    ? `/shop?from=${encodeURIComponent(pathname)}`
    : "/shop";

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <>
      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) setDrawerOpen(false);
        }}
        direction="right"
      >
        <DrawerContent>
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
            {hasCouple && (
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  router.push(shopHref);
                }}
                className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium text-foreground transition-colors hover:bg-[#F8F6F3]"
              >
                <Store size={14} />
                <span className="flex-1 text-left">하트 상점</span>
                {heartBalance !== null && (
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-primary">
                    ♥️ {heartBalance}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setDrawerOpen(false);
                router.push("/profile/edit");
              }}
              className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium text-foreground transition-colors hover:bg-[#F8F6F3]"
            >
              <PencilIcon size={14} />내 정보 수정
            </button>
            <button
              onClick={() => {
                setDrawerOpen(false);
                router.push("/marketing");
              }}
              className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium text-foreground transition-colors hover:bg-[#F8F6F3]"
            >
              <ShieldCheck size={14} />제3자 정보 제공 동의
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: customer center + logout + footer */}
          <div className="border-t border-[#ECE8E3] px-5 pt-4 pb-6">
            <div className="mb-4 rounded-xl bg-[#F8F6F3] px-3.5 py-3">
              <div className="mb-2 text-[11px] font-semibold text-[#6B6360]">
                고객센터
              </div>
              <a
                href="tel:010-3082-3241"
                className="flex items-center gap-2 py-1 text-[12px] text-[#6B6360] hover:text-primary"
              >
                <Phone size={12} className="shrink-0 text-[#9A918A]" />
                010-3082-3241
              </a>
              <a
                href="mailto:yskim@llubb.com"
                className="flex items-center gap-2 py-1 text-[12px] text-[#6B6360] hover:text-primary"
              >
                <Mail size={12} className="shrink-0 text-[#9A918A]" />
                yskim@llubb.com
              </a>
            </div>

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
                className="transition-colors hover:text-[#8A8078]"
              >
                이용약관
              </Link>
              <span className="text-[#D4CFC8]">·</span>
              <Link
                href="/privacy"
                onClick={() => setDrawerOpen(false)}
                className="transition-colors hover:text-[#8A8078]"
              >
                개인정보 처리방침
              </Link>
            </div>
            <div className="mt-3 text-center">
              <div className="text-[11px] text-[#C4BEB8]">
                아이케미 · 부부 육아 케어 리포트
              </div>
              <div className="mt-1 text-[10px] text-[#D4CFC8]">© 2025 LLUBB</div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* App bar */}
      <div className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-2 border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
        {/* Left */}
        {variant === "home" ? (
          <span className="font-display text-2xl tracking-wider text-primary">
            아이케미
          </span>
        ) : (
          <div className="flex min-w-0 items-center gap-1">
            <button
              onClick={handleBack}
              className="-ml-1.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent"
              aria-label="뒤로가기"
            >
              <ChevronLeft size={24} className="text-foreground" />
            </button>
            <span className="truncate text-[15px] font-semibold text-foreground">
              {title}
            </span>
          </div>
        )}

        {/* Right */}
        <div className="flex shrink-0 items-center gap-1.5">
          {hasCouple && heartBalance !== null && (
            <button
              onClick={() => router.push(shopHref)}
              className="flex h-8 cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-[#ECE8E3] bg-white px-2.5 text-[12px] font-semibold text-primary transition-colors hover:border-primary"
              aria-label="하트 상점"
            >
              <span className="text-[13px] leading-none">♥️</span>
              <span>{heartBalance}</span>
            </button>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent"
            aria-label="메뉴"
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
