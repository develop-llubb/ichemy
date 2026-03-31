import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { befePartners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PartnerSidebar } from "./_components/partner-sidebar";
import { PartnerHeader } from "./_components/partner-header";

export default async function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [partner] = await db
    .select()
    .from(befePartners)
    .where(eq(befePartners.user_id, user.id))
    .limit(1);

  if (!partner) {
    redirect("/partners/register");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <PartnerSidebar partner={partner} />
      <SidebarInset>
        <PartnerHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
