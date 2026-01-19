# 🔧 Fix: Colonnes manquantes dans micro_actions

## ❌ Erreurs rencontrées

```
Error: Failed to run sql query: ERROR: 42703: column "is_enabled" of relation "micro_actions" does not exist
Error: Failed to run sql query: ERROR: 42703: column "validation_status" does not exist
```

## ✅ Solution

Exécute la migration suivante dans Supabase SQL Editor :

### 1. Exécuter la migration

**Option A (Recommandée - Version simple)** :
Copie-colle le contenu de `supabase/migrations/add-micro-action-columns-direct.sql` dans Supabase SQL Editor et exécute-le.

**Option B (Version avec vérifications)** :
Copie-colle le contenu de `supabase/migrations/fix-micro-actions-columns.sql` dans Supabase SQL Editor et exécute-le.

Cette migration :
- ✅ Ajoute `is_enabled` si elle n'existe pas
- ✅ Ajoute `requires_premium` si elle n'existe pas  
- ✅ Ajoute `validation_status` si elle n'existe pas
- ✅ Crée les index nécessaires
- ✅ Met à jour les valeurs existantes avec des valeurs par défaut

### 2. Vérifier que les colonnes existent

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'micro_actions'
ORDER BY ordinal_position;
```

Tu devrais voir :
- `is_enabled` (BOOLEAN, default TRUE)
- `requires_premium` (BOOLEAN, default FALSE)
- `validation_status` (TEXT, default 'approved')

### 3. Ré-exécuter le seed

Une fois la migration exécutée, tu peux ré-exécuter ton seed :

```sql
-- Utilise seed-complete-v2.sql qui est compatible
```

## 📋 Ordre d'exécution recommandé

1. **Schéma** : `schema-complete.sql` (si pas déjà fait)
2. **Migration** : `migrations/fix-micro-actions-columns.sql` (NOUVEAU)
3. **Seed** : `seed-complete-v2.sql` (ou `seed-complete.sql`)

## 🔍 Vérification rapide

```sql
-- Vérifier la structure
\d micro_actions

-- Vérifier les données
SELECT id, name, is_enabled, requires_premium, validation_status 
FROM micro_actions 
LIMIT 5;
```

## ⚠️ Note

Si tu as déjà des données dans `micro_actions`, la migration :
- Met `is_enabled = TRUE` pour toutes les actions existantes
- Met `requires_premium = FALSE` pour toutes les actions existantes
- Met `validation_status = 'approved'` pour toutes les actions existantes

Tu peux ajuster ces valeurs après si nécessaire.
