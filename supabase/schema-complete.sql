-- ============================================
-- NOKTA ONE - Schéma Supabase Complet
-- ============================================
-- Tracking complet : Auth, SKANE, Micro-actions, Feedback, 
-- Partage, Abonnements, RGPD, Feature Flags
-- ============================================

-- ============================================
-- 1. PROFILS UTILISATEURS (Auth + Métadonnées)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profile (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Auth
  auth_provider TEXT CHECK (auth_provider IN ('email', 'apple', 'google')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'banned', 'deleted')),
  
  -- Plan & Abonnement
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  
  -- Préférences
  locale TEXT DEFAULT 'fr',
  timezone TEXT DEFAULT 'UTC',
  
  -- RGPD & Consentements
  consent_version TEXT,
  consent_at TIMESTAMPTZ,
  marketing_opt_in BOOLEAN DEFAULT FALSE,
  
  -- Mode invité
  guest BOOLEAN DEFAULT FALSE,
  guest_id UUID, -- ID local si mode invité
  guest_converted_to_user_id UUID, -- Si conversion invité → compte
  
  -- Profil
  username TEXT UNIQUE,
  email TEXT,
  goal TEXT,
  
  CONSTRAINT guest_check CHECK (
    (guest = TRUE AND user_id IS NOT NULL) OR
    (guest = FALSE AND username IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_user_profile_account_status ON user_profile(account_status);
CREATE INDEX IF NOT EXISTS idx_user_profile_plan ON user_profile(plan);
CREATE INDEX IF NOT EXISTS idx_user_profile_guest_id ON user_profile(guest_id);

-- ============================================
-- 2. SESSIONS SKANE (Cœur produit)
-- ============================================
CREATE TABLE IF NOT EXISTS skane_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  guest_id UUID, -- Pour mode invité
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Mode
  mode TEXT NOT NULL CHECK (mode IN ('guest', 'account')),
  
  -- État interne détecté
  state_internal TEXT NOT NULL CHECK (state_internal IN ('HIGH_ACTIVATION', 'LOW_ENERGY', 'REGULATED')),
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  signal_raw INTEGER CHECK (signal_raw >= 0 AND signal_raw <= 100),
  
  -- Environnement (optionnel)
  environment JSONB, -- {light: 'good', camera: 'ok', ...}
  
  -- Version algorithme (important pour évolutions)
  version_algo TEXT DEFAULT 'v1',
  
  -- Skane Index (before/after)
  before_score INTEGER CHECK (before_score >= 0 AND before_score <= 100),
  after_score INTEGER CHECK (after_score >= 0 AND after_score <= 100),
  delta INTEGER, -- after - before
  
  -- Partage
  is_share_triggered BOOLEAN DEFAULT FALSE,
  share_asset_id UUID, -- Référence vers share_events si partagé
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skane_sessions_user_id ON skane_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_guest_id ON skane_sessions(guest_id);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_started_at ON skane_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_mode ON skane_sessions(mode);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_state ON skane_sessions(state_internal);

-- ============================================
-- 3. CATALOGUE MICRO-ACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS micro_actions (
  id TEXT PRIMARY KEY, -- ex: 'physiological_sigh'
  name TEXT NOT NULL,
  name_key TEXT, -- Clé de traduction
  
  -- Caractéristiques
  category TEXT NOT NULL CHECK (category IN ('relax', 'activate', 'center', 'recover')),
  base_weight FLOAT NOT NULL DEFAULT 50.0, -- % ressenti initial (0-100)
  duration_sec INTEGER NOT NULL,
  instructions JSONB,
  
  -- Feature flag
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ÉVÉNEMENTS MICRO-ACTIONS (Exécutions)
-- ============================================
CREATE TABLE IF NOT EXISTS micro_action_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  session_id UUID REFERENCES skane_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  guest_id UUID,
  micro_action_id TEXT NOT NULL REFERENCES micro_actions(id),
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  aborted_reason TEXT,
  
  -- Mode
  mode TEXT NOT NULL CHECK (mode IN ('guest', 'account')),
  
  -- Feedback 3 smileys (donnée précieuse)
  effect INTEGER CHECK (effect IN (-1, 0, 1)), -- -1=pire, 0=pareil, 1=mieux
  effort INTEGER CHECK (effort IN (0, 1, 2)), -- 0=facile, 1=moyen, 2=dur (optionnel)
  comment TEXT, -- Optionnel, à éviter au début
  
  -- Algorithme : décisions prises
  candidates_shown JSONB, -- Liste des actions proposées
  picked_action_id TEXT, -- Action réellement jouée
  selection_rule TEXT, -- 'top2_random', 'weighted', 'fallback'
  penalties_applied JSONB, -- {fatigue: -15, repetition: -5}
  user_lift_used BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_micro_action_events_user_id ON micro_action_events(user_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_guest_id ON micro_action_events(guest_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_session_id ON micro_action_events(session_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_micro_action_id ON micro_action_events(micro_action_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_started_at ON micro_action_events(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_user_action ON micro_action_events(user_id, micro_action_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_effect ON micro_action_events(effect) WHERE effect IS NOT NULL;

-- ============================================
-- 5. MAPPING ÉTAT → ACTIONS CANDIDATES
-- ============================================
CREATE TABLE IF NOT EXISTS state_action_map (
  state TEXT NOT NULL CHECK (state IN ('HIGH_ACTIVATION', 'LOW_ENERGY', 'REGULATED')),
  micro_action_id TEXT NOT NULL REFERENCES micro_actions(id),
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (state, micro_action_id)
);

CREATE INDEX IF NOT EXISTS idx_state_action_map_state ON state_action_map(state);

-- ============================================
-- 6. PARTAGE / VIRALITÉ (Social Loop)
-- ============================================
CREATE TABLE IF NOT EXISTS share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  guest_id UUID,
  session_id UUID REFERENCES skane_sessions(id) ON DELETE SET NULL,
  
  -- Type de partage
  share_type TEXT CHECK (share_type IN ('story', 'tiktok', 'instagram', 'twitter', 'other')),
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_count INTEGER DEFAULT 0,
  install_count INTEGER DEFAULT 0,
  signup_count INTEGER DEFAULT 0,
  
  -- Asset généré
  asset_url TEXT, -- URL de l'image/vidéo générée
  asset_id TEXT -- ID unique de l'asset
);

CREATE INDEX IF NOT EXISTS idx_share_events_user_id ON share_events(user_id);
CREATE INDEX IF NOT EXISTS idx_share_events_session_id ON share_events(session_id);
CREATE INDEX IF NOT EXISTS idx_share_events_created_at ON share_events(created_at DESC);

-- ============================================
-- 7. REFERRAL / PARRAINAGE
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  
  -- Codes
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_code TEXT, -- Code utilisé à l'inscription
  
  -- Attribution
  attribution_source TEXT, -- 'tiktok', 'instagram', 'direct', etc.
  
  -- Stats
  signup_count INTEGER DEFAULT 0,
  active_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);

-- ============================================
-- 8. ABONNEMENTS / PAIEMENTS (Stripe)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  
  -- Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  
  -- Statut
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  plan_price_id TEXT,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- 9. RGPD / CONFORMITÉ
-- ============================================
CREATE TABLE IF NOT EXISTS consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  
  -- Consentement
  consent_version TEXT NOT NULL,
  consent_at TIMESTAMPTZ DEFAULT NOW(),
  consent_type TEXT CHECK (consent_type IN ('privacy', 'marketing', 'analytics')),
  granted BOOLEAN DEFAULT TRUE,
  
  -- RGPD
  data_retention_policy_version TEXT,
  deletion_requested_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  export_requested_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_log_user_id ON consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_consent_at ON consent_log(consent_at DESC);

-- ============================================
-- 10. AUDIT LOG (Modifications sensibles)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  
  -- Action
  action_type TEXT NOT NULL CHECK (action_type IN ('plan_change', 'ban', 'unban', 'deletion', 'export')),
  action_details JSONB,
  
  -- Métadonnées
  performed_by UUID, -- Admin qui a fait l'action
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- ============================================
-- 11. ERREURS / BUGS (Qualité produit)
-- ============================================
CREATE TABLE IF NOT EXISTS error_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  guest_id UUID,
  
  -- Erreur
  error_code TEXT,
  error_message TEXT,
  screen TEXT, -- Page/écran où l'erreur s'est produite
  
  -- Contexte
  device_info JSONB, -- {os: 'iOS', version: '17.0', ...}
  network_status TEXT,
  app_version TEXT,
  
  -- Stack trace (optionnel, tronqué)
  stack_trace TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_events_user_id ON error_events(user_id);
CREATE INDEX IF NOT EXISTS idx_error_events_created_at ON error_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_events_error_code ON error_events(error_code);

-- ============================================
-- 12. FEATURE FLAGS (Configuration produit)
-- ============================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT UNIQUE NOT NULL,
  flag_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE skane_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_action_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_action_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : lecture publique pour catalogues
CREATE POLICY "micro_actions_read_public" ON micro_actions
  FOR SELECT USING (is_enabled = TRUE);

CREATE POLICY "state_action_map_read_public" ON state_action_map
  FOR SELECT USING (true);

CREATE POLICY "feature_flags_read_public" ON feature_flags
  FOR SELECT USING (true);

-- Politiques RLS : utilisateurs peuvent lire/écrire leurs propres données
CREATE POLICY "user_profile_own_data" ON user_profile
  FOR ALL USING (
    auth.uid()::text = user_id::text OR 
    guest = TRUE
  );

CREATE POLICY "skane_sessions_own_data" ON skane_sessions
  FOR ALL USING (
    user_id IS NULL OR 
    auth.uid()::text = user_id::text OR
    mode = 'guest'
  );

CREATE POLICY "micro_action_events_own_data" ON micro_action_events
  FOR ALL USING (
    user_id IS NULL OR 
    auth.uid()::text = user_id::text OR
    mode = 'guest'
  );

CREATE POLICY "share_events_own_data" ON share_events
  FOR ALL USING (
    user_id IS NULL OR 
    auth.uid()::text = user_id::text OR
    guest_id IS NOT NULL
  );

-- ============================================
-- 14. FONCTIONS UTILES
-- ============================================

-- Calculer user_lift moyen pour une action
CREATE OR REPLACE FUNCTION get_user_lift(
  p_user_id UUID,
  p_micro_action_id TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS FLOAT AS $$
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
$$ LANGUAGE plpgsql;

-- Calculer fatigue_penalty
CREATE OR REPLACE FUNCTION get_fatigue_penalty(
  p_user_id UUID,
  p_micro_action_id TEXT,
  p_lookback_sessions INTEGER DEFAULT 3
)
RETURNS FLOAT AS $$
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
$$ LANGUAGE plpgsql;

-- Mettre à jour last_seen_at
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profile
  SET last_seen_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_seen_on_session
  AFTER INSERT ON skane_sessions
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION update_last_seen();

-- ============================================
-- 15. TRIGGERS
-- ============================================

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_micro_actions_updated_at
  BEFORE UPDATE ON micro_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 16. VUES UTILES (Optionnel)
-- ============================================

-- Vue pour stats micro-actions
CREATE OR REPLACE VIEW micro_action_stats AS
SELECT 
  ma.id,
  ma.name,
  ma.base_weight,
  COUNT(mae.id) as total_uses,
  AVG(mae.effect::FLOAT) as avg_effect,
  COUNT(CASE WHEN mae.effect = 1 THEN 1 END) as better_count,
  COUNT(CASE WHEN mae.effect = -1 THEN 1 END) as worse_count,
  COUNT(CASE WHEN mae.completed = TRUE THEN 1 END) as completed_count
FROM micro_actions ma
LEFT JOIN micro_action_events mae ON ma.id = mae.micro_action_id
WHERE ma.is_enabled = TRUE
GROUP BY ma.id, ma.name, ma.base_weight;
