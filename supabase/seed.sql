-- ============================================
-- NOKTA ONE - Seed Data
-- ============================================
-- Données initiales pour micro_actions et state_action_map
-- Basé sur les % de ressenti et le mapping existant

-- ============================================
-- 1. Insérer les micro-actions avec base_weight
-- ============================================
-- base_weight = % ressenti initial (0-100)

INSERT INTO micro_actions (id, name, name_key, category, base_weight, duration_sec, instructions) VALUES
-- HIGH_ACTIVATION actions (relax)
('physiological_sigh', 'Physiological Sigh', 'actions.physiologicalSigh', 'relax', 92.0, 24, '[]'::jsonb),
('expiration_3_8', 'Expiration longue', 'actions.expiration38', 'relax', 88.0, 33, '[]'::jsonb),
('drop_trapezes', 'Drop des trapèzes', 'actions.dropTrapezes', 'relax', 85.0, 20, '[]'::jsonb),
('shake_neuromusculaire', 'Shake neuromusculaire', 'actions.shakeNeuromusculaire', 'relax', 82.0, 20, '[]'::jsonb),

-- LOW_ENERGY actions (activate)
('respiration_2_1', 'Respiration énergisante', 'actions.respiration21', 'activate', 87.0, 30, '[]'::jsonb),
('posture_ancrage', 'Posture d''ancrage', 'actions.postureAncrage', 'activate', 84.0, 30, '[]'::jsonb),
('ouverture_thoracique', 'Ouverture thoracique', 'actions.ouvertureThoracique', 'activate', 81.0, 30, '[]'::jsonb),

-- REGULATED actions (center)
('box_breathing', 'Box Breathing', 'actions.boxBreathing', 'center', 89.0, 24, '[]'::jsonb),
('respiration_4_6', 'Respiration stabilisante', 'actions.respiration46', 'center', 86.0, 30, '[]'::jsonb),
('regard_fixe_expiration', 'Regard fixe + expiration', 'actions.regardFixeExpiration', 'center', 83.0, 24, '[]'::jsonb),

-- Bonus action
('pression_plantaire', 'Pression plantaire', 'actions.pressionPlantaire', 'center', 79.0, 20, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  base_weight = EXCLUDED.base_weight,
  updated_at = NOW();

-- ============================================
-- 2. Insérer le mapping state → actions
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
