-- ============================================
-- MIGRATION: User Stats pour Historique
-- Nokta One - Janvier 2026
-- ============================================

-- ============================================
-- 0. COLONNES OPTIONNELLES SUR skane_sessions
-- ============================================

ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'ok';
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS was_shared BOOLEAN DEFAULT FALSE;
-- Alias pour compatibilité (RPC retourne skane_index_*)
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS skane_index_before INTEGER;
ALTER TABLE skane_sessions ADD COLUMN IF NOT EXISTS skane_index_after INTEGER;

-- ============================================
-- 1. AJOUTER COLONNES STATS À user_profile
-- ============================================

ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS streak_best INTEGER DEFAULT 0;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS total_skanes INTEGER DEFAULT 0;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS last_skane_date DATE;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS average_improvement DECIMAL(5,2) DEFAULT 0;

COMMENT ON COLUMN user_profile.streak_current IS 'Streak actuel en jours consécutifs';
COMMENT ON COLUMN user_profile.streak_best IS 'Meilleur streak jamais atteint';
COMMENT ON COLUMN user_profile.total_skanes IS 'Nombre total de skanes effectués';
COMMENT ON COLUMN user_profile.last_skane_date IS 'Date du dernier skane (pour calcul streak)';
COMMENT ON COLUMN user_profile.average_improvement IS 'Amélioration moyenne en %';

-- ============================================
-- 2. FONCTION POUR CALCULER LE DELTA
-- ============================================

CREATE OR REPLACE FUNCTION calculate_skane_delta(
  index_before INTEGER,
  index_after INTEGER
) RETURNS INTEGER AS $$
BEGIN
  IF index_before IS NULL OR index_after IS NULL THEN
    RETURN 0;
  END IF;
  IF index_before = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND(((index_before - index_after)::DECIMAL / index_before) * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 3. FONCTION POUR METTRE À JOUR LE STREAK
-- ============================================

CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_best_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT last_skane_date, streak_current, streak_best
  INTO v_last_date, v_current_streak, v_best_streak
  FROM user_profile
  WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF v_last_date IS NULL THEN
    v_current_streak := 1;
  ELSIF v_last_date = v_today THEN
    NULL;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    v_current_streak := 1;
  END IF;

  IF v_current_streak > COALESCE(v_best_streak, 0) THEN
    v_best_streak := v_current_streak;
  END IF;

  UPDATE user_profile
  SET 
    streak_current = v_current_streak,
    streak_best = v_best_streak,
    total_skanes = total_skanes + 1,
    last_skane_date = v_today,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TRIGGER POUR AUTO-UPDATE STREAK
-- ============================================

DROP TRIGGER IF EXISTS trg_update_streak ON skane_sessions;

CREATE TRIGGER trg_update_streak
AFTER INSERT ON skane_sessions
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL AND (NEW.validation_status = 'ok' OR NEW.validation_status IS NULL))
EXECUTE FUNCTION update_user_streak();

-- ============================================
-- 5. FONCTION POUR METTRE À JOUR MOYENNE
-- (Utilise before_score/after_score ou skane_index_before/after selon colonnes existantes)
-- ============================================

CREATE OR REPLACE FUNCTION update_average_improvement()
RETURNS TRIGGER AS $$
DECLARE
  v_avg DECIMAL(5,2);
  v_before INTEGER;
  v_after INTEGER;
BEGIN
  SELECT COALESCE(AVG(
    calculate_skane_delta(
      COALESCE(ss.skane_index_before, ss.before_score),
      COALESCE(ss.skane_index_after, ss.after_score)
    )
  ), 0)
  INTO v_avg
  FROM skane_sessions ss
  WHERE ss.user_id = NEW.user_id
    AND (ss.validation_status = 'ok' OR ss.validation_status IS NULL)
    AND (COALESCE(ss.skane_index_before, ss.before_score) IS NOT NULL)
    AND (COALESCE(ss.skane_index_after, ss.after_score) IS NOT NULL);

  UPDATE user_profile
  SET average_improvement = v_avg, updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_avg ON skane_sessions;

CREATE TRIGGER trg_update_avg
AFTER INSERT ON skane_sessions
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL AND (NEW.validation_status = 'ok' OR NEW.validation_status IS NULL))
EXECUTE FUNCTION update_average_improvement();

-- ============================================
-- 6. FONCTION RPC POUR FETCH HISTORIQUE
-- (Retourne skane_index_before/after pour le client; lit before_score/after_score ou skane_index_*)
-- ============================================

CREATE OR REPLACE FUNCTION get_user_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  started_at TIMESTAMPTZ,
  state_internal TEXT,
  skane_index_before INTEGER,
  skane_index_after INTEGER,
  delta INTEGER,
  was_shared BOOLEAN,
  date_relative TEXT,
  time_formatted TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    COALESCE(s.started_at, s.created_at),
    s.state_internal,
    (COALESCE(s.skane_index_before, s.before_score))::INTEGER,
    (COALESCE(s.skane_index_after, s.after_score))::INTEGER,
    calculate_skane_delta(
      COALESCE(s.skane_index_before, s.before_score),
      COALESCE(s.skane_index_after, s.after_score)
    ),
    COALESCE(s.was_shared, FALSE),
    CASE 
      WHEN DATE(COALESCE(s.started_at, s.created_at)) = CURRENT_DATE THEN 'today'
      WHEN DATE(COALESCE(s.started_at, s.created_at)) = CURRENT_DATE - INTERVAL '1 day' THEN 'yesterday'
      ELSE TO_CHAR(COALESCE(s.started_at, s.created_at), 'YYYY-MM-DD')
    END,
    TO_CHAR(COALESCE(s.started_at, s.created_at), 'HH24:MI')
  FROM skane_sessions s
  WHERE s.user_id = p_user_id
    AND (s.validation_status = 'ok' OR s.validation_status IS NULL)
  ORDER BY COALESCE(s.started_at, s.created_at) DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 7. FONCTION RPC POUR STATS UTILISATEUR
-- ============================================

CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  streak_current INTEGER,
  streak_best INTEGER,
  total_skanes INTEGER,
  average_improvement DECIMAL(5,2),
  last_skane_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(up.streak_current, 0),
    COALESCE(up.streak_best, 0),
    COALESCE(up.total_skanes, 0),
    COALESCE(up.average_improvement, 0),
    up.last_skane_date
  FROM user_profile up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 8. INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_skane_sessions_user_date 
ON skane_sessions(user_id, started_at DESC NULLS LAST) 
WHERE (validation_status = 'ok' OR validation_status IS NULL);

CREATE INDEX IF NOT EXISTS idx_skane_sessions_user_validation 
ON skane_sessions(user_id, validation_status);

-- ============================================
-- 9. FONCTION POUR RESET STREAK QUOTIDIEN
-- ============================================

CREATE OR REPLACE FUNCTION reset_broken_streaks()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_profile
  SET 
    streak_current = 0,
    updated_at = NOW()
  WHERE last_skane_date < CURRENT_DATE - INTERVAL '1 day'
    AND streak_current > 0;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. GRANT EXECUTE RPC
-- ============================================

GRANT EXECUTE ON FUNCTION get_user_history(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
