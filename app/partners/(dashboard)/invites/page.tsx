import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { befePartners, befePartnerInvitations } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { InviteList } from "../_components/invite-list";
import { CreateInviteDialog } from "../_components/create-invite-dialog";

export default async function InvitesPage() {
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
    .select()
    .from(befePartnerInvitations)
    .where(eq(befePartnerInvitations.partner_id, partner.id))
    .orderBy(sql`${befePartnerInvitations.created_at} desc`);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-lg font-semibold">초대 링크</h2>
          <p className="text-sm text-muted-foreground">
            초대 링크를 생성하고 관리하세요.
          </p>
        </div>
        <CreateInviteDialog partnerId={partner.id} />
      </div>
      <div className="px-4 lg:px-6">
        <InviteList invitations={invitations} />
      </div>
    </div>
  );
}
