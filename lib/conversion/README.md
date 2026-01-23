# 🚀 Nokta Conversion System

Système complet de conversion trial-to-paid pour **Nokta One**, basé sur les best practices de WHOOP, Cal AI, et les techniques de neuromarketing.

## 📊 Benchmarks & Objectifs

| Métrique | Objectif |
|----------|----------|
| Conversion trial→paid | 25%+ au lancement, 40%+ après optimisation |
| Trial engagement | 70%+ des users font ≥1 scan/jour |
| Day 7 retention | 50%+ des users trial actifs |
| Paywall view→purchase | 15-20% |
| Annual vs Monthly split | 40% annuel |

## 📁 Structure du Système

```
lib/conversion/
├── types/
│   └── index.ts              # Types TypeScript complets
├── constants/
│   └── index.ts              # Pricing, trial config, templates notifications
├── utils/
│   └── index.ts              # Fonctions utilitaires (pricing, dates, etc.)
├── hooks/
│   └── index.ts              # React hooks (usePaywall, useTrial, etc.)
├── components/
│   └── Paywall.tsx           # Composant paywall premium
├── services/
│   ├── stripe.ts             # Service Stripe (checkout, webhooks)
│   └── notifications.ts      # Service OneSignal
├── api/
│   └── stripe-routes.ts      # API routes Next.js
├── styles/
│   └── paywall.css           # Styles Tailwind personnalisés
└── index.ts                  # Export principal
```

## 🛠️ Installation

### 1. Installer les dépendances

```bash
npm install stripe @stripe/stripe-js
```

### 2. Variables d'environnement

```env
# .env.local

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# OneSignal
ONESIGNAL_APP_ID=...
ONESIGNAL_REST_API_KEY=...
ONESIGNAL_ANDROID_CHANNEL_ID=...

# App
NEXT_PUBLIC_SITE_URL=https://nokta.app
```

### 3. Créer les produits Stripe

Dans le Dashboard Stripe :

1. **Products → Add product**
2. Nom : "Nokta One Premium"
3. Créer les prix :
   - EUR Monthly: 9.99€/mois
   - EUR Annual: 79.99€/an
   - USD Monthly: $9.99/mois
   - USD Annual: $79.99/an
4. Copier les Price IDs dans `.env.local`

### 4. Configurer les API routes

Les routes sont déjà créées dans :
- `app/api/stripe/create-checkout/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/stripe/portal/route.ts`
- `app/api/subscription/route.ts`

### 5. Configurer le webhook Stripe

```bash
# Local testing avec Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Production: Configurer dans Stripe Dashboard → Webhooks
# URL: https://nokta.app/api/stripe/webhook
# Events: checkout.session.completed, customer.subscription.*
```

## 📱 Utilisation

### Basic Usage

```tsx
'use client';

import { 
  Paywall, 
  usePaywall, 
  usePricing, 
  useTrial 
} from '@/lib/conversion';

export function SubscriptionGate({ children }) {
  const user = useUser(); // Your auth hook
  
  const { pricing } = usePricing('fr');
  
  const { 
    trialProgress, 
    daysRemaining,
    isExpired,
  } = useTrial({
    userId: user.id,
    subscriptionStatus: user.subscriptionStatus,
    trialStartDate: user.trialStartDate,
    trialEndDate: user.trialEndDate,
  });
  
  const { 
    isVisible, 
    show, 
    hide, 
    onSubscribe,
  } = usePaywall({
    userId: user.id,
    locale: 'fr',
    autoShow: true, // Auto-show when conditions are met
  });
  
  return (
    <>
      {children}
      
      <Paywall
        isVisible={isVisible}
        onDismiss={hide}
        onSubscribe={onSubscribe}
        pricing={pricing}
        trialProgress={trialProgress}
        trigger={trialProgress && isExpired ? 'trial_expired' : null}
        userName={user.firstName}
      />
    </>
  );
}
```

### Avec code influenceur

```tsx
// URL: nokta.app/?code=MARIE30

import { usePricing } from '@/lib/conversion';

function LandingPage() {
  const searchParams = useSearchParams();
  const influencerCode = searchParams.get('code');
  
  const { pricing } = usePricing('fr');
  
  // Le code influenceur sera validé dans l'API checkout
  // pricing.influencerDiscount contient les détails de la réduction
  
  return (
    <div>
      {pricing.influencerDiscount && (
        <div className="bg-green-500/10 p-4 rounded">
          Code {pricing.influencerDiscount.code} de {pricing.influencerDiscount.influencerName} appliqué !
          -{pricing.influencerDiscount.percent}% pendant {pricing.influencerDiscount.validMonths} mois
        </div>
      )}
    </div>
  );
}
```

### Vérifier les limites de skane

```tsx
import { useSkaneLimit } from '@/lib/conversion';

function SkaneButton() {
  const { canPerformSkane, remaining, isLimited } = useSkaneLimit('free');
  
  if (!canPerformSkane) {
    return (
      <button onClick={() => showPaywall('daily_limit_reached')}>
        Limite atteinte - Passer en Premium
      </button>
    );
  }
  
  return (
    <button onClick={startSkane}>
      Faire un Skane {isLimited && `(${remaining} restant)`}
    </button>
  );
}
```

## 💰 Pricing par Locale

| Locale | Devise | Mensuel | Annuel | PPP |
|--------|--------|---------|--------|-----|
| fr, en, de | EUR/USD | 9.99 | 79.99 | 1.0 |
| es, it | EUR | 9.99 | 79.99 | 1.0 |
| pt | EUR | 9.99 | 79.99 | 1.0 |
| ja | USD | 12.99 | 99.99 | 0.85 |
| ko | USD | 12.99 | 99.99 | 0.85 |
| zh | USD | 9.99 | 79.99 | 1.0 |
| hi | USD | 4.99 | 39.99 | 0.35 |
| id | USD | 9.99 | 79.99 | 1.0 |

*Note: Les prix sont configurables dans `lib/notifications/constants.ts`*

## 📅 Timeline du Trial (10 jours)

| Jour | Action | Notification |
|------|--------|--------------|
| 0 | Welcome + 1er Skane | "Bienvenue! Tu as 10 jours..." |
| 1-3 | Formation habitude | Rappels quotidiens 8h |
| 3 | Streak 3 jours | Célébration 🔥 |
| 4-6 | Éducation | Features, patterns |
| 7 | Premier rappel | "Une semaine ensemble!" |
| 8 | Introduction offre | "Plus que 2 jours..." |
| 9 | Urgence mesurée | "Demain, tout change" |
| 10 | Conversion | Full paywall, push matin + soir |

## 🧠 Techniques de Neuromarketing

Le paywall intègre :

1. **Loss Aversion** - Montrer ce qu'on va perdre, pas ce qu'on gagne
2. **Anchoring** - Prix mensuel affiché en premier
3. **Social Proof** - Nombre d'utilisateurs, notes, témoignages
4. **Scarcity** - Countdown timer (réel, pas fake)
5. **Reciprocity** - Rappeler la valeur reçue pendant le trial
6. **Trust Badges** - Paiement sécurisé, annulation facile, garantie

## 📊 Analytics Events

Events à tracker (Mixpanel/PostHog) :

```typescript
ANALYTICS_EVENTS = {
  TRIAL_STARTED: 'trial_started',
  FIRST_SKANE_COMPLETED: 'first_skane_completed',
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  TRIAL_EXPIRED: 'trial_expired',
  CHURN: 'churn',
  WINBACK_CONVERTED: 'winback_converted',
}
```

## 🔧 Personnalisation

### Modifier les prix

```typescript
// lib/notifications/constants.ts

export const LOCALE_PRICING: Record<SupportedLocale, LocalePricing> = {
  fr: { monthly: 999, annual: 7999, currency: 'EUR' }, // 9.99€ / 79.99€
  // Modifier ici
};
```

### Modifier la durée du trial

```typescript
// lib/conversion/constants/index.ts

export const TRIAL_CONFIG = {
  DURATION_DAYS: 14,  // Passer à 14 jours
  MAX_SKANES_PER_DAY: 3,
  CONVERSION_WINDOW_DAYS: 3,
} as const;
```

### Ajouter des testimonials

```typescript
// lib/paywall/constants.ts

export const PAYWALL_CONFIG = {
  // ...
  DEFAULT_TESTIMONIALS: [
    {
      name: 'Marie',
      text: 'Mon stress a diminué...',
      result: '-40% stress',
    },
    // Ajouter plus...
  ],
};
```

## 🐛 Debugging

### Tester le webhook Stripe localement

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

### Simuler un trial expiré

```typescript
// Dans les dev tools
localStorage.setItem('nokta_debug_trial_day', '11');
```

## 📝 Tables Supabase Requises

```sql
-- Ajouts à la table profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS influencer_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS influencer_discount_end_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onesignal_player_id TEXT;

-- Table influencer_codes
CREATE TABLE IF NOT EXISTS influencer_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  influencer_id UUID NOT NULL,
  influencer_name TEXT NOT NULL,
  tier TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 20,
  commission_percent INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  valid_until TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table influencer_conversions
CREATE TABLE IF NOT EXISTS influencer_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  influencer_code TEXT NOT NULL,
  subscription_id TEXT,
  plan TEXT,
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_influencer_codes_code ON influencer_codes(code);
CREATE INDEX IF NOT EXISTS idx_influencer_codes_active ON influencer_codes(is_active);
```

## 🚀 Quick Start

```tsx
import { Paywall, usePaywall } from '@/lib/conversion';

function MyApp() {
  const { isVisible, show, hide, onSubscribe, pricing, trialProgress } = usePaywall({
    userId: 'user123',
    locale: 'fr',
    autoShow: true,
  });

  return (
    <>
      <YourApp />
      <Paywall
        isVisible={isVisible}
        onDismiss={hide}
        onSubscribe={onSubscribe}
        pricing={pricing}
        trialProgress={trialProgress}
        trigger="trial_expired"
        userName="Benjamin"
      />
    </>
  );
}
```

## 📚 API Reference

### Hooks

- **`usePricing(locale)`** - Récupère le pricing pour une locale
- **`useTrial(params)`** - Suit la progression du trial
- **`usePaywall(params)`** - Gère l'état du paywall et la conversion

### Utilitaires

- **`calculateConversionProbability(progress)`** - Calcule la probabilité de conversion
- **`getRecommendedTrigger(progress, trialDay)`** - Détermine le meilleur trigger
- **`shouldShowPaywall(status, trialEndDate)`** - Vérifie si le paywall doit être affiché

### Services

- **`createCheckoutSession(params)`** - Crée une session Stripe Checkout
- **`scheduleTrialNotifications(params)`** - Planifie la séquence de notifications
- **`sendNotification(params)`** - Envoie une notification push

## 📄 License

Proprietary - Nokta / SASU Nexus 1993

---

*Généré le 23 janvier 2026*
*Basé sur les études WHOOP, Cal AI, et best practices RevenueCat/Superwall*
