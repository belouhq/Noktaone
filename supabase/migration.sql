-- ============================================
-- NOKTA ONE - Migration Script
-- ============================================
-- Ajoute les colonnes manquantes aux tables existantes
-- Exécutez ce script si vous avez déjà l'ancien schéma
-- ============================================

-- ============================================
-- 1. MIGRATION user_profile
-- ============================================

-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$ 
BEGIN
  -- Auth
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'last_seen_at') THEN
    ALTER TABLE user_profile ADD COLUMN last_seen_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'auth_provider') THEN
    ALTER TABLE user_profile ADD COLUMN auth_provider TEXT 
      CHECK (auth_provider IN ('email', 'apple', 'google'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'account_status') THEN
    ALTER TABLE user_profile ADD COLUMN account_status TEXT DEFAULT 'active' 
      CHECK (account_status IN ('active', 'banned', 'deleted'));
  END IF;
  
  -- Plan & Abonnement
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'plan') THEN
    ALTER TABLE user_profile ADD COLUMN plan TEXT DEFAULT 'free' 
      CHECK (plan IN ('free', 'premium'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'trial_started_at') THEN
    ALTER TABLE user_profile ADD COLUMN trial_started_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'trial_ends_at') THEN
    ALTER TABLE user_profile ADD COLUMN trial_ends_at TIMESTAMPTZ;
  END IF;
  
  -- Préférences
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'locale') THEN
    ALTER TABLE user_profile ADD COLUMN locale TEXT DEFAULT 'fr';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'timezone') THEN
    ALTER TABLE user_profile ADD COLUMN timezone TEXT DEFAULT 'UTC';
  END IF;
  
  -- RGPD & Consentements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'consent_version') THEN
    ALTER TABLE user_profile ADD COLUMN consent_version TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'consent_at') THEN
    ALTER TABLE user_profile ADD COLUMN consent_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'marketing_opt_in') THEN
    ALTER TABLE user_profile ADD COLUMN marketing_opt_in BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Mode invité
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'guest') THEN
    ALTER TABLE user_profile ADD COLUMN guest BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'guest_id') THEN
    ALTER TABLE user_profile ADD COLUMN guest_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profile' AND column_name = 'guest_converted_to_user_id') THEN
    ALTER TABLE user_profile ADD COLUMN guest_converted_to_user_id UUID;
  END IF;
END $$;

-- ============================================
-- 2. MIGRATION skane_sessions
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'skane_sessions' AND column_name = 'guest_id') THEN
    ALTER TABLE skane_sessions ADD COLUMN guest_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'skane_sessions' AND column_name = 'started_at') THEN
    ALTER TABLE skane_sessions ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'skane_sessions' AND column_name = 'ended_at') THEN
    ALTER TABLE skane_sessions ADD COLUMN ended_at TIMESTAMPTZ;
  END IF;
  
  -- Renommer 'state' en 'state_internal' si nécessaire
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'skane_sessions' AND column_name = 'state') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'skane_sessions' AND column_name = 'state_internal') THEN
    ALTER TABLE skane_sessions RENAME COLUMN state TO state_internal;
  END IF;
  
  -- Renommer 'signal_score' en 'signal_raw' si nécessaire
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'skane_sessions' AND column_name = 'signal_score') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'skane_sessions' AND column_name = 'signal_raw') THEN
    ALTER TABLE skane_sessions RENAME COLUMN signal_score TO signal_raw;
  END IF;
  
  -- Renommer 'skane_index_before' en 'before_score' si nécessaire
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'skane_sessions' AND column_name = 'skane_index_before') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'skane_sessions' AND column_name = 'before_score') THEN
    ALTER TABLE skane_sessions RENAME COLUMN skane_index_before TO before_score;
  END IF;
  
  -- Renommer 'skane_index_after' en 'after_score' si nécessaire
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'skane_sessions' AND column_name = 'skane_index_after') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'skane_sessions' AND column_name = 'after_score') THEN
    ALTER TABLE skane_sessions RENAME COLUMN skane_index_after TO after_score;
  END IF;
  
  -- Nouvelles colonnes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'skane_sessions' AND column_name = 'environment') THEN
    ALTER TABLE skane_sessions ADD COLUMN environment JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'skane_sessions' AND column_name = 'version_algo') THEN
    ALTER TABLE skane_sessions ADD COLUMN version_algo TEXT DEFAULT 'v1';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'skane_sessions' AND column_name = 'delta') THEN
    ALTER TABLE skane_sessions ADD COLUMN delta INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'skane_sessions' AND column_name = 'is_share_triggered') THEN
    ALTER TABLE skane_sessions ADD COLUMN is_share_triggered BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'skane_sessions' AND column_name = 'share_asset_id') THEN
    ALTER TABLE skane_sessions ADD COLUMN share_asset_id UUID;
  END IF;
END $$;

-- ============================================
-- 3. MIGRATION micro_action_events
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'guest_id') THEN
    ALTER TABLE micro_action_events ADD COLUMN guest_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'started_at') THEN
    ALTER TABLE micro_action_events ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'completed_at') THEN
    ALTER TABLE micro_action_events ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'completed') THEN
    ALTER TABLE micro_action_events ADD COLUMN completed BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'aborted_reason') THEN
    ALTER TABLE micro_action_events ADD COLUMN aborted_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'effort') THEN
    ALTER TABLE micro_action_events ADD COLUMN effort INTEGER 
      CHECK (effort IN (0, 1, 2));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'comment') THEN
    ALTER TABLE micro_action_events ADD COLUMN comment TEXT;
  END IF;
  
  -- Algorithme : décisions prises
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'candidates_shown') THEN
    ALTER TABLE micro_action_events ADD COLUMN candidates_shown JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'picked_action_id') THEN
    ALTER TABLE micro_action_events ADD COLUMN picked_action_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'selection_rule') THEN
    ALTER TABLE micro_action_events ADD COLUMN selection_rule TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'penalties_applied') THEN
    ALTER TABLE micro_action_events ADD COLUMN penalties_applied JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'micro_action_events' AND column_name = 'user_lift_used') THEN
    ALTER TABLE micro_action_events ADD COLUMN user_lift_used BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================
-- 4. CRÉER LES NOUVELLES TABLES (si elles n'existent pas)
-- ============================================

-- share_events
CREATE TABLE IF NOT EXISTS share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  guest_id UUID,
  session_id UUID REFERENCES skane_sessions(id) ON DELETE SET NULL,
  share_type TEXT CHECK (share_type IN ('story', 'tiktok', 'instagram', 'twitter', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_count INTEGER DEFAULT 0,
  install_count INTEGER DEFAULT 0,
  signup_count INTEGER DEFAULT 0,
  asset_url TEXT,
  asset_id TEXT
);

-- referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_code TEXT,
  attribution_source TEXT,
  signup_count INTEGER DEFAULT 0,
  active_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  plan_price_id TEXT,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- consent_log
CREATE TABLE IF NOT EXISTS consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  consent_at TIMESTAMPTZ DEFAULT NOW(),
  consent_type TEXT CHECK (consent_type IN ('privacy', 'marketing', 'analytics')),
  granted BOOLEAN DEFAULT TRUE,
  data_retention_policy_version TEXT,
  deletion_requested_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  export_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('plan_change', 'ban', 'unban', 'deletion', 'export')),
  action_details JSONB,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- error_events
CREATE TABLE IF NOT EXISTS error_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE SET NULL,
  guest_id UUID,
  error_code TEXT,
  error_message TEXT,
  screen TEXT,
  device_info JSONB,
  network_status TEXT,
  app_version TEXT,
  stack_trace TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- feature_flags
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

-- ============================================
-- 5. CRÉER LES INDEX MANQUANTS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profile_account_status ON user_profile(account_status);
CREATE INDEX IF NOT EXISTS idx_user_profile_plan ON user_profile(plan);
CREATE INDEX IF NOT EXISTS idx_user_profile_guest_id ON user_profile(guest_id);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_guest_id ON skane_sessions(guest_id);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_started_at ON skane_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_skane_sessions_state ON skane_sessions(state_internal);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_guest_id ON micro_action_events(guest_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_started_at ON micro_action_events(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_user_action ON micro_action_events(user_id, micro_action_id);
CREATE INDEX IF NOT EXISTS idx_micro_action_events_effect ON micro_action_events(effect) WHERE effect IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_share_events_user_id ON share_events(user_id);
CREATE INDEX IF NOT EXISTS idx_share_events_session_id ON share_events(session_id);
CREATE INDEX IF NOT EXISTS idx_share_events_created_at ON share_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_consent_log_user_id ON consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_consent_at ON consent_log(consent_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_events_user_id ON error_events(user_id);
CREATE INDEX IF NOT EXISTS idx_error_events_created_at ON error_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_events_error_code ON error_events(error_code);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- ============================================
-- 6. ACTIVER RLS SUR LES NOUVELLES TABLES
-- ============================================

ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CRÉER LES POLITIQUES RLS (si elles n'existent pas)
-- ============================================

-- Politiques pour les nouvelles tables
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'share_events' AND policyname = 'share_events_own_data') THEN
    CREATE POLICY "share_events_own_data" ON share_events
      FOR ALL USING (
        user_id IS NULL OR 
        auth.uid()::text = user_id::text OR
        guest_id IS NOT NULL
      );
  END IF;
END $$;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
