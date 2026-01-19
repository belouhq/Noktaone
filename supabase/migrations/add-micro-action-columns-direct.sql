-- ============================================
-- Migration DIRECTE: Ajouter colonnes manquantes
-- ============================================
-- Version ultra-simple, exécute cette migration AVANT le seed
-- Copie-colle ce fichier dans Supabase SQL Editor

-- 1. Ajouter is_enabled
ALTER TABLE micro_actions 
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;

-- 2. Ajouter requires_premium  
ALTER TABLE micro_actions 
ADD COLUMN IF NOT EXISTS requires_premium BOOLEAN DEFAULT FALSE;

-- 3. Ajouter validation_status
ALTER TABLE micro_actions 
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'approved';

-- 4. Mettre à jour les valeurs existantes (si des lignes existent déjà)
UPDATE micro_actions 
SET is_enabled = TRUE 
WHERE is_enabled IS NULL;

UPDATE micro_actions 
SET requires_premium = FALSE 
WHERE requires_premium IS NULL;

UPDATE micro_actions 
SET validation_status = 'approved' 
WHERE validation_status IS NULL;

-- 5. Créer les index (optionnel mais recommandé)
CREATE INDEX IF NOT EXISTS idx_micro_actions_is_enabled 
ON micro_actions(is_enabled) 
WHERE is_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_micro_actions_requires_premium 
ON micro_actions(requires_premium) 
WHERE requires_premium = TRUE;

CREATE INDEX IF NOT EXISTS idx_micro_actions_validation_status 
ON micro_actions(validation_status);

-- 6. Vérification (optionnel - pour voir le résultat)
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'micro_actions'
-- AND column_name IN ('is_enabled', 'requires_premium', 'validation_status')
-- ORDER BY column_name;
