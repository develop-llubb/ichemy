"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PartnerCreditFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-lg font-semibold">결제에 실패했습니다</h2>
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
      {code && (
        <p className="text-xs text-muted-foreground">오류 코드: {code}</p>
      )}
      <Button asChild>
        <Link href="/partners/credits">돌아가기</Link>
      </Button>
    </div>
  );
}
