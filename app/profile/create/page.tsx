import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileCreateForm } from "./form";

export default async function ProfileCreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 이미 프로필이 있으면 홈으로
  const [existing] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (existing) {
    redirect("/home");
  }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background px-6">
      <main className="flex flex-1 flex-col justify-center">
        <h1 className="font-display text-3xl text-primary">회원가입</h1>
        <p className="mt-2 text-sm text-muted">
          아이케미를 시작하기 전에 간단한 정보를 입력해주세요.
        </p>
        <ProfileCreateForm />
      </main>
    </div>
  );
}
