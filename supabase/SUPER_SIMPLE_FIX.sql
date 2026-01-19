-- ============================================
-- FIX SUPER SIMPLE - Copie-colle dans Supabase SQL Editor
-- ============================================
-- Exécute ce fichier COMPLET dans Supabase SQL Editor
-- Ne copie que le contenu, pas les commentaires de ce type

-- Étape 1: Vérifier que la table existe
SELECT 'Table micro_actions existe: ' || 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'micro_actions'
  ) THEN 'OUI' ELSE 'NON - EXÉCUTE D''ABORD schema-complete.sql' END;

-- Étape 2: Ajouter is_enabled (si pas déjà)
DO $$ 
BEGIN
  ALTER TABLE micro_actions ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;
  UPDATE micro_actions SET is_enabled = TRUE WHERE is_enabled IS NULL;
END $$;

-- Étape 3: Ajouter requires_premium (si pas déjà)
DO $$ 
BEGIN
  ALTER TABLE micro_actions ADD COLUMN IF NOT EXISTS requires_premium BOOLEAN DEFAULT FALSE;
  UPDATE micro_actions SET requires_premium = FALSE WHERE requires_premium IS NULL;
END $$;

-- Étape 4: Ajouter validation_status (si pas déjà)
DO $$ 
BEGIN
  ALTER TABLE micro_actions ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'approved';
  UPDATE micro_actions SET validation_status = 'approved' WHERE validation_status IS NULL;
END $$;

-- Étape 5: Vérification finale
SELECT 
  'is_enabled' as colonne,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'micro_actions' AND column_name = 'is_enabled'
  ) THEN '✅ EXISTE' ELSE '❌ MANQUANT' END as statut
UNION ALL
SELECT 
  'requires_premium',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'micro_actions' AND column_name = 'requires_premium'
  ) THEN '✅ EXISTE' ELSE '❌ MANQUANT' END
UNION ALL
SELECT 
  'validation_status',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'micro_actions' AND column_name = 'validation_status'
  ) THEN '✅ EXISTE' ELSE '❌ MANQUANT' END;
