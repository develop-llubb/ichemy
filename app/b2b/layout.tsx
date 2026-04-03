import { Outfit, Noto_Sans_KR } from "next/font/google";
import type { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "아이케미 B2B - 데이터 기반 보험 컨설팅 시스템",
  description:
    "어린이·자녀 보험 영업의 판도를 바꾸는 데이터 기반 맞춤형 보험 컨설팅 시스템",
};

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="b2b-root" className={`${outfit.variable} ${notoSansKR.variable} min-h-screen`} style={{ background: "#0A0A0B" }}>
      {children}
    </div>
  );
}
