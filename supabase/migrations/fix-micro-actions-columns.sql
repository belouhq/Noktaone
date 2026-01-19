-- ============================================
-- Migration: Ajouter toutes les colonnes manquantes à micro_actions
-- ============================================
-- Cette migration ajoute is_enabled, requires_premium et validation_status
-- si elles n'existent pas déjà

-- 1. Ajouter is_enabled (si pas déjà présent)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'micro_actions' 
    AND column_name = 'is_enabled'
  ) THEN
    ALTER TABLE micro_actions 
    ADD COLUMN is_enabled BOOLEAN DEFAULT TRUE;
    
    -- Mettre toutes les actions existantes à enabled par défaut
    UPDATE micro_actions SET is_enabled = TRUE WHERE is_enabled IS NULL;
  END IF;
END $$;

-- 2. Ajouter requires_premium (si pas déjà présent)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'micro_actions' 
    AND column_name = 'requires_premium'
  ) THEN
    ALTER TABLE micro_actions 
    ADD COLUMN requires_premium BOOLEAN DEFAULT FALSE;
    
    -- Mettre toutes les actions existantes à false par défaut
    UPDATE micro_actions SET requires_premium = FALSE WHERE requires_premium IS NULL;
  END IF;
END $$;

-- 3. Ajouter validation_status (si pas déjà présent)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'micro_actions' 
    AND column_name = 'validation_status'
  ) THEN
    ALTER TABLE micro_actions 
    ADD COLUMN validation_status TEXT DEFAULT 'approved' 
    CHECK (validation_status IN ('pending', 'approved', 'rejected'));
    
    -- Mettre toutes les actions existantes à approved par défaut
    UPDATE micro_actions SET validation_status = 'approved' WHERE validation_status IS NULL;
  END IF;
END $$;

-- 4. Créer les index si nécessaire
CREATE INDEX IF NOT EXISTS idx_micro_actions_is_enabled 
ON micro_actions(is_enabled) 
WHERE is_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_micro_actions_requires_premium 
ON micro_actions(requires_premium) 
WHERE requires_premium = TRUE;

CREATE INDEX IF NOT EXISTS idx_micro_actions_validation_status 
ON micro_actions(validation_status);

-- 5. Commentaires pour documentation
COMMENT ON COLUMN micro_actions.is_enabled IS 'Indique si l''action est activée et disponible';
COMMENT ON COLUMN micro_actions.requires_premium IS 'Indique si l''action nécessite un abonnement premium';
COMMENT ON COLUMN micro_actions.validation_status IS 'Statut de validation de l''action (pending, approved, rejected)';
