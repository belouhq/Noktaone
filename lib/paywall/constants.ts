/**
 * Paywall Configuration Constants
 */

import type { PricingDisplay } from './types';

export const PAYWALL_CONFIG = {
  TRUST_ELEMENTS: {
    USER_COUNT: 50000,
    RATING_SCORE: 4.8,
    RATING_COUNT: 1200,
    MONEY_BACK_GUARANTEE_DAYS: 30,
  },

  DEFAULT_TESTIMONIALS: [
    {
      name: 'Sarah M.',
      text: 'J\'ai enfin trouvé un moyen simple de gérer mon stress quotidien. Les micro-actions sont parfaites.',
      result: '-35% stress',
    },
    {
      name: 'Thomas L.',
      text: 'En 30 secondes, je me sens recentré. C\'est devenu un rituel essentiel de ma journée.',
      result: '+42% focus',
    },
    {
      name: 'Emma K.',
      text: 'L\'amélioration est visible dès la première semaine. Je recommande à tous mes proches.',
      result: '-28% anxiété',
    },
  ],

  FAQ_QUESTIONS: [
    {
      question: 'Puis-je annuler à tout moment ?',
      answer: 'Oui, tu peux annuler ton abonnement à tout moment depuis les paramètres de ton compte. Aucun frais d\'annulation.',
    },
    {
      question: 'Quels modes de paiement sont acceptés ?',
      answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), Apple Pay, Google Pay et les paiements via Stripe.',
    },
    {
      question: 'Y a-t-il une garantie de remboursement ?',
      answer: 'Oui, nous offrons une garantie satisfait ou remboursé de 30 jours. Si tu n\'es pas satisfait, contacte-nous.',
    },
    {
      question: 'Puis-je utiliser l\'app sur plusieurs appareils ?',
      answer: 'Oui, ton abonnement est lié à ton compte et fonctionne sur tous tes appareils (iPhone, iPad, Android).',
    },
    {
      question: 'Que se passe-t-il après la période d\'essai ?',
      answer: 'Après la période d\'essai, tu peux choisir de t\'abonner ou continuer avec les fonctionnalités gratuites limitées.',
    },
  ],

  DEFAULT_PRICING: {
    monthly: {
      original: 999, // 9.99 EUR in cents
      discounted: undefined,
    },
    annual: {
      original: 9999, // 99.99 EUR in cents
      discounted: 7999, // 79.99 EUR in cents (discount)
      savingsPercent: 33,
    },
    currency: 'EUR' as const,
    influencerDiscount: null,
  } as PricingDisplay,
};
