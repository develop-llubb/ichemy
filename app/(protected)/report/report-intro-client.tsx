"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveHasChildren, requestReport } from "./actions";
import { addChild, updateChild, getUploadUrl } from "@/app/(protected)/home/children/actions";
import type { ReportType } from "@/lib/care-report";
import { JOURNEY_STEPS } from "@/lib/steps";
import { CouponTicket } from "@/components/coupon-ticket";
import { Camera, X, Plus, Pencil } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";


interface ChildInfo {
  id: string;
  name: string;
  gender: string;
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
  heartBalance: number;
  lockedHasChildren?: boolean | null;
  children: ChildInfo[];
  childReportKeys: string[];
  hasNoChildReport: boolean;
}

const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  no_child: "예비 부모",
  infant: "영아기 (출생~만2세)",
  toddler: "유아기 (만2세~만6세)",
  elementary: "초등학생",
  middle_school: "중학생",
};

function getReportTypeFromBirthDate(birthDate: string): ReportType {
  const birth = new Date(birthDate);
  const now = new Date();
  let ageYears = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    ageYears--;
  }
  if (ageYears < 2) return "infant";
  if (ageYears < 6) return "toddler";
  if (ageYears < 13) return "elementary";
  return "middle_school";
}

export function ReportIntroClient({
  nickname,
  partnerNickname,
  coupleId,
  hasChildren: initialHasChildren,
  pcqScore,
  hasCoupon,
  heartBalance,
  lockedHasChildren = null,
  children,
  childReportKeys,
  hasNoChildReport,
}: ReportIntroClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [hasChildren, setHasChildren] = useState<boolean | null>(
    children.length > 0 ? initialHasChildren : null,
  );
  const [saving, setSaving] = useState(false);
  const [requesting, startRequesting] = useTransition();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [preparingNewChild, setPreparingNewChild] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [localChildren, setLocalChildren] = useState<ChildInfo[]>(children);
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState("");
  const [childBirthDate, setChildBirthDate] = useState("");
  const [childPhotoFile, setChildPhotoFile] = useState<File | null>(null);
  const [childPhotoPreview, setChildPhotoPreview] = useState<string | null>(null);
  const [addingChild, setAddingChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);

  const hasRegisteredChildren = localChildren.length > 0;

  const resetForm = () => {
    setEditingChildId(null);
    setChildName("");
    setChildGender("");
    setChildBirthDate("");
    setChildPhotoFile(null);
    setChildPhotoPreview(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowChildForm(true);
  };

  const openEditForm = (child: ChildInfo) => {
    setEditingChildId(child.id);
    setChildName(child.name);
    setChildGender(child.gender);
    setChildBirthDate(child.birth_date);
    setChildPhotoPreview(child.photo_url);
    setChildPhotoFile(null);
    setShowChildForm(true);
  };

  const backPath = searchParams.get("from") || "/home";

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

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

  // Step 3 완료 조건: 자녀 선택 또는 "새 아이 준비 중" 선택
  const canProceed = selectedChildId !== null || preparingNewChild;
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
        <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_auto] items-center gap-2 border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
          <button
            onClick={() => router.push(backPath)}
            className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <span className="text-center text-[15px] font-semibold text-foreground">
            육아 케어 리포트
          </span>
          {hasCoupon ? (
            <div />
          ) : (
            <button
              onClick={() => router.push("/shop")}
              className="flex h-8 cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-[#ECE8E3] bg-white px-2.5 text-[12px] font-semibold text-primary transition-colors hover:border-primary"
              aria-label="하트 상점"
            >
              <span className="text-[13px] leading-none">♥️</span>
              <span>{heartBalance}</span>
            </button>
          )}
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
            두 분의 검사 결과와 자녀의 나이에 맞는
            <br />
            맞춤형 육아 케어 리포트를 생성해 드려요.
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

          {/* Children selection */}
          <div
            className="mt-7 w-full rounded-2xl border-[1.5px] border-[#ECE8E3] bg-white p-5"
            style={ease(0.25)}
          >
            <div className="mb-1.5 text-sm font-semibold text-foreground">
              리포트를 받을 아이를 선택해주세요
            </div>
            <p className="mb-4 text-xs leading-[1.5] text-[#9A918A]">
              자녀의 나이에 따라 맞춤 리포트가 생성돼요.
            </p>

            <div className="flex flex-col gap-2.5">
                {localChildren.map((child) => {
                  const childReportType = getReportTypeFromBirthDate(child.birth_date);
                  const hasReport = childReportKeys.includes(`${child.id}:${childReportType}`);
                  const isSelected = selectedChildId === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        if (hasReport) {
                          router.push("/report/list");
                        } else {
                          setSelectedChildId(isSelected ? null : child.id);
                          setPreparingNewChild(false);
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
                        ) : child.gender === "girl" ? "👧" : "👦"}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: isSelected ? "#D4735C" : "#3A3A3A" }}>
                            {child.name}
                          </span>
                          {!hasReport && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background: isSelected ? "rgba(212,115,92,0.12)" : "#F0EDE9",
                                color: isSelected ? "#D4735C" : "#9A918A",
                              }}
                            >
                              {REPORT_TYPE_LABEL[childReportType]}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#9A918A]">
                          {hasReport ? "리포트 보기 →" : `${child.gender === "girl" ? "여아" : "남아"} · ${child.birth_date}`}
                        </div>
                      </div>
                      {!hasReport && (
                        <div className="flex items-center gap-2">
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForm(child);
                            }}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#B8A898] transition-colors hover:bg-[#F0EDE9] hover:text-primary"
                          >
                            <Pencil size={13} />
                          </span>
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all"
                            style={{
                              borderColor: isSelected ? "#D4735C" : "#D4CFC8",
                              background: isSelected ? "#D4735C" : "transparent",
                            }}
                          >
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* 새 아이 준비 중 버튼 */}
                <button
                  onClick={() => {
                    if (hasNoChildReport) {
                      router.push("/report/list");
                    } else {
                      setPreparingNewChild(!preparingNewChild);
                      setSelectedChildId(null);
                    }
                  }}
                  className="flex items-center gap-3.5 rounded-2xl border-2 px-4 py-3.5 transition-all duration-200"
                  style={{
                    borderColor: preparingNewChild ? "#D4735C" : hasNoChildReport ? "#E8E2DC" : "#ECE8E3",
                    background: preparingNewChild ? "linear-gradient(160deg, #FFF6F2, #FFF0EB)" : "#fff",
                    opacity: hasNoChildReport ? 0.6 : 1,
                  }}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg"
                    style={{ background: "linear-gradient(145deg, #E8F0E6, #F0F7EE)" }}
                  >
                    🤰
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-semibold" style={{ color: preparingNewChild ? "#D4735C" : "#3A3A3A" }}>
                      새 아이 준비 중이에요
                    </span>
                    <div className="text-[11px] text-[#9A918A]">
                      {hasNoChildReport ? "리포트 보기 →" : "출산 전 태교 리포트를 받을 수 있어요"}
                    </div>
                  </div>
                  {!hasNoChildReport && (
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all"
                      style={{
                        borderColor: preparingNewChild ? "#D4735C" : "#D4CFC8",
                        background: preparingNewChild ? "#D4735C" : "transparent",
                      }}
                    >
                      {preparingNewChild && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  )}
                </button>

                {/* 아이 추가 버튼 (폼 열기) */}
                <button
                  onClick={openAddForm}
                  className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[#D4CFC8] text-[12px] font-medium text-[#9A918A] transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus size={14} /> 아이 추가하기
                </button>
            </div>

          </div>

          {/* 선택된 아이의 리포트 타입 안내 */}
          {selectedChildId && !preparingNewChild && (() => {
            const selectedChild = localChildren.find((c) => c.id === selectedChildId);
            if (!selectedChild) return null;
            const reportType = getReportTypeFromBirthDate(selectedChild.birth_date);
            return (
              <div
                className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#ECE8E3] bg-[#FFFBF9] px-4 py-3"
                style={ease(0.28)}
              >
                <span className="mt-0.5 text-sm">📋</span>
                <p className="text-[12px] leading-[1.6] text-[#6B6360]">
                  <strong className="text-primary">{selectedChild.name}</strong> 아이의 나이에 맞는{" "}
                  <strong className="text-primary">{REPORT_TYPE_LABEL[reportType]}</strong>{" "}
                  리포트가 생성됩니다.
                </p>
              </div>
            );
          })()}
          {preparingNewChild && (
            <div
              className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#ECE8E3] bg-[#FFFBF9] px-4 py-3"
              style={ease(0.28)}
            >
              <span className="mt-0.5 text-sm">🤰</span>
              <p className="text-[12px] leading-[1.6] text-[#6B6360]">
                <strong className="text-primary">예비 부모</strong> 리포트와 함께{" "}
                <strong className="text-primary">태교 커뮤니케이션 가이드</strong>가 포함됩니다.
              </p>
            </div>
          )}

          {/* 자녀 등록/수정 Drawer */}
          <Drawer
            open={showChildForm}
            onOpenChange={(open) => {
              if (!open) {
                setShowChildForm(false);
                resetForm();
                if (!hasRegisteredChildren) setHasChildren(null);
              }
            }}
          >
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{editingChildId ? "아이 정보 수정" : "아이 추가하기"}</DrawerTitle>
                <DrawerDescription>
                  {editingChildId ? "아이 정보를 수정해주세요." : "아이 정보를 입력해주세요."}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-5 pb-6">
                {/* 사진 */}
                <div className="mb-4 flex justify-center">
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
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); setChildPhotoPreview(null); setChildPhotoFile(null); }}
                          className="absolute -top-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#6B6360] text-white"
                        >
                          <X size={10} />
                        </span>
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
                  className="mb-2 h-11 w-full rounded-lg border-[1.5px] border-[#ECE8E3] bg-white px-3 text-sm text-foreground outline-none placeholder:text-[#C4BEB8] focus:border-primary"
                />

                {/* 성별 */}
                <div className="mb-2 flex gap-2">
                  {([
                    { value: "boy", label: "남아", emoji: "👦" },
                    { value: "girl", label: "여아", emoji: "👧" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setChildGender(opt.value)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        borderColor: childGender === opt.value ? "#D4735C" : "#ECE8E3",
                        background: childGender === opt.value
                          ? "linear-gradient(160deg, #FFF6F2, #FFF0EB)"
                          : "#fff",
                        color: childGender === opt.value ? "#D4735C" : "#6B6360",
                      }}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* 생년월일 */}
                <input
                  type="text"
                  inputMode="numeric"
                  value={childBirthDate}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                    let formatted = digits;
                    if (digits.length > 4) formatted = digits.slice(0, 4) + "-" + digits.slice(4);
                    if (digits.length > 6) formatted = digits.slice(0, 4) + "-" + digits.slice(4, 6) + "-" + digits.slice(6);
                    setChildBirthDate(formatted);
                  }}
                  placeholder="2024-01-15"
                  maxLength={10}
                  className="mb-4 h-11 w-full rounded-lg border-[1.5px] border-[#ECE8E3] bg-white px-3 text-sm text-foreground outline-none placeholder:text-[#C4BEB8] focus:border-primary"
                />

                {/* 버튼 */}
                <button
                  type="button"
                  disabled={!childName.trim() || !childGender || !childBirthDate || addingChild}
                  onClick={async () => {
                    setAddingChild(true);
                    try {
                      let photoPath: string | undefined;
                      let photoDisplayUrl: string | undefined;
                      if (childPhotoFile) {
                        const ext = childPhotoFile.name.split(".").pop() ?? "jpg";
                        const { signedUrl, path } = await getUploadUrl(coupleId, ext);
                        const res = await fetch(signedUrl, {
                          method: "PUT",
                          headers: { "Content-Type": childPhotoFile.type },
                          body: childPhotoFile,
                        });
                        if (!res.ok) {
                          toast("사진 업로드에 실패했어요. 다시 시도해주세요.");
                          setAddingChild(false);
                          return;
                        }
                        photoPath = path;
                        photoDisplayUrl = URL.createObjectURL(childPhotoFile);
                      }

                      if (editingChildId) {
                        const existing = localChildren.find((c) => c.id === editingChildId);
                        await updateChild(editingChildId, {
                          name: childName.trim(),
                          gender: childGender,
                          birthDate: childBirthDate,
                          ...(photoPath !== undefined ? { photoUrl: photoPath } : childPhotoPreview === null && existing?.photo_url ? { photoUrl: null } : {}),
                        });
                        setLocalChildren((prev) =>
                          prev.map((c) =>
                            c.id === editingChildId
                              ? { ...c, name: childName.trim(), gender: childGender, birth_date: childBirthDate, photo_url: photoDisplayUrl ?? (childPhotoPreview === null ? null : c.photo_url) }
                              : c,
                          ),
                        );
                        toast("아이 정보가 수정되었어요!");
                      } else {
                        const result = await addChild(coupleId, {
                          name: childName.trim(),
                          gender: childGender,
                          birthDate: childBirthDate,
                          photoUrl: photoPath,
                        });
                        setLocalChildren((prev) => [
                          ...prev,
                          { id: result.id, name: childName.trim(), gender: childGender, birth_date: childBirthDate, photo_url: photoDisplayUrl ?? null },
                        ]);
                        setSelectedChildId(result.id);
                        toast("아이가 등록되었어요!");
                      }

                      setShowChildForm(false);
                      resetForm();
                    } finally {
                      setAddingChild(false);
                    }
                  }}
                  className="flex h-12 w-full items-center justify-center rounded-lg border-none text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{
                    background: childName.trim() && childGender && childBirthDate
                      ? "linear-gradient(135deg, #D4735C, #C0614A)"
                      : "#D4CFC8",
                  }}
                >
                  {addingChild ? <Loader2 size={16} className="animate-spin" /> : editingChildId ? "수정하기" : "등록하기"}
                </button>
              </div>
            </DrawerContent>
          </Drawer>

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

          {hasCoupon && (
            <div className="mt-7 mb-6 w-full" style={ease(0.38)}>
              <CouponTicket
                title="무료 쿠폰 적용 완료!"
                description="결제 없이 바로 리포트를 받을 수 있어요"
              />
            </div>
          )}
          {!hasCoupon && <div className="mb-6" />}
        </div>

        {/* Bottom CTA */}
        <div
          className="sticky bottom-0 border-t border-black/[0.03] bg-background/95 px-5 py-4 backdrop-blur-sm"
          style={ease(0.4)}
        >
          <button
            disabled={!canProceed || requesting}
            onClick={() => {
              const childId = preparingNewChild ? undefined : (selectedChildId ?? undefined);
              const selectedChild = selectedChildId && !preparingNewChild
                ? localChildren.find((c) => c.id === selectedChildId)
                : null;
              const reportType: ReportType = selectedChild
                ? getReportTypeFromBirthDate(selectedChild.birth_date)
                : "no_child";

              // 하트 부족 & 쿠폰 없음 → 상점으로 이동
              if (!hasCoupon && heartBalance < 1) {
                router.push("/shop");
                return;
              }

              startRequesting(async () => {
                const result = await requestReport(coupleId, reportType, childId);
                if ("error" in result) {
                  toast(result.error);
                  return;
                }
                router.replace(`/report/${result.reportId}/criterion`);
              });
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
              "♥️ 1개로 리포트 받기"
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
