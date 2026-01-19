# ⚡ Fix Rapide : Policy "Users can view own profile" existe déjà

## 🎯 Solution en 1 étape

Dans **Supabase SQL Editor**, copie-colle et exécute ceci :

```sql
-- Supprimer les policies existantes
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
```

## 🔍 Vérification

Après l'exécution, vérifie que les policies existent :

```sql
-- Lister les policies sur profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
```

Tu devrais voir 3 policies.

## 📝 Note

Cette erreur se produit quand :
- Tu exécutes `schema-simple.sql` plusieurs fois
- La table `profiles` existe déjà avec des policies
- Un autre script crée les policies sans vérifier d'abord

La solution ci-dessus supprime et recrée les policies proprement.

## 🔄 Alternative : Utiliser la migration

Tu peux aussi utiliser le fichier de migration :
```
supabase/migrations/fix-profiles-policies.sql
```
