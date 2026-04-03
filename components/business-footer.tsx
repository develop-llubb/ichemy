"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BusinessFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/b2b")) return null;

  return (
    <footer className="mx-auto w-full max-w-[430px] border-t border-[#ECE8E3] px-5 py-6">
      <div className="space-y-0.5 text-center text-[10px] leading-[1.6] text-[#D4CFC8]">
        <div>주식회사 LLUBB · 대표 김유승</div>
        <div>사업자등록번호 880-87-03398</div>
        <div>통신판매업 제2025-용인기흥-0000호</div>
        <div>경기도 용인시 기흥구 덕영대로2077번길 8, 103동 1201호</div>
        <div>010-3082-3241 · yskim@llubb.com</div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link
            href="/terms"
            className="underline transition-colors hover:text-[#B0AAA4]"
          >
            이용약관
          </Link>
          <span>·</span>
          <Link
            href="/privacy"
            className="underline transition-colors hover:text-[#B0AAA4]"
          >
            개인정보처리방침
          </Link>
        </div>
        <div className="pt-1">© 2025 LLUBB</div>
      </div>
    </footer>
  );
}
