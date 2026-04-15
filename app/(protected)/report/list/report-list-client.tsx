"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import type { ReportType } from "@/lib/care-report";

const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  no_child: "예비 부모",
  infant: "영아기",
  toddler: "유아기",
  elementary: "초등학생",
  middle_school: "중학생",
};

const REPORT_TYPE_COLOR: Record<ReportType, { bg: string; text: string }> = {
  no_child: { bg: "#F0F7EE", text: "#7BA872" },
  infant: { bg: "#FFF0EB", text: "#D4735C" },
  toddler: { bg: "#FFF0EB", text: "#D4735C" },
  elementary: { bg: "#EEF4FB", text: "#5B9BD5" },
  middle_school: { bg: "#F3EFF9", text: "#8B72BE" },
};

function formatChildAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 1) return "신생아";
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months / 12);
  return `만 ${years}세`;
}

interface Report {
  id: string;
  report_type: ReportType;
  child_id: string | null;
  child_name: string | null;
  child_gender: string | null;
  child_birth_date: string | null;
  child_age: number | null;
  status: "generating" | "completed" | "failed";
  created_at: string;
  childPhotoUrl: string | null;
  criterionComplete: boolean;
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
  reports: initialReports,
}: ReportListClientProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [reports, setReports] = useState(initialReports);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // generating 상태인 리포트 폴링
  useEffect(() => {
    const generatingIds = reports
      .filter((r) => r.status === "generating")
      .map((r) => r.id);

    if (generatingIds.length === 0) return;

    const interval = setInterval(async () => {
      let updated = false;
      const next = [...reports];

      for (const id of generatingIds) {
        try {
          const res = await fetch(`/api/report/${id}/status`);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.status === "generating") continue;

          const idx = next.findIndex((r) => r.id === id);
          if (idx !== -1) {
            next[idx] = { ...next[idx], status: data.status };
            updated = true;
          }
        } catch { /* ignore */ }
      }

      if (updated) setReports(next);
    }, 3000);

    return () => clearInterval(interval);
  }, [reports]);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

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
          {/* 우리 아이 관리 */}
          <button
            onClick={() => router.push("/home/children")}
            className="flex w-full items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left transition-all duration-150 active:scale-[0.98]"
            style={{ border: "1px solid #EEEAE6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]"
              style={{ background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)" }}
            >
              👶
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-foreground">
                우리 아이 관리
              </div>
              <div className="mt-0.5 text-[11px] text-[#9A918A]">
                아이를 추가하거나 수정할 수 있어요
              </div>
            </div>
            <ChevronRight size={16} className="text-[#D4CFC8]" />
          </button>

          {reports.map((report) => {
            const isCompleted = report.status === "completed";
            const isGenerating = report.status === "generating";
            const typeColor = REPORT_TYPE_COLOR[report.report_type];
            const hasChild = report.report_type !== "no_child";

            return (
              <button
                key={report.id}
                onClick={() => router.push(
                  report.criterionComplete
                    ? `/report/${report.id}`
                    : `/report/${report.id}/criterion`
                )}
                className="group flex w-full items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left transition-all duration-150 active:scale-[0.98]"
                style={{
                  border: "1px solid #EEEAE6",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Icon / Photo */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[22px]"
                  style={{
                    background: hasChild
                      ? "linear-gradient(145deg, #FFE8D6, #FFF0E6)"
                      : "linear-gradient(145deg, #E8F0E6, #F0F7EE)",
                  }}
                >
                  {report.childPhotoUrl ? (
                    <img src={report.childPhotoUrl} alt={report.child_name ?? ""} className="h-full w-full object-cover" />
                  ) : hasChild ? (
                    <Image src="/baby.png" alt="아기" width={28} height={28} className="h-7 w-7 object-contain" />
                  ) : (
                    "\uD83E\uDD30"
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-semibold text-foreground">
                      {report.report_type === "no_child"
                        ? "예비 부모 육아 케어 리포트"
                        : report.child_name
                          ? `${report.child_name}의 육아 케어 리포트`
                          : "자녀 양육 케어 리포트"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {/* Report type + age */}
                    {report.child_name && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: typeColor.bg, color: typeColor.text }}
                      >
                        {report.child_gender === "girl" ? "♀" : "♂"}{" "}
                        {REPORT_TYPE_LABEL[report.report_type]}
                        {report.child_birth_date && ` (${formatChildAge(report.child_birth_date)})`}
                      </span>
                    )}
                    {/* Status */}
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block h-[5px] w-[5px] rounded-full"
                        style={{
                          background: isCompleted
                            ? "#7BA872"
                            : isGenerating
                              ? "#D4A74A"
                              : "#D4735C",
                        }}
                      />
                      <span className="text-[11px] text-muted">
                        {isCompleted
                          ? "완성됨"
                          : isGenerating
                            ? "생성 중..."
                            : "생성 실패"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Arrow / Spinner */}
                {isGenerating ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-[1.5px] border-[#D4CFC8] border-t-primary" />
                ) : (
                  <ChevronRight size={18} className="text-[#D4CFC8]" />
                )}
              </button>
            );
          })}
        </div>

        {/* New report button */}
        <div className="mt-4 mb-8" style={ease(0.2)}>
          <button
            onClick={() => router.push("/report?from=/report/list")}
            className="flex w-full items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-primary/25 px-5 py-4 text-left transition-all duration-150 active:scale-[0.98]"
            style={{
              background: "linear-gradient(160deg, #FFFBF9, #FFF6F2)",
            }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary"
              style={{
                background: "linear-gradient(145deg, #FFF0EB, #FFE8D6)",
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-primary">
                새 리포트 만들기
              </div>
              <div className="mt-0.5 text-xs text-muted">
                다른 유형의 리포트를 만들어 보세요
              </div>
            </div>
            <ChevronRight size={18} className="text-primary/40" />
          </button>
        </div>
      </div>
    </div>
  );
}
