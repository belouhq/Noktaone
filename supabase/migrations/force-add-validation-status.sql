-- ============================================
-- Migration FORCE: Ajouter validation_status (version directe)
-- ============================================
-- Cette version force l'ajout sans vérification préalable
-- Utilise cette version si les autres ne fonctionnent pas

-- Méthode 1: Essayer d'ajouter directement (échouera si existe déjà, c'est OK)
DO $$
BEGIN
  BEGIN
    ALTER TABLE micro_actions 
    ADD COLUMN validation_status TEXT DEFAULT 'approved';
    RAISE NOTICE '✅ Colonne validation_status ajoutée';
  EXCEPTION 
    WHEN duplicate_column THEN
      RAISE NOTICE 'ℹ️ Colonne validation_status existe déjà (c''est OK)';
  END;
END $$;

-- Mettre à jour les valeurs NULL (si des lignes existent)
UPDATE micro_actions 
SET validation_status = 'approved' 
WHERE validation_status IS NULL;

-- Vérification
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'micro_actions'
    AND column_name = 'validation_status'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE '✅ Vérification: validation_status existe bien';
  ELSE
    RAISE EXCEPTION '❌ ERREUR: validation_status n''existe toujours pas après l''ajout';
  END IF;
END $$;
