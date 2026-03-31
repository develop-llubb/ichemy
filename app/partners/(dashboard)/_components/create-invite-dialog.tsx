"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createPartnerInvitation } from "../invites/actions";

export function CreateInviteDialog({ partnerId }: { partnerId: string }) {
  const [label, setLabel] = useState("");
  const [pending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createPartnerInvitation(
        partnerId,
        label.trim() || null,
      );
      if ("error" in result) {
        toast(result.error);
        return;
      }
      const url = `${window.location.origin}/partner-invite/${result.code}`;
      navigator.clipboard.writeText(url);
      toast("초대 링크가 생성되어 클립보드에 복사되었습니다.");
      setLabel("");
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="메모 (예: 김xx 부부)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-48"
      />
      <Button onClick={handleCreate} disabled={pending}>
        {pending ? "생성중..." : "초대 생성"}
      </Button>
    </div>
  );
}
