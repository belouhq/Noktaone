-- ===========================================
-- NOKTA CORE (nokta-v2) - Tables & functions
-- Exécuter dans Supabase SQL Editor
-- ===========================================

-- nokta_sessions
CREATE TABLE IF NOT EXISTS nokta_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  signal_before TEXT NOT NULL CHECK (signal_before IN ('high', 'moderate', 'clear')),
  signal_after TEXT NOT NULL CHECK (signal_after IN ('high', 'moderate', 'clear')),

  internal_score_before JSONB NOT NULL,
  internal_score_after JSONB NOT NULL,

  micro_action_id TEXT NOT NULL,
  micro_action_name TEXT NOT NULL,
  action_duration INTEGER NOT NULL,

  feedback TEXT NOT NULL CHECK (feedback IN ('still_high', 'reduced', 'clear')),

  was_shared BOOLEAN NOT NULL DEFAULT FALSE,
  shared_at TIMESTAMPTZ,

  device_info JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_completed_at TIMESTAMPTZ NOT NULL,
  feedback_at TIMESTAMPTZ NOT NULL,

  CONSTRAINT valid_timestamps_nokta CHECK (
    action_completed_at >= created_at AND feedback_at >= action_completed_at
  )
);

CREATE INDEX IF NOT EXISTS idx_nokta_sessions_user_id ON nokta_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_nokta_sessions_created_at ON nokta_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nokta_sessions_feedback ON nokta_sessions(feedback);

-- nokta_user_stats
CREATE TABLE IF NOT EXISTS nokta_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_shares INTEGER NOT NULL DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  preferred_actions TEXT[] DEFAULT '{}',
  average_improvement NUMERIC(5,2) DEFAULT 0,
  clear_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- increment_user_session_count
CREATE OR REPLACE FUNCTION increment_user_session_count(p_user_id UUID, p_was_shared BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO nokta_user_stats (user_id, total_sessions, total_shares, last_session_at)
  VALUES (p_user_id, 1, CASE WHEN p_was_shared THEN 1 ELSE 0 END, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_sessions = nokta_user_stats.total_sessions + 1,
    total_shares = nokta_user_stats.total_shares + CASE WHEN p_was_shared THEN 1 ELSE 0 END,
    last_session_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE nokta_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nokta_user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own nokta sessions" ON nokta_sessions;
CREATE POLICY "Users can view own nokta sessions" ON nokta_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own nokta sessions" ON nokta_sessions;
CREATE POLICY "Users can insert own nokta sessions" ON nokta_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own nokta sessions" ON nokta_sessions;
CREATE POLICY "Users can update own nokta sessions" ON nokta_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own nokta stats" ON nokta_user_stats;
CREATE POLICY "Users can view own nokta stats" ON nokta_user_stats FOR SELECT USING (auth.uid() = user_id);
