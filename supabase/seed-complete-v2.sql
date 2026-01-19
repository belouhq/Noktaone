-- ============================================
-- NOKTA ONE - Seed Data Complet V2
-- ============================================
-- Données initiales pour micro_actions, state_action_map, feature_flags
-- Compatible avec schema-complete.sql
-- ============================================

-- ============================================
-- 1. Micro-actions avec base_weight
-- ============================================
-- Note: Si requires_premium et validation_status existent, ils seront utilisés
-- Sinon, utilise seed-complete.sql qui n'inclut que is_enabled

INSERT INTO micro_actions (
  id, 
  name, 
  name_key, 
  category, 
  base_weight, 
  duration_sec, 
  instructions, 
  is_enabled
) VALUES
-- HIGH_ACTIVATION actions (relax)
('physiological_sigh', 'Physiological Sigh', 'actions.physiologicalSigh', 'relax', 92.0, 24, '[]'::jsonb, TRUE),
('expiration_3_8', 'Expiration longue', 'actions.expiration38', 'relax', 88.0, 33, '[]'::jsonb, TRUE),
('drop_trapezes', 'Drop des trapèzes', 'actions.dropTrapezes', 'relax', 85.0, 20, '[]'::jsonb, TRUE),
('shake_neuromusculaire', 'Shake neuromusculaire', 'actions.shakeNeuromusculaire', 'relax', 82.0, 20, '[]'::jsonb, TRUE),

-- LOW_ENERGY actions (activate)
('respiration_2_1', 'Respiration énergisante', 'actions.respiration21', 'activate', 87.0, 30, '[]'::jsonb, TRUE),
('posture_ancrage', 'Posture d''ancrage', 'actions.postureAncrage', 'activate', 84.0, 30, '[]'::jsonb, TRUE),
('ouverture_thoracique', 'Ouverture thoracique', 'actions.ouvertureThoracique', 'activate', 81.0, 30, '[]'::jsonb, TRUE),

-- REGULATED actions (center)
('box_breathing', 'Box Breathing', 'actions.boxBreathing', 'center', 89.0, 24, '[]'::jsonb, TRUE),
('respiration_4_6', 'Respiration stabilisante', 'actions.respiration46', 'center', 86.0, 30, '[]'::jsonb, TRUE),
('regard_fixe_expiration', 'Regard fixe + expiration', 'actions.regardFixeExpiration', 'center', 83.0, 24, '[]'::jsonb, TRUE),

-- Bonus action
('pression_plantaire', 'Pression plantaire', 'actions.pressionPlantaire', 'center', 79.0, 20, '[]'::jsonb, TRUE)
ON CONFLICT (id) DO UPDATE SET
  base_weight = EXCLUDED.base_weight,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = NOW();

-- ============================================
-- 2. Mapping état → actions
-- ============================================
INSERT INTO state_action_map (state, micro_action_id, priority) VALUES
-- HIGH_ACTIVATION
('HIGH_ACTIVATION', 'physiological_sigh', 1),
('HIGH_ACTIVATION', 'expiration_3_8', 2),
('HIGH_ACTIVATION', 'drop_trapezes', 3),
('HIGH_ACTIVATION', 'shake_neuromusculaire', 4),

-- LOW_ENERGY
('LOW_ENERGY', 'respiration_2_1', 1),
('LOW_ENERGY', 'posture_ancrage', 2),
('LOW_ENERGY', 'ouverture_thoracique', 3),

-- REGULATED
('REGULATED', 'box_breathing', 1),
('REGULATED', 'respiration_4_6', 2),
('REGULATED', 'regard_fixe_expiration', 3)
ON CONFLICT (state, micro_action_id) DO NOTHING;

-- ============================================
-- 3. Feature Flags initiaux (si la table existe)
-- ============================================
INSERT INTO feature_flags (flag_key, flag_name, enabled, rollout_percentage, description) 
SELECT * FROM (VALUES
  ('guest_mode', 'Mode Invité', TRUE, 100, 'Activer le mode invité'),
  ('premium_features', 'Fonctionnalités Premium', FALSE, 0, 'Fonctionnalités réservées aux abonnés'),
  ('share_social', 'Partage Social', TRUE, 100, 'Activer le partage sur réseaux sociaux'),
  ('advanced_analytics', 'Analytics Avancées', FALSE, 50, 'Analytics détaillées (rollout progressif)')
) AS v(flag_key, flag_name, enabled, rollout_percentage, description)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_flags')
ON CONFLICT (flag_key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  updated_at = NOW();
