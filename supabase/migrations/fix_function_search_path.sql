-- ============================================
-- Migration: Fix Function Search Path Security
-- ============================================
-- Fixes: All functions with mutable search_path
-- Sets search_path to prevent search_path hijacking attacks
-- ============================================

-- ============================================
-- 1. cleanup_expired_verifications (if exists)
-- ============================================
-- Note: This function might be named cleanup_expired_otps in some migrations
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM phone_verifications
  WHERE expires_at < NOW() - INTERVAL '1 day'
    AND verified = FALSE;
END;
$$;

-- ============================================
-- 2. cleanup_expired_sessions
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Clean up old guest sessions (older than 30 days)
  DELETE FROM nokta_sessions
  WHERE user_id IS NULL
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ============================================
-- 3. increment_user_session_count
-- ============================================
CREATE OR REPLACE FUNCTION increment_user_session_count(p_user_id UUID, p_was_shared BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO nokta_user_stats (user_id, total_sessions, total_shares, last_session_at)
  VALUES (p_user_id, 1, CASE WHEN p_was_shared THEN 1 ELSE 0 END, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_sessions = nokta_user_stats.total_sessions + 1,
    total_shares = nokta_user_stats.total_shares + CASE WHEN p_was_shared THEN 1 ELSE 0 END,
    last_session_at = NOW(),
    updated_at = NOW();
END;
$$;

-- ============================================
-- 4. handle_sms_unsubscribe
-- ============================================
CREATE OR REPLACE FUNCTION handle_sms_unsubscribe(p_phone TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Add to unsubscribe list
  INSERT INTO sms_unsubscribes (phone, unsubscribed_at, reason)
  VALUES (p_phone, NOW(), 'STOP')
  ON CONFLICT (phone) DO UPDATE SET
    unsubscribed_at = NOW(),
    reason = 'STOP',
    resubscribed_at = NULL;
  
  -- Update user profile
  UPDATE user_profiles
  SET sms_consent = FALSE,
      sms_consent_at = NULL
  WHERE phone = p_phone;
END;
$$;

-- ============================================
-- 5. increment_share_click
-- ============================================
CREATE OR REPLACE FUNCTION increment_share_click(
  p_share_id TEXT,
  p_action TEXT DEFAULT 'click'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Mettre à jour le compteur de clics
  UPDATE share_events 
  SET clicked_count = clicked_count + 1
  WHERE asset_id = p_share_id;
  
  -- Si l'action est un scan démarré, incrémenter aussi
  IF p_action = 'start_scan' THEN
    UPDATE share_events 
    SET install_count = install_count + 1
    WHERE asset_id = p_share_id;
  END IF;
  
  -- Log pour analytics (optionnel)
  INSERT INTO share_click_events (share_id, action, created_at)
  VALUES (p_share_id, p_action, NOW())
  ON CONFLICT DO NOTHING;
END;
$$;

-- ============================================
-- 6. get_fatigue_penalty
-- ============================================
CREATE OR REPLACE FUNCTION get_fatigue_penalty(
  p_user_id UUID,
  p_micro_action_id TEXT,
  p_lookback_sessions INTEGER DEFAULT 3
)
RETURNS FLOAT
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_count INTEGER;
  penalty FLOAT := 0.0;
BEGIN
  SELECT COUNT(*)
  INTO recent_count
  FROM micro_action_events mae
  JOIN skane_sessions ss ON mae.session_id = ss.id
  WHERE mae.user_id = p_user_id
    AND mae.micro_action_id = p_micro_action_id
    AND ss.started_at >= (
      SELECT started_at
      FROM skane_sessions
      WHERE user_id = p_user_id
      ORDER BY started_at DESC
      LIMIT 1
      OFFSET p_lookback_sessions - 1
    );
  
  IF recent_count >= 3 THEN
    penalty := -30.0;
  ELSIF recent_count >= 2 THEN
    penalty := -23.0;
  ELSIF recent_count >= 1 THEN
    penalty := -15.0;
  END IF;
  
  RETURN penalty;
END;
$$;

-- ============================================
-- 7. update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 8. get_user_lift
-- ============================================
CREATE OR REPLACE FUNCTION get_user_lift(
  p_user_id UUID,
  p_micro_action_id TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS FLOAT
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  avg_effect FLOAT;
BEGIN
  SELECT COALESCE(AVG(effect::FLOAT), 0.0)
  INTO avg_effect
  FROM micro_action_events
  WHERE user_id = p_user_id
    AND micro_action_id = p_micro_action_id
    AND effect IS NOT NULL
  ORDER BY started_at DESC
  LIMIT p_limit;
  
  RETURN avg_effect * 10.0;
END;
$$;

-- ============================================
-- 9. handle_new_user
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, referral_code)
  VALUES (
    NEW.id,
    LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4),
    'NOKTA_' || UPPER(SUBSTRING(MD5(NEW.id::TEXT), 1, 8))
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- 10. cleanup_expired_otps (legacy function name)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM phone_otps
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$;

-- ============================================
-- Comments
-- ============================================

COMMENT ON FUNCTION cleanup_expired_verifications() IS 'Cleans up expired phone verifications. Search path fixed for security.';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Cleans up old guest sessions. Search path fixed for security.';
COMMENT ON FUNCTION increment_user_session_count(UUID, BOOLEAN) IS 'Increments user session count. Search path fixed for security.';
COMMENT ON FUNCTION handle_sms_unsubscribe(TEXT) IS 'Handles SMS unsubscribe requests. Search path fixed for security.';
COMMENT ON FUNCTION increment_share_click(TEXT, TEXT) IS 'Increments share click counter. Search path fixed for security.';
COMMENT ON FUNCTION get_fatigue_penalty(UUID, TEXT, INTEGER) IS 'Calculates fatigue penalty for micro-actions. Search path fixed for security.';
COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to update updated_at column. Search path fixed for security.';
COMMENT ON FUNCTION get_user_lift(UUID, TEXT, INTEGER) IS 'Calculates user lift for micro-actions. Search path fixed for security.';
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user profile on signup. Search path fixed for security.';
COMMENT ON FUNCTION cleanup_expired_otps() IS 'Cleans up expired OTPs (legacy). Search path fixed for security.';
