import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아이케미 B2B - 교육업체를 위한 데이터 세일즈 솔루션",
  description:
    "방문교사 세일즈를 데이터 타겟팅으로 진화시키는 4-in-1 통합 진단 시스템",
};

export default function EducationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
