-- Drop policies
DROP POLICY IF EXISTS "allow_postgres" ON "befe_profiles";
DROP POLICY IF EXISTS "allow_postgres" ON "befe_answers";
DROP POLICY IF EXISTS "allow_postgres" ON "befe_couples";
DROP POLICY IF EXISTS "allow_postgres" ON "befe_invitations";
DROP POLICY IF EXISTS "allow_postgres" ON "befe_reports";
DROP POLICY IF EXISTS "allow_postgres" ON "befe_personality_reports";
DROP POLICY IF EXISTS "allow_postgres" ON "befe_coupons";

-- Disable RLS
ALTER TABLE "befe_profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_answers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_couples" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_invitations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_reports" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_personality_reports" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "befe_coupons" DISABLE ROW LEVEL SECURITY;
