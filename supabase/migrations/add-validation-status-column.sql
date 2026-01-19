-- ============================================
-- Migration ULTRA-SIMPLE: Ajouter validation_status
-- ============================================
-- Exécute cette migration AVANT tout seed qui utilise validation_status

-- Vérifier et ajouter la colonne validation_status
DO $$
BEGIN
  -- Vérifier si la colonne existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'micro_actions'
    AND column_name = 'validation_status'
  ) THEN
    -- Ajouter la colonne
    ALTER TABLE micro_actions 
    ADD COLUMN validation_status TEXT DEFAULT 'approved';
    
    -- Mettre à jour les valeurs existantes
    UPDATE micro_actions 
    SET validation_status = 'approved' 
    WHERE validation_status IS NULL;
    
    RAISE NOTICE 'Colonne validation_status ajoutée avec succès';
  ELSE
    RAISE NOTICE 'Colonne validation_status existe déjà';
  END IF;
END $$;

-- Vérification (optionnel)
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'micro_actions'
-- AND column_name = 'validation_status';
