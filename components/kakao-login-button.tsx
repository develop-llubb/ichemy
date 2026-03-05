"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        authorize: (options: {
          redirectUri: string;
          scope?: string;
          state?: string;
        }) => void;
        logout: (callback?: () => void) => void;
      };
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: { mobileWebUrl: string; webUrl: string };
          };
          buttons?: Array<{
            title: string;
            link: { mobileWebUrl: string; webUrl: string };
          }>;
        }) => void;
      };
    };
  }
}

export function KakaoLoginButton() {
  const [sdkLoaded, setSdkLoaded] = useState(
    typeof window !== "undefined" && !!window.Kakao,
  );

  useEffect(() => {
    if (window.Kakao) setSdkLoaded(true);
  }, []);

  const handleLogin = () => {
    if (!window.Kakao?.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!);
    }

    window.Kakao.Auth.authorize({
      redirectUri: `${window.location.origin}/auth/callback`,
      scope: "openid,account_email",
      state: "/home",
    });
  };

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />
      <button
        onClick={handleLogin}
        disabled={!sdkLoaded}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-[15px] font-semibold text-[#191919] shadow-[0_4px_16px_rgba(254,229,0,0.25)] transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9 0.6C4.029 0.6 0 3.713 0 7.55C0 9.947 1.558 12.055 3.931 13.335L2.933 16.803C2.845 17.108 3.199 17.35 3.465 17.169L7.565 14.455C8.036 14.49 8.515 14.5 9 14.5C13.971 14.5 18 11.387 18 7.55C18 3.713 13.971 0.6 9 0.6Z"
            fill="#191919"
          />
        </svg>
        카카오로 시작하기
      </button>
    </>
  );
}
