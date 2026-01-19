# NOKTA ONE - Guide d'Installation Supabase v2

## 📋 Vue d'ensemble

Ce guide explique comment installer le schéma Supabase complet pour Nokta One, incluant toutes les intégrations API.

### Tables incluses (20 tables)

| Catégorie | Tables |
|-----------|--------|
| **Auth & Profils** | `user_profile`, `notification_devices` |
| **SKANE Core** | `skane_sessions`, `micro_actions`, `state_action_map`, `micro_action_events` |
| **Gamification** | `user_streaks` |
| **Viralité** | `share_events` |
| **Affiliés** | `affiliate_tracking`, `affiliate_conversions` |
| **Paiements** | `subscriptions`, `payment_events` |
| **Wearables** | `wearable_connections`, `biometric_daily_summary` |
| **Analytics** | `analytics_events` |
| **Support** | `support_tickets` |
| **Conformité** | `consent_log`, `audit_log`, `error_events` |
| **Config** | `feature_flags` |

---

## 🚀 Installation

### Étape 1: Exécuter le schéma SQL

1. Ouvrir **Supabase Dashboard** > **SQL Editor**
2. Copier-coller le contenu de `nokta-schema-complete-v2.sql`
3. Cliquer sur **Run**

⚠️ **Important**: Si tu as déjà des tables, le schéma utilise `CREATE TABLE IF NOT EXISTS` donc pas de conflit.

### Étape 2: Exécuter le seed

1. Dans **SQL Editor**
2. Copier-coller le contenu de `nokta-seed-v2.sql`
3. Cliquer sur **Run**

### Étape 3: Vérifier l'installation

Exécuter cette requête pour vérifier:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Tu devrais voir 20 tables.

---

## 📁 Structure des fichiers pour Cursor

Copie ces fichiers dans ton projet:

```
lib/
├── supabase/
│   ├── types.ts              # Types générés (nokta-supabase-types.ts)
│   └── types-helpers.ts      # Types additionnels (nokta-types-helpers.ts)
├── services/
│   ├── onesignal.ts          # Service OneSignal (nokta-service-onesignal.ts)
│   ├── firstpromoter.ts      # Service FirstPromoter (nokta-service-firstpromoter.ts)
│   └── terra.ts              # Service Terra API (nokta-service-terra.ts)
app/
└── api/
    └── webhooks/
        ├── stripe/
        │   └── route.ts
        ├── firstpromoter/
        │   └── route.ts
        ├── terra/
        │   └── route.ts
        └── onesignal/
            └── route.ts
```

---

## 🔐 Variables d'environnement

Ajoute ces variables dans `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_LIFETIME=price_xxx

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=xxx
ONESIGNAL_REST_API_KEY=xxx

# FirstPromoter
FIRSTPROMOTER_API_KEY=xxx
FIRSTPROMOTER_ACCOUNT_ID=xxx

# Terra API (Wearables)
TERRA_API_KEY=xxx
TERRA_DEV_ID=xxx
TERRA_WEBHOOK_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://noktaone.com
```

---

## 🔄 Configuration des Webhooks

### Stripe

1. Aller dans **Stripe Dashboard** > **Developers** > **Webhooks**
2. Ajouter un endpoint: `https://noktaone.com/api/webhooks/stripe`
3. Sélectionner les événements:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `checkout.session.completed`

### FirstPromoter

1. Aller dans **FirstPromoter** > **Settings** > **Webhooks**
2. Ajouter: `https://noktaone.com/api/webhooks/firstpromoter`
3. Sélectionner tous les événements

### Terra API

1. Aller dans **Terra Dashboard** > **Webhooks**
2. Ajouter: `https://noktaone.com/api/webhooks/terra`
3. Activer: sleep, activity, body, daily

### OneSignal

1. Aller dans **OneSignal** > **Settings** > **Webhooks**
2. Ajouter: `https://noktaone.com/api/webhooks/onesignal`

---

## 📊 Views KPI Admin

Le schéma inclut des views SQL pour ton dashboard admin:

| View | Description |
|------|-------------|
| `v_scan_success_rate` | Taux de succès des scans par jour |
| `v_scan_fail_reasons` | Raisons d'échec (lumière, cadrage...) |
| `v_micro_action_completion` | Taux de complétion par micro-action |
| `v_mood_delta` | Amélioration du mood (efficacité perçue) |
| `v_retention` | Rétention D1/D7/D30 par cohorte |
| `v_affiliate_stats` | Stats des affiliés |
| `v_share_stats` | Stats de partage par canal |

Exemple d'utilisation:

```sql
-- Taux de succès des scans cette semaine
SELECT * FROM v_scan_success_rate 
WHERE date >= CURRENT_DATE - INTERVAL '7 days';

-- Top actions par efficacité
SELECT * FROM v_mood_delta 
ORDER BY avg_mood_delta DESC 
LIMIT 5;
```

---

## 🔒 Sécurité RLS

Toutes les tables ont Row Level Security (RLS) activé:

- Les utilisateurs ne voient que leurs propres données
- Les tables publiques (`micro_actions`, `state_action_map`, `feature_flags`) sont en lecture seule pour tous
- Les opérations admin nécessitent le `service_role_key`

---

## 🗑️ RGPD - Suppression des données

Une fonction est fournie pour supprimer toutes les données d'un utilisateur:

```sql
SELECT delete_user_data('user-uuid-here');
```

Cette fonction supprime en cascade toutes les données de l'utilisateur dans toutes les tables.

---

## 📝 Notes importantes

### Mode invité

- Les invités ont un `guest_id` UUID généré côté client
- Leurs données sont stockées avec `user_id = NULL` et `guest_id = xxx`
- Recommandation: purger les données invités > 72h avec un cron job

### Wearables (Terra API)

- Coût: ~$500/mois pour Terra
- Alternative: utiliser uniquement HealthKit natif iOS (gratuit)
- Les tables sont prêtes dans les deux cas

### Feature Flags

Les feature flags permettent de déployer progressivement:

```typescript
// Vérifier un flag
const { data: flag } = await supabase
  .from('feature_flags')
  .select('enabled, rollout_percentage')
  .eq('flag_key', 'skane_v2')
  .single();

const isEnabled = flag?.enabled && Math.random() * 100 < flag.rollout_percentage;
```

---

## 🆘 Troubleshooting

### Erreur RLS

Si tu as des erreurs de permission, vérifie que:
1. L'utilisateur est authentifié (`auth.uid()` retourne une valeur)
2. La policy existe pour l'opération (SELECT/INSERT/UPDATE/DELETE)

### Erreur de type

Régénère les types avec:

```bash
npx supabase gen types typescript --project-id xxx > lib/supabase/types.ts
```

---

## 📞 Support

Pour toute question, ouvre un ticket dans l'app ou contacte support@noktaone.com.
