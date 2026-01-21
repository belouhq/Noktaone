# 🔒 Corrections de Sécurité Supabase

## Problèmes identifiés et corrigés

### 1. ✅ Security Definer View - `share_conversion_funnel`

**Problème :**
- La vue `share_conversion_funnel` utilisait `SECURITY DEFINER`, ce qui signifie qu'elle s'exécutait avec les permissions du créateur de la vue plutôt que de l'utilisateur qui l'interroge.
- **Risque** : Bypass potentiel des politiques RLS si la vue est créée par un utilisateur privilégié.

**Solution :**
- Recréation de la vue **sans** `SECURITY DEFINER`
- La vue utilise maintenant les permissions de l'utilisateur qui l'interroge
- Les politiques RLS sur `share_events` sont respectées

**Migration :** `supabase/migrations/fix_security_issues.sql`

---

### 2. ✅ RLS Disabled - `share_click_events`

**Problème :**
- La table `share_click_events` n'avait pas Row Level Security (RLS) activé
- **Risque** : Accès non contrôlé aux données de tracking des clics

**Solution :**
- Activation de RLS sur `share_click_events`
- Ajout de 3 politiques :
  1. **Service role** : Accès complet (pour les API routes)
  2. **Users read** : Les utilisateurs peuvent lire leurs propres événements de clic (via `share_events.user_id`)
  3. **Users insert** : Les utilisateurs peuvent insérer des événements pour leurs propres partages

**Migration :** `supabase/migrations/fix_security_issues.sql`

---

### 3. ✅ RLS Disabled - `sms_unsubscribes`

**Problème :**
- La table `sms_unsubscribes` n'avait pas RLS activé (ou mal configuré)
- **Risque** : Accès non contrôlé aux données de désabonnement SMS

**Solution :**
- Activation explicite de RLS sur `sms_unsubscribes`
- Ajout de 2 politiques :
  1. **Service role** : Accès complet (pour les webhooks Twilio et cron jobs)
  2. **Users read** : Les utilisateurs peuvent lire leur propre statut de désabonnement (via `user_profiles.phone`)

**Migration :** `supabase/migrations/fix_security_issues.sql`

---

### 4. ✅ RLS Enabled No Policy (7 tables)

**Problème :**
- 7 tables avaient RLS activé mais aucune politique n'était définie
- **Risque** : RLS activé sans politique = accès refusé par défaut, ce qui peut bloquer les opérations légitimes

**Tables corrigées :**
1. `audit_log` — Logs d'audit sensibles
2. `consent_log` — Historique des consentements RGPD
3. `error_events` — Événements d'erreur pour le debugging
4. `feature_flags` — Flags de fonctionnalités
5. `phone_verifications` — Vérifications OTP
6. `referrals` — Codes de parrainage
7. `subscriptions` — Abonnements utilisateurs

**Solution :**
- Ajout de politiques RLS appropriées pour chaque table :
  - **Service role** : Accès complet pour toutes les tables (API routes, webhooks, cron)
  - **Users** : Accès en lecture à leurs propres données (consent_log, error_events, referrals, subscriptions)
  - **Public** : Accès en lecture pour `feature_flags` (nécessaire pour les checks côté client)
  - **Users insert** : Permission d'insertion pour `error_events` (reporting d'erreurs)

**Migration :** `supabase/migrations/add_missing_rls_policies.sql`

---

## Application de la migration

### Via Supabase Dashboard

1. Aller dans **SQL Editor**
2. Exécuter les migrations dans l'ordre :
   - `supabase/migrations/fix_security_issues.sql` (RLS et Security Definer)
   - `supabase/migrations/fix_function_search_path.sql` (Search path)
   - `supabase/migrations/add_missing_rls_policies.sql` (Politiques RLS manquantes)
3. Vérifier que les erreurs/suggestions de sécurité ont disparu dans **Database** → **Linter**

### Via CLI Supabase

```bash
supabase db push
```

---

## Vérification post-migration

### 1. Vérifier que RLS est activé

```sql
-- Vérifier RLS sur share_click_events
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'share_click_events';
-- rowsecurity doit être TRUE

-- Vérifier RLS sur sms_unsubscribes
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'sms_unsubscribes';
-- rowsecurity doit être TRUE
```

### 2. Vérifier que la vue n'a pas SECURITY DEFINER

```sql
-- Vérifier la définition de la vue
SELECT pg_get_viewdef('share_conversion_funnel', true);
-- Ne doit pas contenir "SECURITY DEFINER"
```

### 3. Vérifier les politiques RLS manquantes

```sql
-- Vérifier que toutes les tables avec RLS ont des politiques
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('audit_log', 'consent_log', 'error_events', 'feature_flags', 
                    'phone_verifications', 'referrals', 'subscriptions')
GROUP BY schemaname, tablename;
-- Toutes les tables doivent avoir au moins 1 politique
```

### 4. Tester les politiques RLS

```sql
-- Test en tant qu'utilisateur authentifié
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';

-- Doit fonctionner : lire ses propres click events
SELECT * FROM share_click_events 
WHERE share_id IN (
  SELECT asset_id FROM share_events WHERE user_id = 'user-uuid-here'
);

-- Ne doit PAS fonctionner : lire les click events d'autres utilisateurs
SELECT * FROM share_click_events 
WHERE share_id NOT IN (
  SELECT asset_id FROM share_events WHERE user_id = 'user-uuid-here'
);

-- Doit fonctionner : lire ses propres subscriptions
SELECT * FROM subscriptions WHERE user_id = 'user-uuid-here';

-- Ne doit PAS fonctionner : lire les subscriptions d'autres utilisateurs
SELECT * FROM subscriptions WHERE user_id != 'user-uuid-here';

-- Doit fonctionner : lire les feature flags (public)
SELECT * FROM feature_flags;

-- Ne doit PAS fonctionner : lire les audit logs (service role only)
SELECT * FROM audit_log;
```

---

## Impact sur l'application

### ✅ Aucun impact négatif attendu

- **API Routes** : Continuent de fonctionner via `service_role` (accès complet)
- **Authenticated Users** : Peuvent maintenant accéder à leurs propres données de manière sécurisée
- **Webhooks** : Continuent de fonctionner via `service_role`
- **Cron Jobs** : Continuent de fonctionner via `service_role`

### ⚠️ Points d'attention

1. **Tests nécessaires** : Tester que les utilisateurs authentifiés peuvent bien accéder à leurs données
2. **Performance** : Les politiques RLS ajoutent une couche de vérification, mais l'impact devrait être minimal avec les index appropriés
3. **Monitoring** : Surveiller les logs Supabase pour détecter d'éventuels problèmes d'accès

---

---

### 4. ✅ Function Search Path Mutable (9 fonctions)

**Problème :**
- 9 fonctions PostgreSQL avaient un `search_path` mutable, ce qui peut permettre des attaques de type "search_path hijacking"
- **Risque** : Un attaquant pourrait créer des tables/fonctions dans un schéma avec un nom prioritaire et détourner l'exécution des fonctions

**Fonctions corrigées :**
1. `cleanup_expired_verifications`
2. `cleanup_expired_sessions`
3. `increment_user_session_count`
4. `handle_sms_unsubscribe`
5. `increment_share_click`
6. `get_fatigue_penalty`
7. `update_updated_at_column`
8. `get_user_lift`
9. `handle_new_user`

**Solution :**
- Ajout de `SET search_path = public, pg_temp` à toutes les fonctions
- Le `search_path` est maintenant fixe et ne peut pas être modifié par l'utilisateur
- Protection contre les attaques de hijacking

**Migration :** `supabase/migrations/fix_function_search_path.sql`

---

## Conformité

✅ **RGPD** : Les données sont maintenant protégées par RLS  
✅ **OWASP** : Meilleures pratiques de sécurité des bases de données  
✅ **Supabase Best Practices** : Conforme aux recommandations Supabase  
✅ **PostgreSQL Security** : Protection contre search_path hijacking

---

## Références

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Security Definer Views](https://www.postgresql.org/docs/current/sql-createview.html#SQL-CREATEVIEW-SECURITY)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [PostgreSQL Search Path Security](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)
