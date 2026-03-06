import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileCreateForm } from "./form";

export default async function ProfileCreatePage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  // 이미 프로필이 있으면 홈으로
  const [existing] = await db
    .select({ id: befeProfiles.id })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (existing) {
    console.log("[profile/create] profile already exists for user:", user.id, "redirecting to /home");
    redirect("/home");
  }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background px-6">
      <main className="flex flex-1 flex-col justify-center">
        <h1
          className="animate-fade-up font-display text-3xl text-primary"
          style={{ animationDelay: "0ms" }}
        >
          회원가입
        </h1>
        <p
          className="animate-fade-up mt-2 text-sm text-muted"
          style={{ animationDelay: "80ms" }}
        >
          아이케미를 시작하기 전에 간단한 정보를 입력해주세요.
        </p>
        <div
          className="animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          <ProfileCreateForm />
        </div>
      </main>
    </div>
  );
}
