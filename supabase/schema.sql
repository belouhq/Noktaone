-- ============================================
-- NOKTA ONE - Supabase Schema
-- ============================================
-- Schéma minimal pour tracking des micro-actions
-- avec algorithme de sélection basé sur feedback

-- ============================================
-- 1. Table user_profile
-- ============================================
CREATE TABLE IF NOT EXISTS user_profile (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  guest BOOLEAN DEFAULT FALSE,
  goal TEXT,
  username TEXT UNIQUE,
  email TEXT,
  -- Mode invité : user_id peut être NULL ou généré localement
  CONSTRAINT guest_check CHECK (
    (guest = TRUE AND user_id IS NOT NULL) OR
    (guest = FALSE AND username IS NOT NULL)
  )
);

-- ============================================
-- 2. Table skane_sessions
-- ============================================
CREATE TABLE IF NOT EXISTS skane_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  mode TEXT NOT NULL CHECK (mode IN ('guest', 'account')),
  state TEXT NOT NULL CHECK (state IN ('HIGH_ACTIVATION', 'LOW_ENERGY', 'REGULATED')),
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  signal_score INTEGER CHECK (signal_score >= 0 AND signal_score <= 100),
  skane_index_before INTEGER CHECK (skane_index_before >= 0 AND skane_index_before <= 100),
  skane_index_after INTEGER CHECK (skane_index_after >= 0 AND skane_index_after <= 100)
);

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_skane_sessions_user_id ON skane_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_created_at ON skane_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_mode ON skane_sessions(mode);

-- ============================================
-- 3. Table micro_actions
-- ============================================
CREATE TABLE IF NOT EXISTS micro_actions (
  id TEXT PRIMARY KEY, -- ex: 'physiological_sigh', 'box_breathing'
  name TEXT NOT NULL,
  name_key TEXT, -- Clé de traduction
  category TEXT NOT NULL CHECK (category IN ('relax', 'activate', 'center', 'recover')),
  base_weight FLOAT NOT NULL DEFAULT 50.0, -- % ressenti initial (0-100)
  duration_sec INTEGER NOT NULL,
  instructions JSONB, -- Stockage des instructions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Table micro_action_events
-- ============================================
CREATE TABLE IF NOT EXISTS micro_action_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  session_id UUID REFERENCES skane_sessions(id) ON DELETE CASCADE,
  micro_action_id TEXT NOT NULL REFERENCES micro_actions(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  effect INTEGER CHECK (effect IN (-1, 0, 1)), -- -1=pire, 0=pareil, 1=mieux
  ease INTEGER CHECK (ease IN (0, 1)), -- 0=dur, 1=facile (optionnel)
  mode TEXT NOT NULL CHECK (mode IN ('guest', 'account')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_micro_action_events_user_id ON micro_action_events(user_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_session_id ON micro_action_events(session_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_micro_action_id ON micro_action_events(micro_action_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_started_at ON micro_action_events(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_user_action ON micro_action_events(user_id, micro_action_id);

-- ============================================
-- 5. Table state_action_map (mapping state → candidates)
-- ============================================
CREATE TABLE IF NOT EXISTS state_action_map (
  state TEXT NOT NULL CHECK (state IN ('HIGH_ACTIVATION', 'LOW_ENERGY', 'REGULATED')),
  micro_action_id TEXT NOT NULL REFERENCES micro_actions(id),
  priority INTEGER DEFAULT 0, -- Ordre de priorité (plus bas = plus prioritaire)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (state, micro_action_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_state_action_map_state ON state_action_map(state);

-- ============================================
-- 6. Row Level Security (RLS)
-- ============================================
-- Activer RLS sur toutes les tables
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE skane_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_action_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_action_map ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : lecture publique pour micro_actions et state_action_map
CREATE POLICY "micro_actions_read_public" ON micro_actions
  FOR SELECT USING (true);

CREATE POLICY "state_action_map_read_public" ON state_action_map
  FOR SELECT USING (true);

-- Politiques RLS : utilisateurs peuvent lire/écrire leurs propres données
CREATE POLICY "user_profile_own_data" ON user_profile
  FOR ALL USING (auth.uid()::text = user_id::text OR guest = true);

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

-- ============================================
-- 7. Fonctions utiles
-- ============================================

-- Fonction pour calculer user_lift moyen pour une action
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
  
  -- user_lift = avg_effect * K (K = 10 par défaut)
  RETURN avg_effect * 10.0;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier fatigue (actions récentes)
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
  -- Compter combien de fois cette action a été utilisée dans les N dernières sessions
  SELECT COUNT(*)
  INTO recent_count
  FROM micro_action_events mae
  JOIN skane_sessions ss ON mae.session_id = ss.id
  WHERE mae.user_id = p_user_id
    AND mae.micro_action_id = p_micro_action_id
    AND ss.created_at >= (
      SELECT created_at
      FROM skane_sessions
      WHERE user_id = p_user_id
      ORDER BY created_at DESC
      LIMIT 1
      OFFSET p_lookback_sessions - 1
    );
  
  -- Pénalité progressive
  IF recent_count >= 1 THEN
    penalty := -15.0; -- Dernière session
  ELSIF recent_count >= 2 THEN
    penalty := -23.0; -- Avant-dernière + dernière
  ELSIF recent_count >= 3 THEN
    penalty := -30.0; -- 3 dernières
  END IF;
  
  RETURN penalty;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Données initiales (micro_actions)
-- ============================================
-- Les micro-actions seront insérées via l'application
-- ou un script de migration séparé

-- ============================================
-- 9. Triggers pour updated_at
-- ============================================
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
