-- ============================================
-- MIGRATION: Enrichir skane_sessions
-- ============================================
-- Ajoute toutes les colonnes nécessaires pour l'analyse maximisée

-- Signaux faciaux, posturaux, respiratoires (JSONB)
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS facial_signals JSONB;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS postural_signals JSONB;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS respiratory_signals JSONB;

-- Niveau d'activation et signaux physiologiques (pas d'émotions)
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS activation_level INTEGER;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS tension_level INTEGER;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS fatigue_level INTEGER;

-- Recommandations
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS urgency TEXT;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS primary_need TEXT;

-- Contexte temporel
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS time_of_day TEXT;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS day_of_week INTEGER;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS local_hour INTEGER;

-- Qualité de l'analyse
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS image_quality FLOAT;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS lighting_quality FLOAT;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS analysis_duration_ms INTEGER;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS analysis_notes TEXT;

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_sessions_activation ON skane_sessions(activation_level);
CREATE INDEX IF NOT EXISTS idx_sessions_tension ON skane_sessions(tension_level);
CREATE INDEX IF NOT EXISTS idx_sessions_fatigue ON skane_sessions(fatigue_level);
CREATE INDEX IF NOT EXISTS idx_sessions_time_of_day ON skane_sessions(time_of_day);
CREATE INDEX IF NOT EXISTS idx_sessions_primary_need ON skane_sessions(primary_need);

-- ============================================
-- Table pour les données biométriques (Terra API)
-- ============================================
CREATE TABLE IF NOT EXISTS user_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Données Terra API
  hrv FLOAT,
  resting_heart_rate FLOAT,
  sleep_hours FLOAT,
  sleep_quality INTEGER, -- 0-100
  deep_sleep_hours FLOAT,
  rem_sleep_hours FLOAT,
  steps INTEGER,
  active_calories INTEGER,
  stress_score INTEGER, -- si disponible
  
  -- Source
  source TEXT, -- 'apple_health', 'oura', 'whoop', 'fitbit', 'garmin'
  raw_data JSONB,
  
  UNIQUE(user_id, recorded_at, source)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_biometrics_user_time ON user_biometrics(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_biometrics_source ON user_biometrics(source);

-- ============================================
-- Table pour le cache météo
-- ============================================
CREATE TABLE IF NOT EXISTS user_weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  
  temperature FLOAT,
  condition TEXT, -- 'sunny', 'cloudy', 'rainy', etc.
  humidity INTEGER,
  raw_data JSONB,
  
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_weather_cache_user ON user_weather_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_cache_fetched ON user_weather_cache(fetched_at);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE user_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weather_cache ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : utilisateurs peuvent lire/écrire leurs propres données
CREATE POLICY "user_biometrics_own_data" ON user_biometrics
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "user_weather_cache_own_data" ON user_weather_cache
  FOR ALL USING (auth.uid()::text = user_id::text);
