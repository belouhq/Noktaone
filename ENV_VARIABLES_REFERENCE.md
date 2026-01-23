# 🔐 Variables d'Environnement - Référence Complète

## 📋 Instructions

Ajoute ces variables dans ton fichier `.env.local` à la racine du projet.

---

## ✅ STRIPE

```bash
# Clés API Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Webhook Secret (pour valider les webhooks)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs (identifiants des produits/prix)
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_LIFETIME=price_xxx
```

**Où trouver** :
- **API Keys** : [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Webhook Secret** : [Stripe Dashboard](https://dashboard.stripe.com/webhooks) > [Ton webhook] > Signing secret
- **Price IDs** : [Stripe Dashboard](https://dashboard.stripe.com/products) > [Produit] > Pricing > Price ID

---

## ✅ FIRSTPROMOTER

```bash
# API Key FirstPromoter
FIRSTPROMOTER_API_KEY=xxx

# Account ID FirstPromoter
FIRSTPROMOTER_ACCOUNT_ID=xxx
```

**Où trouver** :
- **API Key** : [FirstPromoter Dashboard](https://firstpromoter.com/dashboard) > Settings > API
- **Account ID** : [FirstPromoter Dashboard](https://firstpromoter.com/dashboard) > Settings > Account

---

## ✅ PARTNERSHIP ACCESS

```bash
# Code d'accès pour le panneau de gestion des partenariats
PARTNERSHIP_ACCESS_CODE=votre_code_secret_ici
```

**Note** :
- Code unique pour accéder au panneau d'affiliation dans les paramètres
- Par défaut : `NOkta2025!` si non défini
- Stocké uniquement côté serveur (variable d'environnement)
- Voir [PARTNERSHIP_ACCESS_SETUP.md](./PARTNERSHIP_ACCESS_SETUP.md) pour plus de détails

---

## 📝 Autres variables (déjà configurées ?)

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### OneSignal
```bash
NEXT_PUBLIC_ONESIGNAL_APP_ID=xxx
ONESIGNAL_REST_API_KEY=xxx
```

### Terra API
```bash
TERRA_API_KEY=xxx
TERRA_DEV_ID=xxx
TERRA_WEBHOOK_SECRET=xxx
```

### App Config
```bash
NEXT_PUBLIC_APP_URL=https://noktaone.com
```

---

## 🔒 Sécurité

- ⚠️ **NE JAMAIS** commiter `.env.local` dans Git
- Les variables `NEXT_PUBLIC_*` sont exposées côté client
- Les autres variables sont **server-side uniquement**

---

## 📝 Exemple de .env.local complet

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_LIFETIME=price_xxx

# FirstPromoter
FIRSTPROMOTER_API_KEY=xxx
FIRSTPROMOTER_ACCOUNT_ID=xxx

# Partnership Access
PARTNERSHIP_ACCESS_CODE=votre_code_secret_ici

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=xxx
ONESIGNAL_REST_API_KEY=xxx

# Terra API
TERRA_API_KEY=xxx
TERRA_DEV_ID=xxx
TERRA_WEBHOOK_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://noktaone.com
```
