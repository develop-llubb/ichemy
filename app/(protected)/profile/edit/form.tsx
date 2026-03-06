"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { editProfile, type EditProfileState } from "./action";

export function EditProfileForm({
  currentNickname,
  currentRole,
}: {
  currentNickname: string;
  currentRole: "mom" | "dad";
}) {
  const router = useRouter();
  const [role, setRole] = useState<"mom" | "dad">(currentRole);

  const [state, formAction, pending] = useActionState<
    EditProfileState,
    FormData
  >(editProfile, {});

  return (
    <form action={formAction} className="space-y-6">
      {/* 역할 선택 */}
      <div>
        <p className="text-sm font-medium text-foreground">역할</p>
        <div className="mt-2 flex gap-3">
          <input type="hidden" name="role" value={role} />
          <button
            type="button"
            onClick={() => setRole("mom")}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border py-4 text-sm font-medium transition-colors ${
              role === "mom"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-white text-muted"
            }`}
          >
            <span className="text-3xl">👧</span>
            엄마
          </button>
          <button
            type="button"
            onClick={() => setRole("dad")}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border py-4 text-sm font-medium transition-colors ${
              role === "dad"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-white text-muted"
            }`}
          >
            <span className="text-3xl">👨</span>
            아빠
          </button>
        </div>
      </div>

      {/* 닉네임 */}
      <div>
        <label
          htmlFor="nickname"
          className="text-sm font-medium text-foreground"
        >
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={10}
          defaultValue={currentNickname}
          placeholder="예: 다은맘"
          className="mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none placeholder:text-muted-light focus:border-primary"
        />
      </div>

      {/* 에러 메시지 */}
      {state.error && (
        <p className="text-center text-sm text-red-500">{state.error}</p>
      )}

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-12 flex-1 rounded-xl border border-border bg-white text-sm font-medium text-muted transition-transform active:scale-[0.98]"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-12 flex-1 rounded-xl bg-primary text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {pending ? (
            <Loader2 size={20} className="mx-auto animate-spin" />
          ) : (
            "저장"
          )}
        </button>
      </div>
    </form>
  );
}
