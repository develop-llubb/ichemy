import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befeProfiles, befeAnswers, questions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { TestClient } from "./test-client";

export default async function TestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 프로필 조회
  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    redirect("/profile/create");
  }

  // 질문 전체 로드
  const allQuestions = await db
    .select()
    .from(questions)
    .orderBy(asc(questions.index));

  // 기존 답변 로드
  const existingAnswers = await db
    .select()
    .from(befeAnswers)
    .where(eq(befeAnswers.profile_id, profile.id));

  return (
    <TestClient
      profile={profile}
      questions={allQuestions}
      initialAnswers={existingAnswers}
    />
  );
}
