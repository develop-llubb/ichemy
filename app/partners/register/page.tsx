import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befePartners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { RegisterForm } from "./form";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";
import { DarkBody } from "../_components/dark-body";

export default async function PartnerRegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 파트너면 대시보드로
  if (user) {
    const [existing] = await db
      .select({ id: befePartners.id })
      .from(befePartners)
      .where(eq(befePartners.user_id, user.id))
      .limit(1);

    if (existing) {
      redirect("/partners");
    }
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "https://www.ichemy.co.kr";

  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(origin)}/auth/callback&response_type=code`;

  return (
    <div className="dark bg-background text-foreground">
      <DarkBody />
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">파트너 등록</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              파트너로 등록하고 신혼부부에게 리포트를 제공하세요.
            </p>
          </div>
          {user ? (
            <RegisterForm />
          ) : (
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                파트너 등록을 위해 먼저 로그인해주세요.
              </p>
              <Button asChild className="w-full">
                <a href={KAKAO_AUTH_URL}>카카오로 로그인</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
