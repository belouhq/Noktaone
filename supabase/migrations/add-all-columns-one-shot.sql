-- ============================================
-- Migration ONE-SHOT: Ajouter TOUTES les colonnes manquantes
-- ============================================
-- Exécute cette migration UNE SEULE FOIS avant le seed
-- Cette version est ultra-robuste et vérifie tout

-- 1. is_enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'micro_actions' 
    AND column_name = 'is_enabled'
  ) THEN
    ALTER TABLE micro_actions ADD COLUMN is_enabled BOOLEAN DEFAULT TRUE;
    UPDATE micro_actions SET is_enabled = TRUE WHERE is_enabled IS NULL;
  END IF;
END $$;

-- 2. requires_premium
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'micro_actions' 
    AND column_name = 'requires_premium'
  ) THEN
    ALTER TABLE micro_actions ADD COLUMN requires_premium BOOLEAN DEFAULT FALSE;
    UPDATE micro_actions SET requires_premium = FALSE WHERE requires_premium IS NULL;
  END IF;
END $$;

-- 3. validation_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'micro_actions' 
    AND column_name = 'validation_status'
  ) THEN
    ALTER TABLE micro_actions ADD COLUMN validation_status TEXT DEFAULT 'approved';
    UPDATE micro_actions SET validation_status = 'approved' WHERE validation_status IS NULL;
  END IF;
END $$;

-- 4. Créer les index
CREATE INDEX IF NOT EXISTS idx_micro_actions_is_enabled 
ON micro_actions(is_enabled) 
WHERE is_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_micro_actions_requires_premium 
ON micro_actions(requires_premium) 
WHERE requires_premium = TRUE;

CREATE INDEX IF NOT EXISTS idx_micro_actions_validation_status 
ON micro_actions(validation_status);

-- 5. Vérification finale
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'micro_actions'
  AND column_name IN ('is_enabled', 'requires_premium', 'validation_status');
  
  IF col_count = 3 THEN
    RAISE NOTICE '✅ Toutes les colonnes ont été ajoutées avec succès';
  ELSE
    RAISE WARNING '⚠️ Seulement % colonnes trouvées (attendu: 3)', col_count;
  END IF;
END $$;
