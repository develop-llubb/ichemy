import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  befeProfiles,
  befeCouples,
  reportBig5,
  reportAas,
  reportFlexibility,
} from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  // 1. auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 2. profile
  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user.id))
    .limit(1);

  if (!profile) {
    redirect("/profile/create");
  }

  // 3. couple
  const [couple] = await db
    .select({ id: befeCouples.id })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
      ),
    )
    .limit(1);

  // 4. partner (couple이 없을 때 invited_by 관계로 탐색)
  let partnerNickname: string | null = null;

  if (!couple) {
    if (profile.invited_by) {
      // 나를 초대한 사람
      const [inviter] = await db
        .select({ nickname: befeProfiles.nickname })
        .from(befeProfiles)
        .where(eq(befeProfiles.id, profile.invited_by))
        .limit(1);
      partnerNickname = inviter?.nickname ?? null;
    } else {
      // 내가 초대한 사람
      const [invitee] = await db
        .select({ nickname: befeProfiles.nickname })
        .from(befeProfiles)
        .where(eq(befeProfiles.invited_by, profile.id))
        .limit(1);
      partnerNickname = invitee?.nickname ?? null;
    }
  }

  // 5. 검사 결과 태그용 report 조회
  let tags: Array<{ label: string; bg: string; color: string }> | null = null;

  if (profile.test_completed) {
    const tagList: Array<{ label: string; bg: string; color: string }> = [];

    // Big5 nickname
    if (profile.big_5_type != null) {
      const [big5] = await db
        .select({ nickname: reportBig5.nickname })
        .from(reportBig5)
        .where(eq(reportBig5.big_5_type, profile.big_5_type))
        .limit(1);
      if (big5) {
        tagList.push({ label: big5.nickname, bg: "#FFF0EB", color: "#D4735C" });
      }
    }

    // Attachment type_text
    if (profile.attachment_type && profile.aas_intensity != null) {
      const [aas] = await db
        .select({ type_text: reportAas.type_text })
        .from(reportAas)
        .where(
          and(
            eq(reportAas.type, profile.attachment_type),
            eq(reportAas.aas_intensity, profile.aas_intensity),
          ),
        )
        .limit(1);
      if (aas) {
        tagList.push({ label: aas.type_text, bg: "#F3EFF9", color: "#8B72BE" });
      }
    }

    // Flexibility title
    if (profile.flexibility_level != null) {
      const [flex] = await db
        .select({ title: reportFlexibility.title })
        .from(reportFlexibility)
        .where(eq(reportFlexibility.flexibility_level, profile.flexibility_level))
        .limit(1);
      if (flex) {
        tagList.push({ label: flex.title, bg: "#F0F7F0", color: "#7BA872" });
      }
    }

    if (tagList.length > 0) {
      tags = tagList;
    }
  }

  // 6. status 결정
  let status: "pre_test" | "done_no_partner" | "waiting_partner" | "both_complete";

  if (!profile.test_completed) {
    status = "pre_test";
  } else if (couple) {
    status = "both_complete";
  } else if (partnerNickname) {
    status = "waiting_partner";
  } else {
    status = "done_no_partner";
  }

  return (
    <HomeClient
      nickname={profile.nickname ?? "회원"}
      role={profile.role}
      partnerNickname={partnerNickname}
      status={status}
      profileId={profile.id}
      tags={tags}
      hasCouple={!!couple}
    />
  );
}
