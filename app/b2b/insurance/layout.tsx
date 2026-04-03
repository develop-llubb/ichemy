import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아이케미 B2B - 보험 설계사를 위한 데이터 컨설팅",
  description:
    "어린이·자녀 보험 영업의 판도를 바꾸는 데이터 기반 맞춤형 보험 컨설팅 시스템",
  openGraph: {
    title: "리포트 한 장이 10년 계약을 만듭니다",
    description: "데이터 기반 맞춤형 보험 컨설팅 시스템 — 아이케미 B2B",
    siteName: "아이케미",
  },
};

export default function InsuranceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
