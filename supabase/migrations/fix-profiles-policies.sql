-- ============================================
-- Migration: Fix policies pour la table profiles
-- ============================================
-- Cette migration supprime et recrée les policies pour éviter les conflits
-- Exécute cette migration si tu as l'erreur "policy already exists"

-- Supprimer les policies existantes (si elles existent)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recréer les policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
