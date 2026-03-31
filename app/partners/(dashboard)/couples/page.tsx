import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  befePartners,
  befePartnerInvitations,
  befeProfiles,
  befeCouples,
  befeReports,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { CouplesTable } from "../_components/couples-table";

export default async function CouplesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [partner] = await db
    .select({ id: befePartners.id })
    .from(befePartners)
    .where(eq(befePartners.user_id, user!.id))
    .limit(1);

  const invitations = await db
    .select({
      id: befePartnerInvitations.id,
      code: befePartnerInvitations.code,
      label: befePartnerInvitations.label,
      status: befePartnerInvitations.status,
      created_at: befePartnerInvitations.created_at,
      profile_nickname: befeProfiles.nickname,
      couple_id: befePartnerInvitations.couple_id,
    })
    .from(befePartnerInvitations)
    .leftJoin(
      befeProfiles,
      eq(befePartnerInvitations.profile_id, befeProfiles.id),
    )
    .where(eq(befePartnerInvitations.partner_id, partner.id))
    .orderBy(sql`${befePartnerInvitations.created_at} desc`);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">커플 관리</h2>
        <p className="text-sm text-muted-foreground">
          초대한 커플의 현황을 확인하세요.
        </p>
      </div>
      <div className="px-4 lg:px-6">
        <CouplesTable invitations={invitations} />
      </div>
    </div>
  );
}
