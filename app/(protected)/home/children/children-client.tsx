"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ChevronLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ChildForm } from "./child-form";
import { addChild, updateChild, deleteChild } from "./actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Child {
  id: string;
  name: string;
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
  const [mode, setMode] = useState<"list" | "add" | { edit: string }>("list");
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [deleting, startDeleting] = useTransition();

  const editingChild =
    typeof mode === "object" && "edit" in mode
      ? initialChildren.find((c) => c.id === mode.edit)
      : null;

  return (
    <>
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
          <button
            onClick={() => {
              if (mode !== "list") {
                setMode("list");
              } else {
                router.back();
              }
            }}
            className="-ml-1.5 flex h-10 w-10 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <span className="text-center text-[15px] font-semibold text-foreground">
            {mode === "add"
              ? "아이 등록"
              : editingChild
                ? "아이 정보 수정"
                : "우리 아이"}
          </span>
          <div />
        </div>

        <div className="flex-1 px-5 pt-6">
          {/* 등록/수정 폼 */}
          {mode === "add" && (
            <ChildForm
              coupleId={coupleId}
              onSubmit={async (data) => {
                await addChild(coupleId, data);
                toast("아이가 등록되었어요!");
                setMode("list");
                router.refresh();
              }}
              onCancel={() => setMode("list")}
              submitLabel="등록하기"
            />
          )}

          {editingChild && (
            <ChildForm
              coupleId={coupleId}
              initial={{
                id: editingChild.id,
                name: editingChild.name,
                birthDate: editingChild.birth_date,
                photoUrl: editingChild.photo_url,
              }}
              onSubmit={async (data) => {
                await updateChild(editingChild.id, data);
                toast("아이 정보가 수정되었어요!");
                setMode("list");
                router.refresh();
              }}
              onCancel={() => setMode("list")}
              submitLabel="수정하기"
            />
          )}

          {/* 목록 */}
          {mode === "list" && (
            <>
              {initialChildren.length === 0 ? (
                <div className="mt-12 flex flex-col items-center">
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-full text-4xl"
                    style={{
                      background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
                    }}
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
                  {initialChildren.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-4 rounded-[20px] border-[1.5px] border-[#ECE8E3] bg-white p-4"
                    >
                      {/* 사진 */}
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl"
                        style={{
                          background:
                            "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
                        }}
                      >
                        {child.photo_url ? (
                          <img
                            src={child.photo_url}
                            alt={child.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          "👶"
                        )}
                      </div>
                      {/* 정보 */}
                      <div className="flex-1">
                        <div className="text-[15px] font-bold text-foreground">
                          {child.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted">
                          {calculateAge(child.birth_date)}
                        </div>
                      </div>
                      {/* 액션 */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setMode({ edit: child.id })}
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

              {/* 아이 추가 버튼 */}
              <button
                onClick={() => setMode("add")}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#D4CFC8] text-[13px] font-semibold text-[#9A918A] transition-colors hover:border-primary hover:text-primary"
              >
                <Plus size={16} />
                아이 추가하기
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`${deleteTarget?.name}의 정보를 삭제할까요?`}
        description="삭제하면 해당 아이의 정보가 제거됩니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        loading={deleting}
        onConfirm={() => {
          if (!deleteTarget) return;
          startDeleting(async () => {
            await deleteChild(deleteTarget.id, coupleId);
            toast(`${deleteTarget.name}의 정보가 삭제되었어요.`);
            setDeleteTarget(null);
            router.refresh();
          });
        }}
      />
    </>
  );
}
