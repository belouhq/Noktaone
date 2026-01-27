// ============================================
// NOKTA CONVERSION SYSTEM - CONSTANTS
// Version: 2.1.0 - PWA ONLY, NO STUDENT
// ============================================

// ===================
// TYPES INLINE
// ===================

export type SupportedLocale = 
  | 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt'
  | 'ja' | 'ko' | 'zh' | 'hi' | 'ar' | 'ru';

import type { SupportedCurrency } from '@/lib/paywall/types';
export type { SupportedCurrency };

export type InfluencerTier = 'nano' | 'micro' | 'mid' | 'macro' | 'mega';

type NotificationType = 'trial' | 'conversion' | 'engagement' | 'winback' | 'transactional';

export interface LocalePricing {
  currency: SupportedCurrency;
  currencySymbol: string;
  monthly: number;
  annual: number;
  founding: number;
  pppMultiplier: number;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  type: NotificationType;
}

export interface TrialConfig {
  durationDays: number;
  features: {
    skaneLimit: 'unlimited' | number;
    historyDays: 'unlimited' | number;
    allMicroActions: boolean;
    wearableSync: boolean;
    patterns: boolean;
  };
  progressiveUnlocks: Array<{
    day: number;
    feature: string;
    description: string;
  }>;
  paywall: {
    softReminderDay: number;
    offerIntroductionDay: number;
    urgencyDay: number;
    hardPaywallDay: number;
  };
}

// ===================
// PRICING - PWA ONLY
// ===================

/**
 * Prix de base en USD (devise de référence)
 * PWA uniquement pour le lancement
 */
export const BASE_PRICING = {
  monthly: 18.99,
  annual: 169.00,
  founding: 59.00,
};

/**
 * Prix plancher absolu - Protection de la valeur perçue
 */
export const MINIMUM_PRICE_USD = 13.00;

/**
 * Roadmap évolution prix
 */
export const PRICING_ROADMAP = {
  launch: { monthly: 18.99, annual: 169.00 },
  plus6months: { monthly: 20.99, annual: 189.00 },
  plus12to18months: { monthly: 22.99, annual: 199.00 },
};

// ===================
// CONVERSION THRESHOLDS
// ===================

/**
 * Seuils pour déclencher différents messages/paywalls en fonction
 * de la probabilité de conversion (0..1).
 */
export const CONVERSION_THRESHOLDS = {
  LOW: 0.35,
  MEDIUM: 0.55,
  HIGH: 0.75,
} as const;

/**
 * Pricing par locale avec PPP
 */
export const LOCALE_PRICING: Record<SupportedLocale, LocalePricing> = {
  en: {
    currency: 'USD',
    currencySymbol: '$',
    monthly: 18.99,
    annual: 169.00,
    founding: 59.00,
    pppMultiplier: 1.0,
  },
  fr: {
    currency: 'EUR',
    currencySymbol: '€',
    monthly: 17.99,
    annual: 159.00,
    founding: 55.00,
    pppMultiplier: 0.95,
  },
  de: {
    currency: 'EUR',
    currencySymbol: '€',
    monthly: 17.99,
    annual: 159.00,
    founding: 55.00,
    pppMultiplier: 0.95,
  },
  es: {
    currency: 'EUR',
    currencySymbol: '€',
    monthly: 15.99,
    annual: 139.00,
    founding: 49.00,
    pppMultiplier: 0.85,
  },
  it: {
    currency: 'EUR',
    currencySymbol: '€',
    monthly: 15.99,
    annual: 139.00,
    founding: 49.00,
    pppMultiplier: 0.85,
  },
  pt: {
    currency: 'EUR',
    currencySymbol: '€',
    monthly: 13.99,
    annual: 119.00,
    founding: 45.00,
    pppMultiplier: 0.75,
  },
  ja: {
    currency: 'JPY',
    currencySymbol: '¥',
    monthly: 2480,
    annual: 21800,
    founding: 7800,
    pppMultiplier: 0.85,
  },
  ko: {
    currency: 'KRW',
    currencySymbol: '₩',
    monthly: 24900,
    annual: 219000,
    founding: 79000,
    pppMultiplier: 0.85,
  },
  zh: {
    currency: 'CNY',
    currencySymbol: '¥',
    monthly: 98,
    annual: 849,
    founding: 298,
    pppMultiplier: 0.50,
  },
  hi: {
    currency: 'INR',
    currencySymbol: '₹',
    monthly: 999,
    annual: 8499,
    founding: 2999,
    pppMultiplier: 0.40,
  },
  ar: {
    currency: 'AED',
    currencySymbol: 'د.إ',
    monthly: 69,
    annual: 619,
    founding: 219,
    pppMultiplier: 1.0,
  },
  ru: {
    currency: 'RUB',
    currencySymbol: '₽',
    monthly: 1290,
    annual: 10990,
    founding: 3990,
    pppMultiplier: 0.55,
  },
};

// ===================
// INFLUENCER SYSTEM
// ===================

export const INFLUENCER_TIERS: Record<InfluencerTier, {
  minFollowers: number;
  maxFollowers: number | null;
  discountPercent: number;
  commissionPerMonth: number;
  commissionCapMonths: number;
}> = {
  nano: {
    minFollowers: 1000,
    maxFollowers: 10000,
    discountPercent: 30, // $13.29
    commissionPerMonth: 7,
    commissionCapMonths: 12,
  },
  micro: {
    minFollowers: 10000,
    maxFollowers: 100000,
    discountPercent: 25, // $14.24
    commissionPerMonth: 7,
    commissionCapMonths: 12,
  },
  mid: {
    minFollowers: 100000,
    maxFollowers: 500000,
    discountPercent: 20, // $15.19
    commissionPerMonth: 7,
    commissionCapMonths: 12,
  },
  macro: {
    minFollowers: 500000,
    maxFollowers: 1000000,
    discountPercent: 20,
    commissionPerMonth: 7,
    commissionCapMonths: 12,
  },
  mega: {
    minFollowers: 1000000,
    maxFollowers: null,
    discountPercent: 20,
    commissionPerMonth: 7,
    commissionCapMonths: 12,
  },
};

export const INFLUENCER_RULES = {
  allowedOffers: ['monthly'] as const,
  userDiscountDurationMonths: 3,
  commissionPerMonth: 7,
  commissionCapMonths: 12,
  maxCommissionPerUser: 84,
  noCommissionOn: ['annual', 'founding', 'b2b', 'b2b2c'] as const,
  minimumPriceAfterDiscount: 13.00,
};

export function calculateInfluencerPrice(
  basePrice: number,
  tier: InfluencerTier
): { price: number; discount: number; isAtFloor: boolean } {
  const tierConfig = INFLUENCER_TIERS[tier];
  const rawDiscount = basePrice * (tierConfig.discountPercent / 100);
  const rawPrice = basePrice - rawDiscount;
  
  if (rawPrice < MINIMUM_PRICE_USD) {
    return {
      price: MINIMUM_PRICE_USD,
      discount: basePrice - MINIMUM_PRICE_USD,
      isAtFloor: true,
    };
  }
  
  return {
    price: Math.round(rawPrice * 100) / 100,
    discount: Math.round(rawDiscount * 100) / 100,
    isAtFloor: false,
  };
}

// ===================
// TRIAL CONFIGURATION
// ===================

export const TRIAL_CONFIG: TrialConfig = {
  durationDays: 10,
  features: {
    skaneLimit: 'unlimited',
    historyDays: 'unlimited',
    allMicroActions: true,
    wearableSync: true,
    patterns: true,
  },
  progressiveUnlocks: [
    { day: 1, feature: 'history', description: 'Historique complet débloqué' },
    { day: 3, feature: 'patterns', description: 'Analyse de patterns' },
    { day: 5, feature: 'wearables', description: 'Sync wearables' },
    { day: 7, feature: 'insights', description: 'Insights avancés' },
  ],
  paywall: {
    softReminderDay: 7,
    offerIntroductionDay: 8,
    urgencyDay: 9,
    hardPaywallDay: 10,
  },
};

export const FREE_MODE_CONFIG = {
  skanePerDay: 1,
  historyDays: 7,
  microActionsAvailable: ['breathe_4_7_8', 'posture_reset', 'eye_palming'],
  wearableSync: false,
  patterns: false,
};

// ===================
// FOUNDING OFFER
// ===================

export const FOUNDING_OFFER = {
  name: 'Founding Member',
  price: 59.00,
  currency: 'USD' as SupportedCurrency,
  interval: 'annual' as const,
  features: 'Premium complet',
  rules: {
    onePerUser: true,
    quotaLimited: true,
    maxQuota: 1000,
  },
};

// ===================
// NOTIFICATIONS
// ===================

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  trial_welcome: {
    title: '🎯 Bienvenue {firstName} !',
    body: 'Tu as 10 jours pour transformer tes 30 secondes. Fais ton premier reset maintenant.',
    type: 'trial',
  },
  trial_day_reminder: {
    title: '⏰ Ton corps t\'attend',
    body: '30 secondes pour te recentrer. Un reset maintenant ?',
    type: 'trial',
  },
  streak_celebration: {
    title: '🔥 {streak} jours consécutifs !',
    body: 'Tu construis une habitude puissante. Continue.',
    type: 'engagement',
  },
  streak_at_risk: {
    title: '⚠️ Ta série de {streak} jours est en danger',
    body: 'Un reset rapide pour maintenir ton momentum ?',
    type: 'engagement',
  },
  trial_day_7_warning: {
    title: '📊 Une semaine ensemble',
    body: 'Tu as fait {totalSkanes} resets. Ton amélioration moyenne : +{improvement}%',
    type: 'conversion',
  },
  trial_day_8_offer: {
    title: '⏳ Plus que 2 jours',
    body: 'Continue ton parcours à $18.99/mois. Ou $169/an pour économiser.',
    type: 'conversion',
  },
  trial_day_9_urgency: {
    title: '🚨 Demain, tout change',
    body: 'Tes {totalSkanes} resets et ton historique seront limités. Garde ton accès.',
    type: 'conversion',
  },
  trial_day_10_final: {
    title: '⚡ Dernier jour de ton essai',
    body: 'Ne perds pas ton amélioration de +{improvement}%. Continue maintenant.',
    type: 'conversion',
  },
  winback_day_3: {
    title: '👋 Tu nous manques {firstName}',
    body: 'Ton corps mérite ces 30 secondes. Reviens essayer.',
    type: 'winback',
  },
  winback_day_7: {
    title: '🎁 Une seconde chance',
    body: '20% de réduction avec le code COMEBACK. Valable 48h.',
    type: 'winback',
  },
  winback_day_14: {
    title: '💬 On aimerait comprendre',
    body: '3 questions rapides pour améliorer Nokta. 30 secondes max.',
    type: 'winback',
  },
  winback_day_30: {
    title: '✨ Du nouveau chez Nokta',
    body: 'Nouvelles micro-actions, meilleure précision. Réessaie 3 jours gratuits.',
    type: 'winback',
  },
};

// ===================
// PAYWALL CONFIG
// ===================

export const PAYWALL_CONFIG = {
  // Default pricing used as initial state in hooks (before locale pricing loads)
  DEFAULT_PRICING: {
    monthly: { original: Math.round(LOCALE_PRICING.fr.monthly * 100) },
    annual: {
      original: Math.round(LOCALE_PRICING.fr.annual * 100),
      savingsPercent: Math.round(
        ((LOCALE_PRICING.fr.monthly * 12 - LOCALE_PRICING.fr.annual) / (LOCALE_PRICING.fr.monthly * 12)) * 100
      ),
    },
    currency: LOCALE_PRICING.fr.currency,
    influencerDiscount: null,
  },
  TRUST_ELEMENTS: {
    USER_COUNT: 15000,
    RATING_SCORE: 4.8,
    RATING_COUNT: 2400,
    MONEY_BACK_GUARANTEE_DAYS: 7,
  },
  DEFAULT_TESTIMONIALS: [
    { name: 'Marie L.', text: 'Je fais mon reset chaque matin. Mon stress a vraiment diminué.', result: '-35% stress' },
    { name: 'Thomas D.', text: 'Simple, rapide, efficace. 30 secondes qui changent ma journée.', result: '+40% énergie' },
    { name: 'Sophie M.', text: 'Enfin une app qui ne demande pas 20 minutes. Juste ce qu\'il faut.', result: 'Habitude en 5j' },
  ],
  FAQ_QUESTIONS: [
    { question: 'Comment fonctionne le Body Reset ?', answer: 'Un scan de 3 secondes analyse ton état. Une micro-action de 30 secondes te recentre. Ton système nerveux se régule naturellement.' },
    { question: 'Puis-je annuler à tout moment ?', answer: 'Oui, en 1 clic depuis les paramètres. Pas de frais cachés, pas de questions.' },
    { question: 'Quelle différence avec les apps de méditation ?', answer: 'Nokta = 30 secondes max. Pas de sessions de 10-20 minutes. Action immédiate, résultat mesurable.' },
    { question: 'Et si ça ne marche pas pour moi ?', answer: 'Garantie satisfait ou remboursé 7 jours. Si tu ne vois pas de différence, on te rembourse.' },
  ],
};

// ===================
// STRIPE CONFIG
// ===================

export const STRIPE_CONFIG = {
  SUCCESS_URL: '/subscription/success',
  CANCEL_URL: '/subscription/cancel',
  PRICE_IDS: {
    USD_MONTHLY: process.env.STRIPE_PRICE_USD_MONTHLY || '',
    USD_ANNUAL: process.env.STRIPE_PRICE_USD_ANNUAL || '',
    USD_FOUNDING: process.env.STRIPE_PRICE_USD_FOUNDING || '',
    EUR_MONTHLY: process.env.STRIPE_PRICE_EUR_MONTHLY || '',
    EUR_ANNUAL: process.env.STRIPE_PRICE_EUR_ANNUAL || '',
    EUR_FOUNDING: process.env.STRIPE_PRICE_EUR_FOUNDING || '',
  },
  WEBHOOK_EVENTS: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
  ],
};

// ===================
// ANALYTICS EVENTS
// ===================

export const ANALYTICS_EVENTS = {
  TRIAL_STARTED: 'trial_started',
  TRIAL_DAY_REACHED: 'trial_day_reached',
  TRIAL_EXPIRED: 'trial_expired',
  FIRST_SKANE_COMPLETED: 'first_skane_completed',
  SKANE_COMPLETED: 'skane_completed',
  DAILY_LIMIT_REACHED: 'daily_limit_reached',
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  PLAN_SELECTED: 'plan_selected',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  CHECKOUT_ABANDONED: 'checkout_abandoned',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  CHURN: 'churn',
  INFLUENCER_CODE_APPLIED: 'influencer_code_applied',
  INFLUENCER_CODE_INVALID: 'influencer_code_invalid',
  INFLUENCER_CONVERSION: 'influencer_conversion',
  WINBACK_EMAIL_SENT: 'winback_email_sent',
  WINBACK_CONVERTED: 'winback_converted',
  STREAK_MILESTONE: 'streak_milestone',
  STREAK_BROKEN: 'streak_broken',
};

// ===================
// RE-EXPORTS (for backward compatibility)
// ===================

// Re-export from paywall constants (legacy)
export { PAYWALL_CONFIG as PAYWALL_CONFIG_LEGACY } from '@/lib/paywall/constants';

// Re-export from notification constants (legacy)
export { NOTIFICATION_TEMPLATES as NOTIFICATION_TEMPLATES_LEGACY } from '@/lib/notifications/constants';
