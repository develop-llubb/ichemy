"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { saveHasChildren, requestReport } from "./actions";
import { addChild } from "@/app/(protected)/home/children/actions";
import { createOrder } from "@/app/payment/actions";
import { JOURNEY_STEPS } from "@/lib/steps";
import { CouponTicket } from "@/components/coupon-ticket";
import { Camera, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ChildInfo {
  id: string;
  name: string;
  birth_date: string;
  photo_url: string | null;
}

interface ReportIntroClientProps {
  nickname: string;
  partnerNickname: string;
  coupleId: string;
  hasChildren: boolean | null;
  pcqScore: number;
  hasCoupon: boolean;
  lockedHasChildren?: boolean | null;
  children: ChildInfo[];
  childrenWithReport: string[];
}

export function ReportIntroClient({
  nickname,
  partnerNickname,
  coupleId,
  hasChildren: initialHasChildren,
  pcqScore,
  hasCoupon,
  lockedHasChildren = null,
  children,
  childrenWithReport,
}: ReportIntroClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [hasChildren, setHasChildren] = useState<boolean | null>(
    initialHasChildren,
  );
  const [saving, setSaving] = useState(false);
  const [requesting, startRequesting] = useTransition();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showChildForm, setShowChildForm] = useState(false);
  const [localChildren, setLocalChildren] = useState<ChildInfo[]>(children);
  const [childName, setChildName] = useState("");
  const [childBirthDate, setChildBirthDate] = useState("");
  const [childPhotoFile, setChildPhotoFile] = useState<File | null>(null);
  const [childPhotoPreview, setChildPhotoPreview] = useState<string | null>(null);
  const [addingChild, setAddingChild] = useState(false);

  const hasRegisteredChildren = localChildren.length > 0;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // 결제 실패/취소 시 toast 표시
  useEffect(() => {
    const code = searchParams.get("code");
    const message = searchParams.get("message");
    if (code) {
      const cancelCodes = [
        "PAY_PROCESS_CANCELED",
        "USER_CANCEL",
        "PAY_PROCESS_ABORTED",
      ];
      if (cancelCodes.includes(code)) {
        toast("결제가 취소되었습니다.");
      } else {
        toast(message || "결제에 실패했습니다.");
      }
      // URL에서 쿼리 파라미터 제거
      router.replace("/report", { scroll: false });
    }
  }, [searchParams, router]);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(18px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const handleSelect = useCallback(
    async (value: boolean) => {
      setHasChildren(value);
      setSaving(true);
      await saveHasChildren(coupleId, value);
      setSaving(false);
    },
    [coupleId],
  );

  // Step 3 완료 조건: 자녀 선택 또는 "아직 없어요" 선택
  const canProceed = hasRegisteredChildren
    ? selectedChildId !== null
    : hasChildren === false;
  const step3Done = canProceed;
  // 현재 활성 스텝
  const activeIdx = step3Done ? 3 : 2;

  const steps = JOURNEY_STEPS;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,115,92,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(212,115,92,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

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

        {/* Content */}
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
              👶
            </div>
          </div>

          {/* Heading */}
          <h1
            className="mt-6 text-center text-[22px] font-extrabold leading-[1.4] tracking-[-0.8px] text-foreground"
            style={ease(0.1)}
          >
            {nickname}님 & {partnerNickname}님의
            <br />
            육아 케어 리포트
          </h1>
          <p
            className="mt-2 text-center text-[13px] leading-[1.7] text-muted"
            style={ease(0.15)}
          >
            두 분의 검사 결과를 바탕으로
            <br />
            맞춤형 부부 육아 리포트를 생성해 드려요.
          </p>

          {/* PCQ Score preview */}
          <div
            className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-[#ECE8E3] bg-white px-5 py-2.5"
            style={ease(0.2)}
          >
            <span className="text-sm font-medium text-muted">
              부부 육아 케미 점수
            </span>
            <span className="text-lg font-extrabold text-primary">
              {Math.round(pcqScore)}점
            </span>
          </div>

          {/* Children question */}
          <div
            className="mt-7 w-full rounded-2xl border-[1.5px] border-[#ECE8E3] bg-white p-5"
            style={ease(0.25)}
          >
            <div className="mb-1.5 text-sm font-semibold text-foreground">
              현재 자녀가 있으신가요?
            </div>
            <p className="mb-4 text-xs leading-[1.5] text-[#9A918A]">
              자녀 유무에 따라 리포트 내용이 달라져요.
            </p>

            {/* 두 버튼 (자녀 없고 폼 안 열린 상태에서만) */}
            {!hasRegisteredChildren && !showChildForm && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setHasChildren(true);
                    setShowChildForm(true);
                  }}
                  disabled={lockedHasChildren !== null}
                  className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all duration-200"
                  style={{
                    borderColor: hasChildren === true ? "#D4735C" : "#ECE8E3",
                    background: hasChildren === true
                      ? "linear-gradient(160deg, #FFF6F2, #FFF0EB)"
                      : "#fff",
                    opacity: lockedHasChildren !== null && lockedHasChildren !== true ? 0.4 : 1,
                    cursor: lockedHasChildren !== null ? "default" : "pointer",
                  }}
                >
                  <span className="text-3xl">👶</span>
                  <span className="text-sm font-semibold" style={{ color: hasChildren === true ? "#D4735C" : "#6B6360" }}>
                    네, 있어요
                  </span>
                </button>

                <button
                  onClick={() => handleSelect(false)}
                  disabled={saving || lockedHasChildren !== null}
                  className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all duration-200"
                  style={{
                    borderColor: hasChildren === false ? "#D4735C" : "#ECE8E3",
                    background: hasChildren === false
                      ? "linear-gradient(160deg, #FFF6F2, #FFF0EB)"
                      : "#fff",
                    opacity: lockedHasChildren !== null && lockedHasChildren !== false ? 0.4 : 1,
                    cursor: lockedHasChildren !== null ? "default" : "pointer",
                  }}
                >
                  <span className="text-3xl">🤰</span>
                  <span className="text-sm font-semibold" style={{ color: hasChildren === false ? "#D4735C" : "#6B6360" }}>
                    아직 없어요
                  </span>
                </button>
              </div>
            )}

            {/* 등록된 자녀 목록 */}
            {hasRegisteredChildren && (
              <div className="flex flex-col gap-2.5">
                {localChildren.map((child) => {
                  const hasReport = childrenWithReport.includes(child.id);
                  const isSelected = selectedChildId === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        if (hasReport) {
                          router.push("/report/list");
                        } else {
                          setSelectedChildId(isSelected ? null : child.id);
                          setHasChildren(true);
                        }
                      }}
                      className="flex items-center gap-3.5 rounded-2xl border-2 px-4 py-3.5 transition-all duration-200"
                      style={{
                        borderColor: isSelected ? "#D4735C" : hasReport ? "#E8E2DC" : "#ECE8E3",
                        background: isSelected ? "linear-gradient(160deg, #FFF6F2, #FFF0EB)" : "#fff",
                        opacity: hasReport ? 0.6 : 1,
                      }}
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg"
                        style={{ background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)" }}
                      >
                        {child.photo_url ? (
                          <img src={child.photo_url} alt={child.name} className="h-full w-full object-cover" />
                        ) : "👶"}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold" style={{ color: isSelected ? "#D4735C" : "#3A3A3A" }}>
                          {child.name}
                        </div>
                        <div className="text-[11px] text-[#9A918A]">
                          {hasReport ? "리포트 보기 →" : child.birth_date}
                        </div>
                      </div>
                      {!hasReport && (
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all"
                          style={{
                            borderColor: isSelected ? "#D4735C" : "#D4CFC8",
                            background: isSelected ? "#D4735C" : "transparent",
                          }}
                        >
                          {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* 아이 추가 버튼 (폼 열기) */}
                {!showChildForm && (
                  <button
                    onClick={() => setShowChildForm(true)}
                    className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[#D4CFC8] text-[12px] font-medium text-[#9A918A] transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus size={14} /> 아이 추가하기
                  </button>
                )}
              </div>
            )}

            {/* 인라인 자녀 등록 폼 */}
            {showChildForm && (
              <div className="mt-4 rounded-xl border border-[#ECE8E3] bg-[#FEFCF9] p-4">
                <div className="mb-3 text-[13px] font-semibold text-foreground">
                  아이 정보 입력
                </div>

                {/* 사진 */}
                <div className="mb-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        setChildPhotoFile(file);
                        setChildPhotoPreview(URL.createObjectURL(file));
                      };
                      input.click();
                    }}
                    className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#D4CFC8] bg-[#F8F6F3] transition-colors hover:border-primary"
                  >
                    {childPhotoPreview ? (
                      <>
                        <img src={childPhotoPreview} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setChildPhotoPreview(null); setChildPhotoFile(null); }}
                          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#6B6360] text-white"
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <Camera size={16} className="text-[#B8A898]" />
                        <span className="text-[9px] text-[#B8A898]">선택</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* 이름 */}
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="아이 이름"
                  className="mb-2 h-10 w-full rounded-xl border-[1.5px] border-[#ECE8E3] bg-white px-3 text-sm text-foreground outline-none placeholder:text-[#C4BEB8] focus:border-primary"
                />

                {/* 생년월일 */}
                <input
                  type="date"
                  value={childBirthDate}
                  onChange={(e) => setChildBirthDate(e.target.value)}
                  className="mb-3 h-10 w-full rounded-xl border-[1.5px] border-[#ECE8E3] bg-white px-3 text-sm text-foreground outline-none focus:border-primary"
                />

                {/* 버튼 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChildForm(false);
                      setChildName("");
                      setChildBirthDate("");
                      setChildPhotoFile(null);
                      setChildPhotoPreview(null);
                      if (!hasRegisteredChildren) {
                        setHasChildren(null);
                      }
                    }}
                    className="flex h-10 flex-1 items-center justify-center rounded-xl border-[1.5px] border-[#ECE8E3] text-[12px] font-semibold text-[#6B6360]"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    disabled={!childName.trim() || !childBirthDate || addingChild}
                    onClick={async () => {
                      setAddingChild(true);
                      try {
                        let photoUrl: string | undefined;
                        if (childPhotoFile) {
                          const supabase = createClient();
                          const ext = childPhotoFile.name.split(".").pop() ?? "jpg";
                          const path = `children/${coupleId}/${crypto.randomUUID()}.${ext}`;
                          const { error } = await supabase.storage.from("images").upload(path, childPhotoFile, { contentType: childPhotoFile.type });
                          if (!error) {
                            const { data } = supabase.storage.from("images").getPublicUrl(path);
                            photoUrl = data.publicUrl;
                          }
                        }
                        const result = await addChild(coupleId, {
                          name: childName.trim(),
                          birthDate: childBirthDate,
                          photoUrl,
                        });
                        setLocalChildren((prev) => [
                          ...prev,
                          { id: result.id, name: childName.trim(), birth_date: childBirthDate, photo_url: photoUrl ?? null },
                        ]);
                        setSelectedChildId(result.id);
                        setShowChildForm(false);
                        setChildName("");
                        setChildBirthDate("");
                        setChildPhotoFile(null);
                        setChildPhotoPreview(null);
                        toast("아이가 등록되었어요!");
                      } finally {
                        setAddingChild(false);
                      }
                    }}
                    className="flex h-10 flex-1 items-center justify-center rounded-xl border-none text-[12px] font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: childName.trim() && childBirthDate
                        ? "linear-gradient(135deg, #D4735C, #C0614A)"
                        : "#D4CFC8",
                    }}
                  >
                    {addingChild ? <Loader2 size={14} className="animate-spin" /> : "등록하기"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Journey tracker */}
          <div
            className="mt-7 w-full rounded-[20px] border border-black/[0.03] bg-white p-[22px_20px]"
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

          {hasCoupon ? (
            <div className="mt-7 mb-6 w-full" style={ease(0.38)}>
              <CouponTicket
                title="무료 쿠폰 적용 완료!"
                description="결제 없이 바로 리포트를 받을 수 있어요"
              />
            </div>
          ) : (
            /* Baby fair promo */
            <div
              className="relative mt-7 mb-6 w-full overflow-hidden rounded-[18px] p-[22px_20px] text-white"
              style={{
                background: "linear-gradient(160deg, #D4735C, #C0614A)",
                ...ease(0.38),
              }}
            >
              <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/[0.08]" />
              <div className="pointer-events-none absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-white/[0.06]" />
              <div className="relative z-10">
                {/* <div className="inline-block rounded-lg bg-white px-2.5 py-1.5"> */}
                <Image
                  src="/befe-logo.png"
                  alt="BeFe"
                  width={56}
                  height={24}
                  className="h-5 w-auto"
                />
                {/* </div> */}
                <div className="mt-3 mb-2.5 text-base font-extrabold leading-[1.5] tracking-[-0.3px]">
                  BeFe 베이비페어에서
                  <br />
                  QR 스캔하면 무료!
                </div>
                <p className="text-xs leading-[1.7] opacity-85">
                  BeFe 베이비페어 케미스트리 부스에서 QR을 스캔하시면 육아 케어
                  리포트를 무료로 받으실 수 있어요.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div
          className="sticky bottom-0 border-t border-black/[0.03] bg-background/95 px-5 py-4 backdrop-blur-sm"
          style={ease(0.4)}
        >
          <button
            disabled={!canProceed || requesting}
            onClick={() => {
              const reportHasChildren = hasRegisteredChildren ? true : hasChildren!;
              const childId = selectedChildId ?? undefined;

              if (hasCoupon) {
                // 쿠폰 사용자: 바로 리포트 생성
                startRequesting(async () => {
                  const result = await requestReport(coupleId, reportHasChildren, childId);
                  if ("error" in result) {
                    toast(result.error);
                    return;
                  }
                  router.replace(`/report/${result.reportId}`);
                });
              } else {
                // 결제 사용자: 토스 결제창 띄우기
                startRequesting(async () => {
                  try {
                    const order = await createOrder(coupleId, reportHasChildren);
                    const tossPayments = await loadTossPayments(
                      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!,
                    );
                    const payment = tossPayments.payment({
                      customerKey: coupleId,
                    });
                    await payment.requestPayment({
                      method: "CARD",
                      amount: { currency: "KRW", value: order.amount },
                      orderId: order.order_id,
                      orderName: "육아 케어 리포트",
                      successUrl: `${window.location.origin}/payment/success`,
                      failUrl: `${window.location.origin}/report`,
                    });
                  } catch (e: unknown) {
                    const error = e as { code?: string; message?: string };
                    if (error.code === "USER_CANCEL") {
                      toast("결제가 취소되었습니다.");
                      return;
                    }
                    toast(error.message || "결제 중 오류가 발생했습니다.");
                  }
                });
              }
            }}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl border-none text-base font-bold text-white transition-all duration-200"
            style={{
              background: canProceed
                ? "linear-gradient(135deg, #D4735C, #C0614A)"
                : "#D4CFC8",
              boxShadow: canProceed
                ? "0 4px 16px rgba(212,115,92,0.25)"
                : "none",
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
          >
            {requesting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : hasCoupon ? (
              "리포트 받기"
            ) : (
              "19,000원 결제하고 리포트 받기"
            )}
          </button>
          <p className="mt-2.5 text-center text-[11px] text-[#B8A898]">
            AI가 두 분의 데이터를 분석하여 맞춤 리포트를 생성합니다
          </p>
        </div>
      </div>
    </>
  );
}
