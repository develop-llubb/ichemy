import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  befePartnerInvitations,
  befePartners,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PartnerInvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [invitation] = await db
    .select({
      id: befePartnerInvitations.id,
      partner_id: befePartnerInvitations.partner_id,
      status: befePartnerInvitations.status,
      expires_at: befePartnerInvitations.expires_at,
    })
    .from(befePartnerInvitations)
    .where(eq(befePartnerInvitations.code, code))
    .limit(1);

  if (!invitation) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">유효하지 않은 초대 링크입니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            초대 링크를 다시 확인해주세요.
          </p>
        </div>
      </div>
    );
  }

  const expired = invitation.expires_at
    ? new Date(invitation.expires_at) < new Date()
    : false;

  if (expired || invitation.status === "expired") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">만료된 초대 링크입니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            파트너에게 새 초대 링크를 요청해주세요.
          </p>
        </div>
      </div>
    );
  }

  const [partner] = await db
    .select({ name: befePartners.name, company: befePartners.company })
    .from(befePartners)
    .where(eq(befePartners.id, invitation.partner_id))
    .limit(1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || "https://www.ichemy.co.kr")}/auth/callback&response_type=code`;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center bg-background px-5">
      <div className="w-full rounded-2xl border border-[#ECE8E3] bg-white p-6 text-center">
        <div className="mb-4 text-4xl">👶</div>
        <h1 className="text-xl font-bold text-foreground">
          무료 육아 케어 리포트
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {partner?.name}
            {partner?.company ? ` (${partner.company})` : ""}
          </span>
          님이 보내드리는
          <br />
          무료 육아 케어 리포트 초대입니다.
        </p>
        <div className="mt-6">
          {user ? (
            <Button asChild className="w-full">
              <Link href="/profile/create">시작하기</Link>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <a href={KAKAO_AUTH_URL}>카카오로 시작하기</a>
            </Button>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          검사를 완료하면 무료로 리포트를 받으실 수 있어요.
        </p>
      </div>
    </div>
  );
}
