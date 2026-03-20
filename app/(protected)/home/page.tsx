import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  befeProfiles,
  befeCouples,
  befeInvitations,
  befeReports,
  befePersonalityReports,
  reportBig5,
  reportAas,
  reportFlexibility,
} from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // layout에서 auth + profile + test_completed 체크 완료
  const [profile] = await db
    .select()
    .from(befeProfiles)
    .where(eq(befeProfiles.user_id, user!.id))
    .limit(1);

  // couple
  const [couple] = await db
    .select({ id: befeCouples.id, inviter_profile_id: befeCouples.inviter_profile_id, invitee_profile_id: befeCouples.invitee_profile_id })
    .from(befeCouples)
    .where(
      or(
        eq(befeCouples.inviter_profile_id, profile.id),
        eq(befeCouples.invitee_profile_id, profile.id),
      ),
    )
    .limit(1);

  // 4. partner 조회 (couple 테이블로만)
  let partnerNickname: string | null = null;
  let partnerTestCompleted = false;

  if (couple) {
    const partnerId = couple.inviter_profile_id === profile.id
      ? couple.invitee_profile_id
      : couple.inviter_profile_id;
    const [partner] = await db
      .select({ nickname: befeProfiles.nickname, test_completed: befeProfiles.test_completed })
      .from(befeProfiles)
      .where(eq(befeProfiles.id, partnerId))
      .limit(1);
    partnerNickname = partner?.nickname ?? null;
    partnerTestCompleted = partner?.test_completed ?? false;
  }

  // 5. 검사 결과 태그용 report 조회
  const tagList: Array<{ label: string; bg: string; color: string }> = [];

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

  const tags = tagList.length > 0 ? tagList : null;

  // 6. 대기 중인 초대 조회 (couple이 없을 때만)
  let pendingInvitation: { id: string; inviterProfileId: string; inviterNickname: string } | null = null;

  if (!couple) {
    const [invitation] = await db
      .select({
        id: befeInvitations.id,
        inviter_profile_id: befeInvitations.inviter_profile_id,
      })
      .from(befeInvitations)
      .where(
        and(
          eq(befeInvitations.invitee_profile_id, profile.id),
          eq(befeInvitations.status, "pending"),
        ),
      )
      .limit(1);

    if (invitation) {
      const [inviter] = await db
        .select({ nickname: befeProfiles.nickname })
        .from(befeProfiles)
        .where(eq(befeProfiles.id, invitation.inviter_profile_id))
        .limit(1);

      pendingInvitation = {
        id: invitation.id,
        inviterProfileId: invitation.inviter_profile_id,
        inviterNickname: inviter?.nickname ?? "배우자",
      };
    }
  }

  // 7. 기존 리포트 조회 (모든 리포트)
  let reports: Array<{ id: string; has_children: boolean }> = [];
  if (couple) {
    reports = await db
      .select({ id: befeReports.id, has_children: befeReports.has_children })
      .from(befeReports)
      .where(eq(befeReports.couple_id, couple.id));
  }
  const reportId = reports.length === 1 ? reports[0].id : null;

  // 8. 성향 리포트 존재 여부 확인
  const [personalityReport] = await db
    .select({ id: befePersonalityReports.id })
    .from(befePersonalityReports)
    .where(eq(befePersonalityReports.profile_id, profile.id))
    .limit(1);
  const hasPersonalityReport = !!personalityReport;

  // 9. status 결정
  let status: "done_no_partner" | "waiting_partner" | "both_complete";

  if (couple && partnerTestCompleted) {
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
      pendingInvitation={pendingInvitation}
      reportId={reportId}
      reportCount={reports.length}
      hasPersonalityReport={hasPersonalityReport}
      thirdPartyAgreed={profile.third_party_agreed ?? false}
    />
  );
}
