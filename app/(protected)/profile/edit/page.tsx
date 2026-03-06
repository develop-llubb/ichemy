import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EditProfileForm } from "./form";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const [profile] = await db
    .select({
      nickname: befeProfiles.nickname,
      role: befeProfiles.role,
    })
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    redirect("/profile/create");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <div className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-black/[0.03] bg-background/95 px-5 py-3 backdrop-blur-sm">
        <span className="font-display text-2xl tracking-wider text-primary">
          내 정보 수정
        </span>
      </div>

      <main className="flex flex-1 flex-col px-6 pt-6">
        <EditProfileForm
          currentNickname={profile.nickname ?? ""}
          currentRole={profile.role}
        />
      </main>
    </div>
  );
}
