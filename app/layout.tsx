import type { Metadata, Viewport } from "next";
import { Jua, Mogra, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { BusinessFooter } from "@/components/business-footer";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
  openGraph: {
    title: "아이케미 - 부부 육아 케어 리포트",
    description: "심리학 기반 3분 검사로 부부의 육아 강점과 위험 신호를 한눈에",
    images: [{ url: "/og/default", width: 800, height: 400 }],
  },
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
    <html lang="ko" className={cn("light", "font-sans", geist.variable)} style={{ colorScheme: "light" }}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body
        className={`${jua.variable} ${mogra.variable} font-sans antialiased`}
      >
        <NextTopLoader color="#D4735C" showSpinner={false} />
        {children}
        <BusinessFooter />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FDF6F4",
              color: "#D4735C",
              border: "1px solid #D4735C",
              borderRadius: "10px",
              padding: "14px 18px",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
