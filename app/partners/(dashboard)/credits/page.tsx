import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  befePartners,
  befePartnerCreditTransactions,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { CreditHistory } from "../_components/credit-history";
import { PurchaseCreditsDialog } from "../_components/purchase-credits-dialog";

export default async function CreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [partner] = await db
    .select({
      id: befePartners.id,
      credit_balance: befePartners.credit_balance,
    })
    .from(befePartners)
    .where(eq(befePartners.user_id, user!.id))
    .limit(1);

  const transactions = await db
    .select()
    .from(befePartnerCreditTransactions)
    .where(eq(befePartnerCreditTransactions.partner_id, partner.id))
    .orderBy(sql`${befePartnerCreditTransactions.created_at} desc`)
    .limit(50);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-lg font-semibold">크레딧</h2>
          <p className="text-sm text-muted-foreground">
            잔여 크레딧: <span className="font-bold text-foreground">{partner.credit_balance}</span>
          </p>
        </div>
        <PurchaseCreditsDialog partnerId={partner.id} />
      </div>
      <div className="px-4 lg:px-6">
        <CreditHistory transactions={transactions} />
      </div>
    </div>
  );
}
