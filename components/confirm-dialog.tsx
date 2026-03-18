"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === overlayRef.current) onOpenChange(false);
      }}
    >
      <div
        className="mx-6 w-full max-w-[320px] rounded-2xl bg-white p-6 shadow-xl"
        style={{ animation: "dialogIn 0.2s ease-out" }}
      >
        <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-[13px] leading-[1.6] text-[#8A8078]">
          {description}
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-[#ECE8E3] bg-white text-[13px] font-medium text-[#6B6360] transition-colors active:bg-[#F8F6F3]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border-none bg-red-500 text-[13px] font-medium text-white transition-colors active:bg-red-600 disabled:opacity-50"
          >
            {loading ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
