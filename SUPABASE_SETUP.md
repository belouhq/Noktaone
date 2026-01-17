# 🗄️ Configuration Supabase

## Étape 1 : Créer les tables

1. Allez sur votre [dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (menu de gauche)
4. Cliquez sur **"New query"**
5. Copiez-collez le contenu de `supabase/schema.sql`
6. Cliquez sur **"Run"** (ou `Cmd+Enter` / `Ctrl+Enter`)

✅ Vous devriez voir : "Success. No rows returned"

## Étape 2 : Seed les données initiales

1. Toujours dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez-collez le contenu de `supabase/seed.sql`
4. Cliquez sur **"Run"**

✅ Vous devriez voir : "Success. 11 rows inserted" (ou similaire)

## Étape 3 : Vérifier les tables

1. Allez dans **Table Editor** (menu de gauche)
2. Vous devriez voir 5 tables :
   - `user_profile`
   - `skane_sessions`
   - `micro_actions`
   - `micro_action_events`
   - `state_action_map`

## Étape 4 : Vérifier les données

Dans **Table Editor**, ouvrez `micro_actions` :
- Vous devriez voir 11 micro-actions avec leurs `base_weight`
- Exemple : `physiological_sigh` avec `base_weight = 92.0`

Ouvrez `state_action_map` :
- Vous devriez voir le mapping état → actions
- Exemple : `HIGH_ACTIVATION` → `physiological_sigh`, `expiration_3_8`, etc.

## 🔍 Tester la connexion

```bash
# Depuis le terminal
npm run test-supabase
```

Ou visitez : `http://localhost:3000/api/supabase/test`

## ✅ C'est prêt !

Votre base de données est configurée et prête à tracker les sessions SKANE.

## 📊 Requêtes utiles (SQL Editor)

### Voir toutes les sessions
```sql
SELECT * FROM skane_sessions ORDER BY created_at DESC LIMIT 10;
```

### Voir les feedbacks
```sql
SELECT 
  mae.micro_action_id,
  mae.effect,
  mae.mode,
  mae.created_at
FROM micro_action_events mae
ORDER BY mae.created_at DESC
LIMIT 20;
```

### Calculer les stats par action
```sql
SELECT 
  micro_action_id,
  COUNT(*) as total_uses,
  AVG(effect::float) as avg_effect,
  COUNT(CASE WHEN effect = 1 THEN 1 END) as better_count,
  COUNT(CASE WHEN effect = -1 THEN 1 END) as worse_count
FROM micro_action_events
WHERE effect IS NOT NULL
GROUP BY micro_action_id
ORDER BY avg_effect DESC;
```
