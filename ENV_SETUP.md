# 🔐 Configuration des Variables d'Environnement

## 📋 Vue d'ensemble

Ce guide explique comment configurer toutes les variables d'environnement nécessaires pour Nokta One.

## 🚀 Installation rapide

1. Copie le fichier `.env.example` vers `.env.local` :
   ```bash
   cp .env.example .env.local
   ```

2. Ouvre `.env.local` et remplis les valeurs

## 📝 Variables par service

### Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Où trouver** : [Supabase Dashboard](https://supabase.com/dashboard) > Settings > API

---

### Stripe

```bash
# Clés API
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_LIFETIME=price_xxx
```

**Où trouver** :
- **API Keys** : [Stripe Dashboard](https://dashboard.stripe.com/apikeys) > API keys
- **Webhook Secret** : [Stripe Dashboard](https://dashboard.stripe.com/webhooks) > [Webhook] > Signing secret
- **Price IDs** : [Stripe Dashboard](https://dashboard.stripe.com/products) > [Product] > Pricing

---

### FirstPromoter

```bash
FIRSTPROMOTER_API_KEY=xxx
FIRSTPROMOTER_ACCOUNT_ID=xxx
```

**Où trouver** :
- **API Key** : [FirstPromoter Dashboard](https://firstpromoter.com/dashboard) > Settings > API
- **Account ID** : [FirstPromoter Dashboard](https://firstpromoter.com/dashboard) > Settings > Account

---

### OneSignal

```bash
NEXT_PUBLIC_ONESIGNAL_APP_ID=xxx
ONESIGNAL_REST_API_KEY=xxx
```

**Où trouver** : [OneSignal Dashboard](https://dashboard.onesignal.com) > Settings > Keys & IDs

---

### Terra API

```bash
TERRA_API_KEY=xxx
TERRA_DEV_ID=xxx
TERRA_WEBHOOK_SECRET=xxx
```

**Où trouver** : [Terra Dashboard](https://dashboard.tryterra.co) > API Keys

---

### App Config

```bash
NEXT_PUBLIC_APP_URL=https://noktaone.com
```

**Valeur** : URL de production de ton application

---

## ⚠️ Sécurité

- **NE JAMAIS** commiter `.env.local` dans Git
- Les variables `NEXT_PUBLIC_*` sont exposées côté client
- Les autres variables sont **server-side uniquement**
- Utilise des clés de **test** en développement, **production** en prod

## 🔄 Variables par environnement

### Développement (local)
- Utilise les clés de **test** pour Stripe
- Utilise un projet Supabase de **dev**

### Production
- Utilise les clés de **production** pour Stripe
- Utilise un projet Supabase de **prod**
- Configure les webhooks avec les URLs de production

## ✅ Vérification

Après configuration, teste chaque service :

```bash
# Test Supabase
npm run test-supabase

# Test Stripe (via webhook test)
# Test FirstPromoter (via API test)
```

## 📞 Support

Pour toute question, contacte support@noktaone.com
