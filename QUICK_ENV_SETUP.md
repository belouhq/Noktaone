# ⚡ Configuration Rapide des Variables d'Environnement

## 🚀 Étapes rapides

1. **Ouvre ton fichier `.env.local`** (à la racine du projet)

2. **Ajoute ces sections pour Stripe et FirstPromoter** :

```bash
# ============================================
# STRIPE
# ============================================
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_LIFETIME=price_xxx

# ============================================
# FIRSTPROMOTER
# ============================================
FIRSTPROMOTER_API_KEY=xxx
FIRSTPROMOTER_ACCOUNT_ID=xxx
```

3. **Remplis les valeurs** depuis les dashboards respectifs

## 📍 Où trouver les valeurs

### Stripe
- **API Keys** : https://dashboard.stripe.com/apikeys
- **Webhook Secret** : https://dashboard.stripe.com/webhooks > [Ton webhook] > Signing secret
- **Price IDs** : https://dashboard.stripe.com/products > [Produit] > Pricing

### FirstPromoter
- **API Key** : https://firstpromoter.com/dashboard > Settings > API
- **Account ID** : https://firstpromoter.com/dashboard > Settings > Account

## ✅ Vérification

Après avoir ajouté les variables, redémarre ton serveur de développement :

```bash
npm run dev
```

## 📝 Template complet

Tu peux aussi copier le contenu de `.env.template` dans `.env.local` et remplir les valeurs.
