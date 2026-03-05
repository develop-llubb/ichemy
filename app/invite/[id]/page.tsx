import type { Metadata } from "next";
import { db } from "@/db";
import { befeProfiles, befeCouples } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KakaoLoginButton } from "@/components/kakao-login-button";
import { InviteLoggedIn } from "./invite-logged-in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const [inviter] = await db
    .select({ nickname: befeProfiles.nickname })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, id))
    .limit(1);

  const name = inviter?.nickname || "배우자";

  return {
    title: `${name}님이 육아 케미 검사에 초대했어요 - 아이케미`,
    description: "우리 부부 육아 점수, 몇 점일까? 3분이면 끝!",
    openGraph: {
      title: "우리 부부 육아 점수, 몇 점일까?",
      description: `${name}님이 함께 육아 케어 리포트를 확인하자고 초대했어요.`,
      images: [
        {
          url: `/og/invite?name=${encodeURIComponent(name)}`,
          width: 800,
          height: 400,
        },
      ],
    },
  };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 초대한 사람 프로필 확인
  const [inviter] = await db
    .select({
      id: befeProfiles.id,
      nickname: befeProfiles.nickname,
      test_completed: befeProfiles.test_completed,
    })
    .from(befeProfiles)
    .where(eq(befeProfiles.id, id))
    .limit(1);

  if (!inviter) {
    redirect("/");
  }

  // 이미 로그인된 사용자 처리
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [profile] = await db
      .select({
        id: befeProfiles.id,
        nickname: befeProfiles.nickname,
        test_completed: befeProfiles.test_completed,
        invited_by: befeProfiles.invited_by,
      })
      .from(befeProfiles)
      .where(eq(befeProfiles.user_id, user.id))
      .limit(1);

    if (!profile) {
      redirect("/profile/create");
    }

    // 자기 자신 초대 방지
    if (profile.id === inviter.id) {
      redirect("/home");
    }

    // 이미 연결된 상태 (invited_by 설정됨 또는 couple 존재) → 홈으로
    const [existingCouple] = await db
      .select({ id: befeCouples.id })
      .from(befeCouples)
      .where(
        or(
          eq(befeCouples.inviter_profile_id, profile.id),
          eq(befeCouples.invitee_profile_id, profile.id),
        ),
      )
      .limit(1);

    if (existingCouple) {
      redirect("/home");
    }

    // 로그인 상태 → 수락 UI
    return (
      <InviteLoggedIn
        inviterProfileId={inviter.id}
        inviterNickname={inviter.nickname ?? "배우자"}
        myNickname={profile.nickname ?? "회원"}
      />
    );
  }

  // 비로그인 상태
  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
          style={{
            background: "linear-gradient(145deg, #FFE8D6, #FFF0E6)",
            boxShadow: "0 8px 24px rgba(212,115,92,0.1)",
          }}
        >
          💌
        </div>

        <h1 className="mt-5 font-display text-3xl text-primary">
          초대장이 도착했어요
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          <span className="font-semibold text-foreground">
            {inviter.nickname}
          </span>
          님이 함께 육아 케어 리포트를
          <br />
          확인하자고 초대했어요.
        </p>

        <p className="mt-6 text-[13px] leading-relaxed text-muted-light">
          간단한 검사를 완료하면
          <br />두 분의 육아 케미를 분석해드려요.
        </p>

        <div className="mt-10 w-full max-w-[320px]">
          <KakaoLoginButton />
        </div>
      </main>
    </div>
  );
}
