# 🔄 Guide de Migration vers le Schéma Complet

## ⚠️ Important

Le nouveau schéma (`schema-complete.sql`) **remplace** l'ancien (`schema.sql`). Il inclut **12 tables** au lieu de 5, avec toutes les fonctionnalités demandées.

## 📋 Ce qui change

### Tables ajoutées :
- ✅ `share_events` - Partage/viralité
- ✅ `referrals` - Parrainage
- ✅ `subscriptions` - Abonnements Stripe
- ✅ `consent_log` - RGPD/Conformité
- ✅ `audit_log` - Audit des modifications sensibles
- ✅ `error_events` - Bugs/Erreurs
- ✅ `feature_flags` - Configuration produit

### Tables améliorées :
- ✅ `user_profile` - Ajout de tous les champs Auth, Plan, RGPD
- ✅ `skane_sessions` - Ajout de version_algo, environment, share tracking
- ✅ `micro_action_events` - Ajout de l'algorithme de sélection (candidates_shown, selection_rule, etc.)

## 🚀 Migration

### Option 1 : Migration propre (Recommandé)

Si vous n'avez pas encore de données importantes :

1. **Supprimez les anciennes tables** (dans SQL Editor) :
```sql
DROP TABLE IF EXISTS micro_action_events CASCADE;
DROP TABLE IF EXISTS skane_sessions CASCADE;
DROP TABLE IF EXISTS state_action_map CASCADE;
DROP TABLE IF EXISTS micro_actions CASCADE;
DROP TABLE IF EXISTS user_profile CASCADE;
```

2. **Exécutez le nouveau schéma** :
   - Copiez-collez `supabase/schema-complete.sql`
   - Cliquez sur "Run"

3. **Exécutez le seed** :
   - Copiez-collez `supabase/seed-complete.sql`
   - Cliquez sur "Run"

### Option 2 : Migration avec données existantes

Si vous avez déjà des données à préserver :

1. **Exportez vos données** (via Table Editor → Export)
2. **Exécutez le nouveau schéma** (il utilise `CREATE TABLE IF NOT EXISTS`)
3. **Réimportez vos données** si nécessaire

## ✅ Vérification

Après migration, exécutez :

```sql
-- Vérifier toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profile',
    'skane_sessions', 
    'micro_actions',
    'micro_action_events',
    'state_action_map',
    'share_events',
    'referrals',
    'subscriptions',
    'consent_log',
    'audit_log',
    'error_events',
    'feature_flags'
  )
ORDER BY table_name;
```

Vous devriez voir **12 tables**.

## 📊 Structure complète

### 1. Auth & Profils
- `user_profile` - Comptes, plans, RGPD, mode invité

### 2. SKANE Core
- `skane_sessions` - Sessions avec état interne, version algo
- `micro_actions` - Catalogue avec feature flags
- `micro_action_events` - Exécutions + feedback + algorithme
- `state_action_map` - Mapping état → candidates

### 3. Social & Viralité
- `share_events` - Partages sociaux
- `referrals` - Parrainage

### 4. Business
- `subscriptions` - Abonnements Stripe

### 5. Conformité
- `consent_log` - RGPD
- `audit_log` - Audit trail

### 6. Qualité
- `error_events` - Bugs/Erreurs
- `feature_flags` - Configuration produit

## 🎯 Prochaines étapes

1. ✅ Exécuter `schema-complete.sql`
2. ✅ Exécuter `seed-complete.sql`
3. ✅ Vérifier les 12 tables
4. ✅ Mettre à jour le code pour utiliser les nouvelles colonnes
