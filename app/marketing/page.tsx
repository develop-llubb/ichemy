import { db } from "@/db";
import { befeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { LegalPage } from "@/components/legal-page";
import { ThirdPartyContent } from "@/components/legal-content";
import { ThirdPartyToggle } from "./toggle";

export default async function ThirdPartyPage() {
  let thirdPartyAgreed: boolean | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [profile] = await db
        .select({ third_party_agreed: befeProfiles.third_party_agreed })
        .from(befeProfiles)
        .where(eq(befeProfiles.user_id, user.id))
        .limit(1);
      thirdPartyAgreed = profile?.third_party_agreed ?? false;
    }
  } catch {}

  return (
    <LegalPage title="개인정보 제3자 제공 동의">
      {thirdPartyAgreed !== null && (
        <ThirdPartyToggle initialAgreed={thirdPartyAgreed} />
      )}
      <ThirdPartyContent />
    </LegalPage>
  );
}
