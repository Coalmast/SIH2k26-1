ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS keycloak_subject TEXT UNIQUE;

-- Allow target_user_id to be nullable so broadcast alerts (gas events targeting a mine) can be inserted
ALTER TABLE alerts ALTER COLUMN target_user_id DROP NOT NULL;

-- Enable Realtime on alerts table (was skipped when file was named v4_...)
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- Allow the FastAPI backend (using service_role key) to INSERT alerts bypassing RLS
CREATE POLICY "alerts_service_role_insert"
  ON alerts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to SELECT their own alerts (or mine-level alerts with no specific user)
DROP POLICY IF EXISTS "alerts_authenticated" ON alerts;
CREATE POLICY "alerts_authenticated_select"
  ON alerts FOR SELECT
  TO authenticated
  USING (
    target_user_id = (select auth.uid())
    OR target_user_id IS NULL
  );

-- DEV BYPASS: Allow anon role to SELECT all alerts.
-- This is needed for Realtime postgres_changes subscriptions when using DEV_BYPASS_AUTH
-- (anon key without a JWT session). The Realtime CDC pipeline runs as the subscriber's role,
-- so without this policy, change events are silently blocked by RLS.
-- ⚠️ REMOVE before production — replace with authenticated-only policy.
DROP POLICY IF EXISTS "alerts_anon_select" ON alerts;
CREATE POLICY "alerts_anon_select"
  ON alerts FOR SELECT
  TO anon
  USING (true);
