"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ChevronLeft, Plus, Pencil, Trash2, Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addChild, updateChild, deleteChild, getUploadUrl } from "./actions";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface Child {
  id: string;
  name: string;
  gender: string;
  birth_date: string;
  photo_url: string | null;
}

interface ChildrenClientProps {
  coupleId: string;
  children: Child[];
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 1) return "신생아";
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  if (remainMonths === 0) return `${years}세`;
  return `${years}세 ${remainMonths}개월`;
}

export function ChildrenClient({ coupleId, children: initialChildren }: ChildrenClientProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [deleting, startDeleting] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  // Drawer form state
  const [showForm, setShowForm] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState("");
  const [childBirthDate, setChildBirthDate] = useState("");
  const [childPhotoFile, setChildPhotoFile] = useState<File | null>(null);
  const [childPhotoPreview, setChildPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setShowForm(true);
  };

  const openEditForm = (child: Child) => {
    setEditingChildId(child.id);
    setChildName(child.name);
    setChildGender(child.gender);
    setChildBirthDate(child.birth_date);
    setChildPhotoPreview(child.photo_url);
    setChildPhotoFile(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!childName.trim() || !childGender || !childBirthDate || submitting) return;
    setSubmitting(true);
    try {
      let photoPath: string | undefined;
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
          setSubmitting(false);
          return;
        }
        photoPath = path;
      }

      if (editingChildId) {
        const existing = initialChildren.find((c) => c.id === editingChildId);
        await updateChild(editingChildId, {
          name: childName.trim(),
          gender: childGender,
          birthDate: childBirthDate,
          ...(photoPath !== undefined
            ? { photoUrl: photoPath }
            : childPhotoPreview === null && existing?.photo_url
              ? { photoUrl: null }
              : {}),
        });
        toast("아이 정보가 수정되었어요!");
      } else {
        await addChild(coupleId, {
          name: childName.trim(),
          gender: childGender,
          birthDate: childBirthDate,
          photoUrl: photoPath,
        });
        toast("아이가 등록되었어요!");
      }

      setShowForm(false);
      resetForm();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
          <button
            onClick={() => router.back()}
            className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <span className="text-center text-[15px] font-semibold text-foreground">
            우리 아이
          </span>
          <div />
        </div>

        <div className="flex-1 px-5 pt-6">
          {initialChildren.length === 0 ? (
            <div className="mt-12 flex flex-col items-center" style={ease(0)}>
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full text-4xl"
                style={{ background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)" }}
              >
                👶
              </div>
              <p className="mt-5 text-center text-sm font-semibold text-foreground">
                아직 등록된 아이가 없어요
              </p>
              <p className="mt-1.5 text-center text-xs text-muted">
                아이를 등록하면 맞춤형 리포트를 받을 수 있어요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {initialChildren.map((child, i) => (
                <div
                  key={child.id}
                  className="flex items-center gap-4 rounded-[20px] border-[1.5px] border-[#ECE8E3] bg-white p-4"
                  style={ease(i * 0.05)}
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl"
                    style={{ background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)" }}
                  >
                    {child.photo_url ? (
                      <img src={child.photo_url} alt={child.name} className="h-full w-full object-cover" />
                    ) : child.gender === "girl" ? "👧" : "👦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-foreground">{child.name}</div>
                    <p className="mt-0.5 text-xs text-muted">
                      {child.gender === "girl" ? "여아" : "남아"} · {calculateAge(child.birth_date)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditForm(child)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8F6F3] text-[#9A918A] transition-colors hover:bg-[#ECE8E3]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(child)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8F6F3] text-[#9A918A] transition-colors hover:bg-[#ECE8E3]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={openAddForm}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#D4CFC8] text-[13px] font-semibold text-[#9A918A] transition-colors hover:border-primary hover:text-primary"
            style={ease(initialChildren.length * 0.05 + 0.05)}
          >
            <Plus size={16} />
            아이 추가하기
          </button>
        </div>
      </div>

      {/* 등록/수정 Drawer */}
      <Drawer open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
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

            {/* 제출 */}
            <button
              type="button"
              disabled={!childName.trim() || !childGender || !childBirthDate || submitting}
              onClick={handleSubmit}
              className="flex h-12 w-full items-center justify-center rounded-lg border-none text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{
                background: childName.trim() && childGender && childBirthDate
                  ? "linear-gradient(135deg, #D4735C, #C0614A)"
                  : "#D4CFC8",
              }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : editingChildId ? "수정하기" : "등록하기"}
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* 삭제 확인 Drawer */}
      <Drawer open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{deleteTarget?.name}의 정보를 삭제할까요?</DrawerTitle>
            <DrawerDescription>
              삭제하면 해당 아이의 리포트도 모두 삭제되며, 되돌릴 수 없습니다.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex gap-2.5 px-5 pb-6">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex h-12 flex-1 items-center justify-center rounded-xl border-[1.5px] border-[#ECE8E3] text-[13px] font-semibold text-[#6B6360]"
            >
              취소
            </button>
            <button
              disabled={deleting}
              onClick={() => {
                if (!deleteTarget) return;
                startDeleting(async () => {
                  await deleteChild(deleteTarget.id, coupleId);
                  toast(`${deleteTarget.name}의 정보가 삭제되었어요.`);
                  setDeleteTarget(null);
                  router.refresh();
                });
              }}
              className="flex h-12 flex-1 items-center justify-center rounded-xl border-none text-[13px] font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #D4735C, #C0614A)" }}
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : "삭제"}
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
