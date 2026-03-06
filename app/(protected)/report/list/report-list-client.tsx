"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Report {
  id: string;
  has_children: boolean;
  status: "generating" | "completed" | "failed";
  created_at: string;
}

interface ReportListClientProps {
  nickname: string;
  partnerNickname: string;
  coupleId: string;
  reports: Report[];
}

export function ReportListClient({
  nickname,
  partnerNickname,
  coupleId,
  reports,
}: ReportListClientProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const hasWithChildren = reports.some((r) => r.has_children);
  const hasWithoutChildren = reports.some((r) => !r.has_children);
  const canCreateAnother = !hasWithChildren || !hasWithoutChildren;
  const missingType = !hasWithChildren ? true : false;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.push("/home")}
          className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <span className="text-center text-[15px] font-semibold text-foreground">
          육아 케어 리포트
        </span>
        <div />
      </div>

      <div className="flex-1 px-5">
        {/* Couple info */}
        <div
          className="mt-8 flex items-center justify-center gap-3"
          style={ease(0)}
        >
          <div
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-[22px]"
            style={{
              background: "linear-gradient(135deg, #FFE8D6, #FFF0E6)",
              boxShadow: "0 4px 12px rgba(212,115,92,0.1)",
            }}
          >
            {"\uD83D\uDC69"}
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #FFF0EB, #FFE8D6)",
              color: "#D4735C",
            }}
          >
            &
          </div>
          <div
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-[22px]"
            style={{
              background: "linear-gradient(135deg, #D6E8FF, #E6F0FF)",
              boxShadow: "0 4px 12px rgba(91,155,213,0.1)",
            }}
          >
            {"\uD83D\uDC68"}
          </div>
        </div>

        <h1
          className="mt-4 text-center text-[20px] font-extrabold tracking-[-0.5px] text-foreground"
          style={ease(0.05)}
        >
          {nickname}님 & {partnerNickname}님
        </h1>
        <p
          className="mt-1.5 text-center text-[13px] text-muted"
          style={ease(0.1)}
        >
          육아 케어 리포트 목록
        </p>

        {/* Report cards */}
        <div className="mt-8 flex flex-col gap-3" style={ease(0.15)}>
          {reports.map((report) => {
            const isCompleted = report.status === "completed";
            const isGenerating = report.status === "generating";
            return (
              <button
                key={report.id}
                onClick={() => router.push(`/report/${report.id}`)}
                className="group flex w-full items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left transition-all duration-150 active:scale-[0.98]"
                style={{
                  border: "1px solid #EEEAE6",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]"
                  style={{
                    background: report.has_children
                      ? "linear-gradient(145deg, #FFE8D6, #FFF0E6)"
                      : "linear-gradient(145deg, #E8F0E6, #F0F7EE)",
                  }}
                >
                  {report.has_children ? "\uD83D\uDC76" : "\uD83E\uDD30"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-foreground">
                    {report.has_children ? "자녀 양육 케어 리포트" : "예비 부모 육아 케어 리포트"}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className="inline-block h-[6px] w-[6px] rounded-full"
                      style={{
                        background: isCompleted
                          ? "#7BA872"
                          : isGenerating
                            ? "#D4A74A"
                            : "#D4735C",
                      }}
                    />
                    <span className="text-xs text-muted">
                      {isCompleted
                        ? "완성됨"
                        : isGenerating
                          ? "생성 중..."
                          : "생성 실패"}
                    </span>
                  </div>
                </div>
                {isGenerating ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-[1.5px] border-[#D4CFC8] border-t-primary" />
                ) : (
                  <ChevronRight size={18} className="text-[#D4CFC8]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Create another report button */}
        {canCreateAnother && (
          <div className="mt-4" style={ease(0.2)}>
            <button
              onClick={() =>
                router.push(`/report?type=${missingType ? "with" : "without"}`)
              }
              className="flex w-full items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-primary/25 px-5 py-4 text-left transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "linear-gradient(160deg, #FFFBF9, #FFF6F2)",
              }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-primary"
                style={{
                  background: "linear-gradient(145deg, #FFF0EB, #FFE8D6)",
                }}
              >
                +
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-primary">
                  {missingType
                    ? "자녀 양육 버전 만들기"
                    : "예비 부모 버전 만들기"}
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  다른 버전의 리포트도 만들어 보세요
                </div>
              </div>
              <ChevronRight size={18} className="text-primary/40" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
