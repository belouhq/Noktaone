# 🔧 Résolution des erreurs de seed

## Problème

Erreurs lors de l'exécution du seed :
- `column "is_enabled" of relation "micro_actions" does not exist`
- `column "validation_status" does not exist`

## Solution 1 : Utiliser le schéma complet (Recommandé)

Si tu veux utiliser toutes les fonctionnalités (feature flags, etc.) :

1. **Exécuter le schéma complet** :
   ```sql
   -- Dans Supabase SQL Editor
   -- Copier-coller le contenu de supabase/schema-complete.sql
   ```

2. **Exécuter le seed complet** :
   ```sql
   -- Copier-coller le contenu de supabase/seed-complete.sql
   ```

Le seed-complete.sql utilise uniquement `is_enabled` qui existe dans le schéma complet.

## Solution 2 : Ajouter les colonnes manquantes

Si tu as déjà exécuté le schéma simple et que tu veux ajouter les colonnes manquantes :

1. **Exécuter la migration** :
   ```sql
   -- Copier-coller le contenu de supabase/migration-add-micro-action-columns.sql
   ```

2. **Ensuite exécuter le seed** :
   ```sql
   -- Utiliser supabase/seed-complete.sql ou seed-complete-v2.sql
   ```

## Solution 3 : Utiliser le schéma simple

Si tu veux rester avec le schéma minimal :

1. **Exécuter le schéma simple** :
   ```sql
   -- Copier-coller le contenu de supabase/schema.sql
   ```

2. **Exécuter le seed simple** :
   ```sql
   -- Copier-coller le contenu de supabase/seed.sql
   ```

Le seed.sql n'utilise pas `is_enabled`, `requires_premium` ni `validation_status`.

## Vérification

Pour vérifier quelles colonnes existent dans `micro_actions` :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'micro_actions'
ORDER BY ordinal_position;
```

## Fichiers disponibles

| Fichier | Description |
|---------|-------------|
| `schema.sql` | Schéma minimal (5 tables) |
| `schema-complete.sql` | Schéma complet (20 tables) avec `is_enabled` |
| `seed.sql` | Seed pour schéma simple (sans `is_enabled`) |
| `seed-complete.sql` | Seed pour schéma complet (avec `is_enabled`) |
| `seed-complete-v2.sql` | Seed compatible avec les deux schémas |
| `migration-add-micro-action-columns.sql` | Ajoute `requires_premium` et `validation_status` |

## Recommandation

Pour Nokta One v2, utilise :
1. `schema-complete.sql` 
2. `seed-complete.sql`

Ces fichiers sont compatibles et n'incluent que les colonnes qui existent dans le schéma.
