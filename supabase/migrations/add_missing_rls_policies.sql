-- ============================================
-- Migration: Add Missing RLS Policies
-- ============================================
-- Adds RLS policies for tables that have RLS enabled but no policies
-- ============================================

-- ============================================
-- 1. audit_log
-- ============================================
-- Audit logs are sensitive and should only be accessible by service role
-- Users should not be able to read audit logs about themselves or others

DROP POLICY IF EXISTS "Service role can manage audit logs" ON audit_log;

CREATE POLICY "Service role can manage audit logs" ON audit_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 2. consent_log
-- ============================================
-- Users can read their own consent history
-- Service role can manage all consent logs

DROP POLICY IF EXISTS "Users can read own consent logs" ON consent_log;
DROP POLICY IF EXISTS "Service role can manage consent logs" ON consent_log;

CREATE POLICY "Users can read own consent logs" ON consent_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage consent logs" ON consent_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 3. error_events
-- ============================================
-- Users can read their own error events (for debugging)
-- Service role can manage all error events

DROP POLICY IF EXISTS "Users can read own error events" ON error_events;
DROP POLICY IF EXISTS "Service role can manage error events" ON error_events;
DROP POLICY IF EXISTS "Users can insert own error events" ON error_events;

CREATE POLICY "Users can read own error events" ON error_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR (user_id IS NULL AND guest_id IS NOT NULL));

CREATE POLICY "Users can insert own error events" ON error_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Service role can manage error events" ON error_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 4. feature_flags
-- ============================================
-- Public read access (needed for client-side feature flag checks)
-- Service role can manage feature flags

DROP POLICY IF EXISTS "Public can read feature flags" ON feature_flags;
DROP POLICY IF EXISTS "Service role can manage feature flags" ON feature_flags;

CREATE POLICY "Public can read feature flags" ON feature_flags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage feature flags" ON feature_flags
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 5. phone_verifications
-- ============================================
-- Service role only (sensitive OTP data)
-- Users should not access their own verifications directly

DROP POLICY IF EXISTS "Service role can manage verifications" ON phone_verifications;

CREATE POLICY "Service role can manage verifications" ON phone_verifications
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 6. referrals
-- ============================================
-- Users can read their own referral codes and stats
-- Service role can manage all referrals

DROP POLICY IF EXISTS "Users can read own referrals" ON referrals;
DROP POLICY IF EXISTS "Service role can manage referrals" ON referrals;

CREATE POLICY "Users can read own referrals" ON referrals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage referrals" ON referrals
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 7. subscriptions
-- ============================================
-- Users can read their own subscription details
-- Service role can manage all subscriptions

DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;

CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Comments
-- ============================================

COMMENT ON POLICY "Service role can manage audit logs" ON audit_log IS 'Only service role can access audit logs (sensitive data)';
COMMENT ON POLICY "Users can read own consent logs" ON consent_log IS 'Users can view their own consent history';
COMMENT ON POLICY "Service role can manage consent logs" ON consent_log IS 'Service role can manage all consent logs';
COMMENT ON POLICY "Users can read own error events" ON error_events IS 'Users can view their own error events for debugging';
COMMENT ON POLICY "Users can insert own error events" ON error_events IS 'Users can report their own errors';
COMMENT ON POLICY "Service role can manage error events" ON error_events IS 'Service role can manage all error events';
COMMENT ON POLICY "Public can read feature flags" ON feature_flags IS 'Public read access for client-side feature flag checks';
COMMENT ON POLICY "Service role can manage feature flags" ON feature_flags IS 'Service role can manage feature flags';
COMMENT ON POLICY "Service role can manage verifications" ON phone_verifications IS 'Only service role can access phone verifications (sensitive OTP data)';
COMMENT ON POLICY "Users can read own referrals" ON referrals IS 'Users can view their own referral codes and stats';
COMMENT ON POLICY "Service role can manage referrals" ON referrals IS 'Service role can manage all referrals';
COMMENT ON POLICY "Users can read own subscriptions" ON subscriptions IS 'Users can view their own subscription details';
COMMENT ON POLICY "Service role can manage subscriptions" ON subscriptions IS 'Service role can manage all subscriptions';
