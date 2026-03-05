"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { acceptInvite } from "./action";

export function InviteLoggedIn({
  inviterProfileId,
  inviterNickname,
  myNickname,
}: {
  inviterProfileId: string;
  inviterNickname: string;
  myNickname: string;
}) {
  const [pending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(() => {
      acceptInvite(inviterProfileId);
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
          style={{
            background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
            boxShadow: "0 8px 24px rgba(212,115,92,0.1)",
          }}
        >
          💌
        </div>

        <h1 className="mt-5 font-display text-3xl text-primary">
          초대장이 도착했어요
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          <span className="font-semibold text-foreground">
            {inviterNickname}
          </span>
          님이{" "}
          <span className="font-semibold text-foreground">{myNickname}</span>
          님에게
          <br />
          육아 케어 리포트를 함께 확인하자고 초대했어요.
        </p>

        <p className="mt-6 text-[13px] leading-relaxed text-muted-light">
          수락하면 두 분의 검사 결과를 바탕으로
          <br />
          육아 케미를 분석해드려요.
        </p>

        <div className="mt-10 w-full max-w-[320px]">
          <button
            onClick={handleAccept}
            disabled={pending}
            className="h-[52px] w-full rounded-2xl bg-primary text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(212,115,92,0.25)] transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? (
              <Loader2 size={20} className="mx-auto animate-spin" />
            ) : (
              "수락하기"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
