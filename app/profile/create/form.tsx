"use client";

import { useActionState, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { createProfile, type CreateProfileState } from "./action";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  TermsContent,
  PrivacyContent,
  ThirdPartyContent,
} from "@/components/legal-content";

const legalStyles =
  "space-y-4 text-[13px] leading-relaxed text-muted [&_h2]:mt-6 [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5";

type DrawerType = "terms" | "privacy" | "thirdParty" | null;

const drawerConfig = {
  terms: { title: "서비스 이용약관", Content: TermsContent },
  privacy: { title: "개인정보 수집·이용", Content: PrivacyContent },
  thirdParty: { title: "개인정보 제3자 제공 동의", Content: ThirdPartyContent },
};

export function ProfileCreateForm() {
  const [role, setRole] = useState<"mom" | "dad" | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [thirdPartyAgreed, setThirdPartyAgreed] = useState(false);
  const [openDrawer, setOpenDrawer] = useState<DrawerType>(null);

  const allRequired = termsAgreed && privacyAgreed;
  const allChecked = allRequired && thirdPartyAgreed;
  const canSubmit = role && allRequired;

  const [state, formAction, pending] = useActionState<
    CreateProfileState,
    FormData
  >(createProfile, {});

  const toggleAll = (checked: boolean) => {
    setTermsAgreed(checked);
    setPrivacyAgreed(checked);
    setThirdPartyAgreed(checked);
  };

  const config = openDrawer ? drawerConfig[openDrawer] : null;

  return (
    <>
      <form action={formAction} className="mt-8 space-y-6">
        {/* 역할 선택 */}
        <div>
          <p className="text-sm font-medium text-foreground">역할</p>
          <div className="mt-2 flex gap-3">
            <input type="hidden" name="role" value={role ?? ""} />
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
            placeholder="예: 다은맘"
            className="mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none placeholder:text-muted-light focus:border-primary"
          />
        </div>

        {/* 약관 동의 */}
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {/* 전체 동의 */}
          <label className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
              className="h-5 w-5 rounded border-border accent-primary"
            />
            <span className="text-sm font-semibold text-foreground">
              전체 동의
            </span>
          </label>

          <div className="px-4 py-1">
            {/* 이용약관 */}
            <div className="flex items-center justify-between py-2.5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span className="text-[13px] text-muted">
                  <span className="text-primary">[필수]</span> 서비스 이용약관
                </span>
              </label>
              <button
                type="button"
                onClick={() => setOpenDrawer("terms")}
                className="text-muted-light"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 개인정보 수집·이용 */}
            <div className="flex items-center justify-between py-2.5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span className="text-[13px] text-muted">
                  <span className="text-primary">[필수]</span> 개인정보
                  수집·이용
                </span>
              </label>
              <button
                type="button"
                onClick={() => setOpenDrawer("privacy")}
                className="text-muted-light"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 제3자 제공 */}
            <div className="flex items-start justify-between py-2.5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="third_party_agreed"
                  value="true"
                  checked={thirdPartyAgreed}
                  onChange={(e) => setThirdPartyAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                />
                <span className="text-[13px] leading-relaxed text-muted">
                  <span className="text-muted-light">[선택]</span> 개인정보
                  제3자 제공
                  <br />
                  <span className="text-[11px] text-muted-light">
                    제휴 보험사·육아 기업에 심리검사 결과를 제공합니다
                  </span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => setOpenDrawer("thirdParty")}
                className="mt-0.5 text-muted-light"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {state.error && (
          <p className="text-center text-sm text-red-500">{state.error}</p>
        )}

        {/* 제출 */}
        <button
          type="submit"
          disabled={!canSubmit || pending}
          className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {pending ? (
            <Loader2 size={20} className="mx-auto animate-spin" />
          ) : (
            "시작하기"
          )}
        </button>
      </form>

      {/* 약관 Drawer */}
      <Drawer
        open={openDrawer !== null}
        onOpenChange={(open) => {
          if (!open) setOpenDrawer(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{config?.title}</DrawerTitle>
          </DrawerHeader>
          <div className={`overflow-y-auto px-5 pb-8 ${legalStyles}`}>
            {config && <config.Content />}
          </div>
          <DrawerClose className="sr-only">닫기</DrawerClose>
        </DrawerContent>
      </Drawer>
    </>
  );
}
