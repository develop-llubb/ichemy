"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";


export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] bg-background">
      <header className="sticky top-0 z-10 flex h-12 items-center border-b border-border bg-background/80 px-4 backdrop-blur-sm">
        <button onClick={() => router.back()} className="text-muted">
          <ChevronLeft size={24} />
        </button>
      </header>
      <main className="px-5 py-6">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        <div className="prose-legal mt-5 space-y-4 text-[13px] leading-relaxed text-muted [&_h2]:mt-6 [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
    </div>
  );
}
