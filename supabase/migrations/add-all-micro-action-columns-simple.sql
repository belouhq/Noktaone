-- ============================================
-- Migration SIMPLE: Ajouter colonnes manquantes
-- ============================================
-- Version simplifiée sans DO blocks pour éviter les problèmes
-- Exécute cette migration AVANT le seed

-- Ajouter is_enabled
ALTER TABLE micro_actions 
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;

-- Ajouter requires_premium
ALTER TABLE micro_actions 
ADD COLUMN IF NOT EXISTS requires_premium BOOLEAN DEFAULT FALSE;

-- Ajouter validation_status
ALTER TABLE micro_actions 
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'approved';

-- Ajouter la contrainte CHECK pour validation_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'micro_actions_validation_status_check'
  ) THEN
    ALTER TABLE micro_actions 
    ADD CONSTRAINT micro_actions_validation_status_check 
    CHECK (validation_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Mettre à jour les valeurs existantes
UPDATE micro_actions 
SET 
  is_enabled = COALESCE(is_enabled, TRUE),
  requires_premium = COALESCE(requires_premium, FALSE),
  validation_status = COALESCE(validation_status, 'approved')
WHERE is_enabled IS NULL 
   OR requires_premium IS NULL 
   OR validation_status IS NULL;

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_micro_actions_is_enabled 
ON micro_actions(is_enabled) 
WHERE is_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_micro_actions_requires_premium 
ON micro_actions(requires_premium) 
WHERE requires_premium = TRUE;

CREATE INDEX IF NOT EXISTS idx_micro_actions_validation_status 
ON micro_actions(validation_status);
