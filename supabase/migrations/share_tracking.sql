-- ============================================
-- INDEX: Assurer l'unicité de asset_id
-- ============================================
-- Si asset_id n'est pas déjà unique, ajouter un index unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_share_events_asset_id_unique 
ON share_events(asset_id) 
WHERE asset_id IS NOT NULL;

-- ============================================
-- FONCTION: Incrémenter les clics sur un partage
-- ============================================
-- Cette fonction est appelée depuis l'API /api/track/share-click
-- Elle permet de tracker la conversion partage → scan

CREATE OR REPLACE FUNCTION increment_share_click(
  p_share_id TEXT,
  p_action TEXT DEFAULT 'click'
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TABLE: Événements de clics détaillés (optionnel mais utile)
-- ============================================
CREATE TABLE IF NOT EXISTS share_click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'click', 'start_scan', 'complete_scan', 'signup'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Métadonnées optionnelles
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_share_click_events_share_id ON share_click_events(share_id);
CREATE INDEX IF NOT EXISTS idx_share_click_events_created_at ON share_click_events(created_at DESC);

-- ============================================
-- Vue: Funnel de conversion par partage
-- ============================================
CREATE OR REPLACE VIEW share_conversion_funnel AS
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

-- Grant access
GRANT SELECT ON share_conversion_funnel TO authenticated;
