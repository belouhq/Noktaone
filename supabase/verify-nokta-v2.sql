-- ===========================================
-- Vérification migration nokta-v2
-- Exécuter dans Supabase SQL Editor
-- ===========================================

-- 1. Tables nokta_sessions et nokta_user_stats
SELECT 
  'Tables' AS type,
  table_name AS name,
  'OK' AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('nokta_sessions', 'nokta_user_stats')
ORDER BY table_name;

-- 2. Colonnes principales nokta_sessions
SELECT 
  'Column' AS type,
  table_name || '.' || column_name AS name,
  'OK' AS status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'nokta_sessions'
  AND column_name IN (
    'id', 'user_id', 'signal_before', 'signal_after',
    'internal_score_before', 'internal_score_after',
    'micro_action_id', 'micro_action_name', 'action_duration',
    'feedback', 'was_shared', 'device_info',
    'created_at', 'action_completed_at', 'feedback_at'
  )
ORDER BY column_name;

-- 3. Colonnes principales nokta_user_stats
SELECT 
  'Column' AS type,
  table_name || '.' || column_name AS name,
  'OK' AS status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'nokta_user_stats'
  AND column_name IN (
    'user_id', 'total_sessions', 'total_shares',
    'last_session_at', 'preferred_actions', 'updated_at'
  )
ORDER BY column_name;

-- 4. Fonction increment_user_session_count
SELECT 
  'Function' AS type,
  p.proname AS name,
  'OK' AS status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'increment_user_session_count';

-- 5. RLS activé
SELECT 
  'RLS' AS type,
  c.relname AS name,
  CASE WHEN c.relrowsecurity THEN 'OK' ELSE 'MISSING' END AS status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND c.relname IN ('nokta_sessions', 'nokta_user_stats')
  AND c.relkind = 'r';

-- 6. Policies sur nokta_sessions
SELECT 
  'Policy' AS type,
  pol.polname AS name,
  'OK' AS status
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND c.relname = 'nokta_sessions'
ORDER BY pol.polname;

-- 7. Index
SELECT 
  'Index' AS type,
  i.relname AS name,
  'OK' AS status
FROM pg_index ix
JOIN pg_class i ON ix.indexrelid = i.oid
JOIN pg_class t ON ix.indrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND t.relname = 'nokta_sessions'
  AND i.relname LIKE 'idx_nokta_%'
ORDER BY i.relname;
