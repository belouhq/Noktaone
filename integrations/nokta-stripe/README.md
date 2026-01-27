# 💳 Nokta Stripe Integration

> Version 1.0.0 | Compatible avec Stripe API 2024-12-18

## 📋 Vue d'ensemble

Cette intégration Stripe pour Nokta One comprend :
- ✅ Création de Products & Prices (Monthly/Annual)
- ✅ Checkout Sessions avec trial period
- ✅ Webhook handlers pour tous les events
- ✅ Customer Portal pour gérer l'abonnement
- ✅ Hooks React prêts à l'emploi
- ✅ Migration Supabase

## 🚀 Installation en 5 étapes

### Étape 1: Variables d'environnement

Ajoute à ton `.env.local` :

```bash
# Stripe (déjà configuré)
STRIPE_SECRET_KEY=sk_test_51SKjgj...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SKjgj...

# À générer via le script setup
STRIPE_PRODUCT_PREMIUM=prod_xxx
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_ANNUAL=price_xxx
STRIPE_TRIAL_DAYS=10

# À configurer après création du webhook
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Étape 2: Créer les Products & Prices

```bash
# Copier le script
cp nokta-stripe/scripts/stripe-setup.js scripts/

# Installer stripe si nécessaire
npm install stripe

# Exécuter le setup
node scripts/stripe-setup.js
```

Le script va :
1. Créer le product "Nokta One Premium"
2. Créer le prix Monthly (€18.99/mois)
3. Créer le prix Annual (€189.99/an)
4. Configurer le Customer Portal
5. Afficher les variables à copier

### Étape 3: Copier les API Routes

```bash
# Copier les routes API
cp -r nokta-stripe/app/api/stripe app/api/

# Copier les hooks
cp -r nokta-stripe/lib/stripe lib/
```

Structure finale :
```
app/api/stripe/
├── create-checkout/route.ts
├── webhook/route.ts
└── portal/route.ts

lib/stripe/
└── hooks.ts
```

### Étape 4: Migration Supabase

Dans le SQL Editor de Supabase, exécute :

```sql
-- Copier le contenu de:
-- nokta-stripe/supabase/migrations/001_add_stripe_subscription.sql
```

Vérifie avec :
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name LIKE '%stripe%' OR column_name LIKE '%subscription%';
```

### Étape 5: Configurer le Webhook

1. Va dans [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Clique "Add endpoint"
3. URL: `https://ton-domaine.com/api/stripe/webhook`
4. Events à sélectionner :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie le "Signing secret" dans `STRIPE_WEBHOOK_SECRET`

## 🧪 Test en local

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copie le webhook secret affiché
```

## 💻 Utilisation

### Dans le Paywall

```tsx
import { useStripeCheckout } from '@/lib/stripe/hooks';

function Paywall() {
  const { createCheckout, isLoading } = useStripeCheckout();
  
  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    await createCheckout({
      plan,
      userId: user.id,
      email: user.email,
      locale: 'fr',
    });
    // Redirect automatique vers Stripe Checkout
  };
  
  return (
    <button onClick={() => handleSubscribe('annual')} disabled={isLoading}>
      {isLoading ? 'Chargement...' : 'Passer à Premium'}
    </button>
  );
}
```

### Vérifier le statut

```tsx
import { useSubscriptionStatus } from '@/lib/stripe/hooks';

function PremiumFeature() {
  const status = useSubscriptionStatus(profile);
  
  if (!status.isPremium) {
    return <UpgradePrompt />;
  }
  
  return <PremiumContent />;
}
```

### Customer Portal

```tsx
import { useStripePortal } from '@/lib/stripe/hooks';

function ManageSubscription() {
  const { openPortal, isLoading } = useStripePortal();
  
  return (
    <button onClick={() => openPortal(user.id)}>
      Gérer mon abonnement
    </button>
  );
}
```

## 📊 Events Webhook

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Upgrade user to premium |
| `customer.subscription.updated` | Update status (active, trialing, past_due) |
| `customer.subscription.deleted` | Downgrade to free |
| `invoice.payment_failed` | Set status to past_due |

## 🔒 Sécurité

- Les clés secrètes ne sont jamais exposées côté client
- Webhook signature vérifié avec `stripe.webhooks.constructEvent`
- Supabase admin client utilisé uniquement côté serveur
- RLS policies protègent les données utilisateur

## 🧪 Cartes de test

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` | ✅ Succès |
| `4000 0000 0000 3220` | 🔐 3D Secure |
| `4000 0000 0000 9995` | ❌ Refusée |

## 📁 Fichiers

```
nokta-stripe/
├── scripts/
│   └── stripe-setup.js          # Setup Products & Prices
├── app/api/stripe/
│   ├── create-checkout/route.ts # Créer session checkout
│   ├── webhook/route.ts         # Handler webhook
│   └── portal/route.ts          # Customer portal
├── lib/stripe/
│   └── hooks.ts                 # React hooks
├── supabase/migrations/
│   └── 001_add_stripe_subscription.sql
├── examples/
│   └── PaywallWithStripe.tsx    # Exemple intégration
└── README.md
```

## ❓ Troubleshooting

### "No such price: price_xxx"
→ Exécute `node scripts/stripe-setup.js` et mets à jour les variables

### Webhook ne fonctionne pas
→ Vérifie `STRIPE_WEBHOOK_SECRET` et que l'endpoint est accessible

### "Customer already has subscription"
→ Vérifie dans Stripe Dashboard si l'utilisateur a déjà un abonnement actif

---

🎉 **Prêt !** Le Paywall est maintenant connecté à Stripe.
