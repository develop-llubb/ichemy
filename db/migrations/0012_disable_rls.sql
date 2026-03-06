-- Re-enable RLS with policy allowing postgres role (Drizzle direct connection)
ALTER TABLE "befe_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_couples" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_personality_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_coupons" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_postgres" ON "befe_profiles" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "allow_postgres" ON "befe_answers" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "allow_postgres" ON "befe_couples" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "allow_postgres" ON "befe_invitations" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "allow_postgres" ON "befe_reports" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "allow_postgres" ON "befe_personality_reports" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "allow_postgres" ON "befe_coupons" FOR ALL TO postgres USING (true) WITH CHECK (true);
