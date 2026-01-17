# 📋 Instructions pour copier le schéma SQL

## ⚠️ Problème courant

Vous avez collé le **nom du fichier** (`supabase/schema.sql`) au lieu du **contenu SQL**.

## ✅ Solution rapide

### Option 1 : Via Terminal (Mac)

```bash
# Depuis le dossier du projet
cd "/Users/benjaminbel/nokta-app/Nokta One"

# Copier le contenu dans le presse-papiers
cat supabase/schema.sql | pbcopy
```

Puis dans le SQL Editor de Supabase : **Cmd+V** pour coller.

### Option 2 : Via l'éditeur

1. Ouvrez le fichier `supabase/schema.sql` dans Cursor/VS Code
2. **Sélectionnez tout** : `Cmd+A` (Mac) ou `Ctrl+A` (Windows)
3. **Copiez** : `Cmd+C` ou `Ctrl+C`
4. Dans le SQL Editor de Supabase, **effacez** `supabase/schema.sql`
5. **Collez** : `Cmd+V` ou `Ctrl+V`
6. Cliquez sur **"Run"**

## 📝 Ce que vous devriez voir

Le contenu devrait commencer par :
```sql
-- ============================================
-- NOKTA ONE - Supabase Schema
-- ============================================
-- Schéma minimal pour tracking des micro-actions
-- avec algorithme de sélection basé sur feedback

-- ============================================
-- 1. Table user_profile
-- ============================================
CREATE TABLE IF NOT EXISTS user_profile (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
```

**PAS** juste `supabase/schema.sql` !

## 🔄 Après le schéma

Une fois le schéma exécuté avec succès, faites la même chose avec `supabase/seed.sql` :

```bash
cat supabase/seed.sql | pbcopy
```

Puis collez dans une nouvelle query et exécutez.
