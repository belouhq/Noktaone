-- ============================================
-- Vérification des données insérées
-- ============================================
-- Exécutez cette query dans le SQL Editor pour vérifier

-- 1. Compter les micro-actions
SELECT COUNT(*) as total_micro_actions FROM micro_actions;

-- 2. Compter les mappings
SELECT COUNT(*) as total_mappings FROM state_action_map;

-- 3. Voir toutes les micro-actions avec leur base_weight
SELECT 
  id, 
  name, 
  category,
  base_weight,
  duration_sec
FROM micro_actions 
ORDER BY base_weight DESC;

-- 4. Voir le mapping état → actions
SELECT 
  state,
  micro_action_id,
  priority
FROM state_action_map
ORDER BY state, priority;

-- 5. Vérifier les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profile',
    'skane_sessions', 
    'micro_actions',
    'micro_action_events',
    'state_action_map'
  )
ORDER BY table_name;
