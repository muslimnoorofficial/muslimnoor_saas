-- ============================================================================
-- Fix RLS Infinite Recursion on mosque_members
-- The original policy caused infinite recursion because it subqueried itself.
-- Solution: use a security-definer function that bypasses RLS for the check.
-- ============================================================================

-- Drop the broken recursive policy
DROP POLICY IF EXISTS "Users can see members of their mosques" ON mosque_members;

-- Create a helper function that checks membership without triggering RLS
CREATE OR REPLACE FUNCTION auth_user_mosque_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT mosque_id FROM mosque_members WHERE user_id = auth.uid();
$$;

-- Re-create the mosque_members SELECT policy using the helper function
CREATE POLICY "Users can see members of their mosques" ON mosque_members
  FOR SELECT USING (
    mosque_id IN (SELECT auth_user_mosque_ids())
  );

-- Also fix the donations policy which has the same recursive risk
DROP POLICY IF EXISTS "Users can see donations for their mosques" ON donations;

CREATE POLICY "Users can see donations for their mosques" ON donations
  FOR SELECT USING (
    mosque_id IN (SELECT auth_user_mosque_ids())
    OR user_id = auth.uid()
  );

-- Super admins bypass RLS for all admin operations via service role key
-- These permissive policies allow the service role (admin client) to do everything:
CREATE POLICY "Service role bypass on mosque_members" ON mosque_members
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass on users" ON users
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass on donations" ON donations
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass on events" ON events
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass on announcements" ON announcements
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass on reminders" ON reminders
  USING (auth.role() = 'service_role');
