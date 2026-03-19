"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { ChevronLeft } from "lucide-react";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";

const CANCEL_CODES = ["PAY_PROCESS_CANCELED", "USER_CANCEL", "PAY_PROCESS_ABORTED"];

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") || "UNKNOWN";
  const message = searchParams.get("message") || "결제에 실패했습니다.";

  useEffect(() => {
    if (CANCEL_CODES.includes(code)) {
      toast("결제가 취소되었습니다.");
      router.back();
    }
  }, [code, router]);

  // 취소인 경우 빈 화면 (바로 뒤로 가므로)
  if (CANCEL_CODES.includes(code)) return null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <span className="text-center text-[15px] font-semibold text-foreground">
          결제 실패
        </span>
        <div />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="text-5xl">😢</div>
        <h2 className="mt-4 text-lg font-bold text-foreground">
          결제에 실패했어요
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          {message}
        </p>
        <p className="mt-1 text-xs text-[#C4BEB8]">
          오류 코드: {code}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-8 flex h-12 w-full max-w-[280px] cursor-pointer items-center justify-center rounded-2xl border-none text-sm font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #D4735C, #C0614A)",
          }}
        >
          다시 시도하기
        </button>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense>
      <FailContent />
    </Suspense>
  );
}
