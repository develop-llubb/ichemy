"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "nextjs-toploader/app";
import Script from "next/script";
import { ChevronLeft } from "lucide-react";

export function InviteClient({
  profileId,
  nickname,
}: {
  profileId: string;
  nickname: string;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(
    typeof window !== "undefined" && !!window.Kakao,
  );

  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    setInviteUrl(`${window.location.origin}/invite/${profileId}`);
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, [profileId]);

  // 배우자가 초대를 수락했는지 폴링
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/couple/status");
        const data = await res.json();
        if (data.coupled) {
          clearInterval(interval);
          if (data.hasScores) {
            router.push("/report?from=/home");
          } else {
            router.push("/home/waiting");
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(18px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [inviteUrl]);

  const handleKakaoShare = useCallback(() => {
    if (!window.Kakao?.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!);
    }
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${nickname}님이 육아 케미 검사에 초대했어요`,
        description: "우리 부부 육아 점수, 몇 점일까? 3분이면 끝!",
        imageUrl: `${window.location.origin}/og/invite?name=${encodeURIComponent(nickname)}&v=${Date.now()}`,
        link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
      },
      buttons: [
        {
          title: "검사 시작하기",
          link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
        },
      ],
    });
  }, [inviteUrl]);

  const steps = [
    { num: "1", title: "내 검사 완료", desc: null },
    { num: "2", title: "배우자가 링크를 통해 가입 & 검사 완료", desc: null },
    {
      num: "3",
      title: "리포트 유형 선택 및 결제",
      desc: "아이 유무에 따라 리포트 유형을 선택하고 결제를 진행해요.",
    },
    {
      num: "4",
      title: "리포트 확인 & PDF 다운로드",
      desc: "웹에서 바로 확인하고, PDF로 저장할 수도 있어요.",
    },
  ];
  const activeIdx = 1;

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,115,92,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(212,115,92,0); }
        }
      `}</style>

      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />

      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        {/* ── Header (sticky, chevron back) ── */}
        <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
          <button
            onClick={() => router.back()}
            className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <span className="text-center text-[15px] font-semibold text-foreground">
            배우자 초대
          </span>
          <div />
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-5">
          {/* Illustration */}
          <div
            className="mt-8 flex justify-center"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "scale(1)" : "scale(0.85)",
              transition: "all 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s",
            }}
          >
            <div
              className="flex h-[110px] w-[110px] items-center justify-center rounded-full text-5xl"
              style={{
                background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
                boxShadow: "0 8px 24px rgba(212,115,92,0.08)",
                animation: ready ? "float 3s ease-in-out infinite" : "none",
              }}
            >
              💌
            </div>
          </div>

          <h1
            className="mt-6 text-center text-[22px] font-extrabold leading-[1.4] tracking-[-0.8px] text-foreground"
            style={ease(0.1)}
          >
            배우자에게
            <br />
            초대 링크를 보내주세요
          </h1>
          <p
            className="mt-2 text-center text-[13px] leading-[1.7] text-muted"
            style={ease(0.15)}
          >
            배우자도 검사를 완료하면
            <br />
            부부 육아 케어 리포트가 생성돼요.
          </p>

          {/* Invite link box */}
          <div
            className="mt-7 w-full rounded-2xl border-[1.5px] border-[#ECE8E3] bg-white p-4"
            style={ease(0.2)}
          >
            <div className="mb-2 text-[11px] font-semibold text-muted">
              초대 링크
            </div>
            <div className="break-all rounded-[10px] bg-[#F8F6F3] px-3.5 py-3 font-mono text-xs leading-[1.5] text-[#6B6360]">
              {inviteUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`mt-2.5 h-[42px] w-full cursor-pointer rounded-xl border-[1.5px] border-[#ECE8E3] text-[13px] font-semibold transition-all duration-200 ${
                copied
                  ? "bg-[#F0F7F0] text-[#7BA872]"
                  : "bg-white text-[#6B6360]"
              }`}
            >
              {copied ? "✓ 복사됨" : "링크 복사하기"}
            </button>
            <button
              onClick={handleKakaoShare}
              disabled={!sdkLoaded}
              className="mt-2.5 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[#FEE500] text-[13px] font-semibold text-[#191919] disabled:opacity-50"
              style={{ boxShadow: "0 4px 16px rgba(254,229,0,0.25)" }}
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 0.6C4.029 0.6 0 3.713 0 7.55C0 9.947 1.558 12.055 3.931 13.335L2.933 16.803C2.845 17.108 3.199 17.35 3.465 17.169L7.565 14.455C8.036 14.49 8.515 14.5 9 14.5C13.971 14.5 18 11.387 18 7.55C18 3.713 13.971 0.6 9 0.6Z"
                  fill="#191919"
                />
              </svg>
              카카오톡으로 초대하기
            </button>
          </div>

          {/* Journey tracker */}
          <div
            className="mt-7 mb-5 w-full rounded-[20px] border border-black/[0.03] bg-white p-[22px_20px]"
            style={ease(0.3)}
          >
            <div className="mb-4 text-sm font-medium text-foreground">
              앞으로 이렇게 진행돼요
            </div>
            {steps.map((step, i) => {
              const isDone = i < activeIdx;
              const isActive = i === activeIdx;
              const isLast = i === steps.length - 1;
              return (
                <div key={i} className="flex gap-3.5">
                  {/* Left: dot + line */}
                  <div className="flex shrink-0 flex-col items-center">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300"
                      style={{
                        background: isDone
                          ? "linear-gradient(135deg, #D4735C, #C0614A)"
                          : isActive
                            ? "#fff"
                            : "#F0EDE9",
                        border: isActive
                          ? "2.5px solid #D4735C"
                          : isDone
                            ? "none"
                            : "2px solid #E8E2DC",
                        color: isDone
                          ? "#fff"
                          : isActive
                            ? "#D4735C"
                            : "#B8A898",
                        animation: isActive
                          ? "pulse 2s ease-in-out infinite"
                          : "none",
                      }}
                    >
                      {isDone ? "✓" : step.num}
                    </div>
                    {!isLast && (
                      <div
                        className="mt-1 w-[1.5px] flex-1 transition-colors duration-300"
                        style={{
                          minHeight: 20,
                          background: isDone ? "#D4735C" : "#ECE8E3",
                        }}
                      />
                    )}
                  </div>
                  {/* Right: content */}
                  <div
                    className="flex-1 pt-[3px]"
                    style={{ paddingBottom: isLast ? 0 : 20 }}
                  >
                    <div
                      className="text-sm leading-[1.5] transition-all duration-300"
                      style={{
                        fontWeight: isDone || isActive ? 600 : 400,
                        color: isDone
                          ? "#3A3A3A"
                          : isActive
                            ? "#D4735C"
                            : "#B8A898",
                      }}
                    >
                      {step.title}
                    </div>
                    {step.desc && (isActive || isDone) && (
                      <div className="mt-1 text-xs leading-[1.5] text-[#9A918A]">
                        {step.desc}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Baby fair promo */}
          <div
            className="relative mb-6 w-full overflow-hidden rounded-[18px] p-[22px_20px] text-white"
            style={{
              background: "linear-gradient(160deg, #D4735C, #C0614A)",
              ...ease(0.38),
            }}
          >
            <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/[0.08]" />
            <div className="pointer-events-none absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-white/[0.06]" />
            <div className="relative z-10">
              <div className="mb-3 inline-block rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-bold">
                🎪 베이비페어 특별 혜택
              </div>
              <div className="mb-2.5 text-base font-extrabold leading-[1.5] tracking-[-0.3px]">
                현장 QR 스캔하면
                <br />
                리포트 무료!
              </div>
              <p className="text-xs leading-[1.7] opacity-85">
                육아 케어 리포트는 유료 서비스이지만, 베이비페어 케미스트리
                부스에서 QR을 스캔하시면 무료로 확인하실 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
