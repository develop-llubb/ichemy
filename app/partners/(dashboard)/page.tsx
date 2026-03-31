import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  befePartners,
  befePartnerInvitations,
  befePartnerCreditTransactions,
  befeReports,
} from "@/db/schema";
import { eq, count, isNotNull } from "drizzle-orm";
import { PartnerStats } from "./_components/partner-stats";

export default async function PartnersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [partner] = await db
    .select()
    .from(befePartners)
    .where(eq(befePartners.user_id, user!.id))
    .limit(1);

  // Count invited couples (invitations with couple_id set)
  const [coupleCount] = await db
    .select({ count: count() })
    .from(befePartnerInvitations)
    .where(eq(befePartnerInvitations.partner_id, partner.id));

  // Count reports generated via partner invitations
  const [reportCount] = await db
    .select({ count: count() })
    .from(befePartnerInvitations)
    .innerJoin(
      befeReports,
      eq(befePartnerInvitations.couple_id, befeReports.couple_id),
    )
    .where(eq(befePartnerInvitations.partner_id, partner.id));

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">대시보드</h2>
        <p className="text-sm text-muted-foreground">
          파트너 활동 현황을 확인하세요.
        </p>
      </div>
      <PartnerStats
        creditBalance={partner.credit_balance}
        coupleCount={coupleCount?.count ?? 0}
        reportCount={reportCount?.count ?? 0}
      />
    </div>
  );
}
