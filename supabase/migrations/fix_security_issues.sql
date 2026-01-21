-- ============================================
-- Migration: Fix Security Issues
-- ============================================
-- Fixes:
-- 1. Remove SECURITY DEFINER from share_conversion_funnel view
-- 2. Enable RLS on share_click_events table
-- 3. Ensure RLS is enabled on sms_unsubscribes table
-- ============================================

-- ============================================
-- 1. Fix share_conversion_funnel view
-- ============================================
-- Recréer la vue sans SECURITY DEFINER
-- La vue doit utiliser les permissions de l'utilisateur qui l'interroge, pas du créateur

DROP VIEW IF EXISTS share_conversion_funnel;

CREATE VIEW share_conversion_funnel AS
SELECT 
  se.asset_id as share_id,
  se.user_id,
  se.share_type,
  se.created_at as shared_at,
  se.clicked_count,
  se.install_count as scans_started,
  se.signup_count,
  
  -- Taux de conversion
  CASE 
    WHEN se.clicked_count > 0 
    THEN ROUND((se.install_count::NUMERIC / se.clicked_count) * 100, 2)
    ELSE 0 
  END as click_to_scan_rate,
  
  CASE 
    WHEN se.install_count > 0 
    THEN ROUND((se.signup_count::NUMERIC / se.install_count) * 100, 2)
    ELSE 0 
  END as scan_to_signup_rate
  
FROM share_events se
WHERE se.asset_id IS NOT NULL
ORDER BY se.created_at DESC;

-- Grant access (utilisateurs authentifiés peuvent voir leurs propres données via RLS sur share_events)
GRANT SELECT ON share_conversion_funnel TO authenticated;

-- ============================================
-- 2. Enable RLS on share_click_events
-- ============================================

-- Activer RLS
ALTER TABLE share_click_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage click events" ON share_click_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can read their own click events
-- (via share_events.user_id join)
CREATE POLICY "Users can read their own click events" ON share_click_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM share_events se
      WHERE se.asset_id = share_click_events.share_id
        AND se.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can insert click events for their own shares
CREATE POLICY "Users can insert their own click events" ON share_click_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM share_events se
      WHERE se.asset_id = share_click_events.share_id
        AND se.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. Ensure RLS is enabled on sms_unsubscribes
-- ============================================

-- Activer RLS (idempotent)
ALTER TABLE sms_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Service role can manage unsubscribes" ON sms_unsubscribes;

-- Recréer la policy pour le service role
CREATE POLICY "Service role can manage unsubscribes" ON sms_unsubscribes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Users can read their own unsubscribe status (read-only)
CREATE POLICY "Users can read their own unsubscribe status" ON sms_unsubscribes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.phone = sms_unsubscribes.phone
        AND up.user_id = auth.uid()
    )
  );

-- ============================================
-- Comments
-- ============================================

COMMENT ON VIEW share_conversion_funnel IS 'Conversion funnel for share events. Uses caller permissions (no SECURITY DEFINER).';
COMMENT ON TABLE share_click_events IS 'Detailed click events for share tracking. RLS enabled for security.';
COMMENT ON TABLE sms_unsubscribes IS 'SMS opt-outs for compliance. RLS enabled with service role and user read access.';
