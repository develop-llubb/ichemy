"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ChildFormProps {
  coupleId: string;
  initial?: {
    id: string;
    name: string;
    birthDate: string;
    photoUrl: string | null;
  };
  onSubmit: (data: {
    name: string;
    birthDate: string;
    photoUrl?: string;
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function ChildForm({
  coupleId,
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: ChildFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initial?.photoUrl ?? null,
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isValid = name.trim() !== "" && birthDate !== "";

  async function uploadPhoto(file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${coupleId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);

    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      } else if (initial?.photoUrl && photoPreview) {
        photoUrl = initial.photoUrl;
      }

      await onSubmit({
        name: name.trim(),
        birthDate,
        photoUrl,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  return (
    <div className="w-full rounded-2xl border-[1.5px] border-[#ECE8E3] bg-white p-5">
      {/* 사진 */}
      <div className="mb-5 flex justify-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#D4CFC8] bg-[#F8F6F3] transition-colors hover:border-primary"
        >
          {photoPreview ? (
            <>
              <img
                src={photoPreview}
                alt="미리보기"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoPreview(null);
                  setPhotoFile(null);
                }}
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#6B6360] text-white"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Camera size={20} className="text-[#B8A898]" />
              <span className="text-[10px] text-[#B8A898]">사진</span>
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 이름 */}
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-semibold text-[#6B6360]">
          이름
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="아이 이름"
          className="h-11 w-full rounded-xl border-[1.5px] border-[#ECE8E3] bg-[#FEFCF9] px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-[#C4BEB8] focus:border-primary"
        />
      </div>

      {/* 생년월일 */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-[#6B6360]">
          생년월일
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="h-11 w-full rounded-xl border-[1.5px] border-[#ECE8E3] bg-[#FEFCF9] px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-11 flex-1 items-center justify-center rounded-xl border-[1.5px] border-[#ECE8E3] text-[13px] font-semibold text-[#6B6360]"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="flex h-11 flex-1 items-center justify-center rounded-xl border-none text-[13px] font-semibold text-white transition-all disabled:opacity-50"
          style={{
            background: isValid
              ? "linear-gradient(135deg, #D4735C, #C0614A)"
              : "#D4CFC8",
          }}
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  );
}
