"use client";

import { useActionState } from "react";
import { registerPartner, type RegisterPartnerState } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<RegisterPartnerState, FormData>(
    registerPartner,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">이름 / 업체명</Label>
        <Input
          id="name"
          name="name"
          placeholder="홍길동 / ABC학원"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="partner_type">업종</Label>
        <Select name="partner_type" required>
          <SelectTrigger>
            <SelectValue placeholder="업종을 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="academy">학원</SelectItem>
            <SelectItem value="insurance">보험</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">연락처</Label>
        <Input id="phone" name="phone" placeholder="010-0000-0000" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">소속</Label>
        <Input id="company" name="company" placeholder="소속 회사/기관" />
      </div>

      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "등록 중..." : "파트너 등록하기"}
      </Button>
    </form>
  );
}
