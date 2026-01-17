-- ============================================
-- NOKTA ONE - Vérification Complète du Schéma
-- ============================================
-- Vérifie que toutes les tables et colonnes existent
-- ============================================

-- Vérifier les tables
SELECT 
  'Tables' as type,
  table_name as name,
  'OK' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profile',
    'skane_sessions', 
    'micro_actions',
    'micro_action_events',
    'state_action_map',
    'share_events',
    'referrals',
    'subscriptions',
    'consent_log',
    'audit_log',
    'error_events',
    'feature_flags'
  )
ORDER BY table_name;

-- Vérifier les colonnes importantes de user_profile
SELECT 
  'Column' as type,
  column_name as name,
  'OK' as status
FROM information_schema.columns
WHERE table_name = 'user_profile'
  AND column_name IN (
    'account_status',
    'auth_provider',
    'plan',
    'guest_id',
    'last_seen_at'
  )
ORDER BY column_name;

-- Vérifier les colonnes importantes de skane_sessions
SELECT 
  'Column' as type,
  column_name as name,
  'OK' as status
FROM information_schema.columns
WHERE table_name = 'skane_sessions'
  AND column_name IN (
    'state_internal',
    'guest_id',
    'version_algo',
    'environment',
    'before_score',
    'after_score',
    'delta'
  )
ORDER BY column_name;

-- Vérifier les colonnes importantes de micro_action_events
SELECT 
  'Column' as type,
  column_name as name,
  'OK' as status
FROM information_schema.columns
WHERE table_name = 'micro_action_events'
  AND column_name IN (
    'guest_id',
    'candidates_shown',
    'selection_rule',
    'penalties_applied',
    'user_lift_used',
    'picked_action_id'
  )
ORDER BY column_name;

-- Compter les micro-actions
SELECT 
  'Data' as type,
  'micro_actions count' as name,
  COUNT(*)::text as status
FROM micro_actions;

-- Compter les mappings state → action
SELECT 
  'Data' as type,
  'state_action_map count' as name,
  COUNT(*)::text as status
FROM state_action_map;

-- Vérifier les feature flags
SELECT 
  'Data' as type,
  'feature_flags count' as name,
  COUNT(*)::text as status
FROM feature_flags;
