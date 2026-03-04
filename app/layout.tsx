import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Jua, Mogra } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jua = Jua({
  variable: "--font-jua",
  subsets: ["latin"],
  weight: "400",
});

const mogra = Mogra({
  variable: "--font-mogra",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "아이케미 - 부부 육아 케어 리포트",
  description:
    "부부 심리 성향 분석으로 알아보는 우리만의 육아 케어 리포트",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FEFCF9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="light" style={{ colorScheme: "light", background: "#FEFCF9" }}>
      <body
        className={`${notoSansKR.variable} ${jua.variable} ${mogra.variable} font-sans antialiased`}
        style={{ background: "#FEFCF9" }}
      >
        {children}
      </body>
    </html>
  );
}
