"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  token_failed: "로그인 요청이 너무 많아요. 잠시 후 다시 시도해주세요.",
  auth_failed: "로그인에 실패했어요. 다시 시도해주세요.",
};

export function AuthErrorToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error && ERROR_MESSAGES[error]) {
      toast(ERROR_MESSAGES[error]);
      router.replace("/", { scroll: false });
    }
  }, [error, router]);

  return null;
}
