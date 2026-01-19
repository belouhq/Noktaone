-- ============================================
-- Migration: Ajouter colonnes manquantes à micro_actions
-- ============================================
-- Si tu as besoin de requires_premium et validation_status

-- Ajouter requires_premium (optionnel)
ALTER TABLE micro_actions 
ADD COLUMN IF NOT EXISTS requires_premium BOOLEAN DEFAULT FALSE;

-- Ajouter validation_status (optionnel)
ALTER TABLE micro_actions 
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'approved' 
CHECK (validation_status IN ('pending', 'approved', 'rejected'));

-- Index pour requires_premium (si utilisé pour filtrer)
CREATE INDEX IF NOT EXISTS idx_micro_actions_requires_premium 
ON micro_actions(requires_premium) 
WHERE requires_premium = TRUE;

-- Index pour validation_status
CREATE INDEX IF NOT EXISTS idx_micro_actions_validation_status 
ON micro_actions(validation_status);
