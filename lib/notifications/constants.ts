/**
 * Notification Templates and Constants
 */

import type { SupportedLocale } from '@/types/subscription';
import type { SupportedCurrency } from '@/lib/paywall/types';

export type NotificationType =
  | 'trial_welcome'
  | 'trial_day_reminder'
  | 'streak_celebration'
  | 'feature_unlock'
  | 'trial_day_7_warning'
  | 'trial_day_8_offer'
  | 'trial_day_9_urgency'
  | 'trial_day_10_final'
  | 'winback_day_3'
  | 'winback_day_7'
  | 'winback_day_14'
  | 'winback_day_30'
  | 'streak_at_risk'
  | 'streak_5'
  | 'streak_7'
  | 'streak_14'
  | 'streak_21'
  | 'streak_30';

export interface NotificationTemplate {
  title: string;
  body: string;
}

export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  trial_welcome: {
    title: 'Bienvenue sur Nokta One',
    body: '{{firstName}}, commence ton essai gratuit de 10 jours. Transforme 30 secondes en changement durable.',
  },
  trial_day_reminder: {
    title: 'Temps de reset',
    body: '{{firstName}}, prends 30 secondes pour toi. Ton corps te remerciera.',
  },
  streak_celebration: {
    title: '🔥 Série en cours !',
    body: '{{firstName}}, tu es sur une belle série. Continue comme ça !',
  },
  feature_unlock: {
    title: 'Nouvelle fonctionnalité',
    body: '{{firstName}}, découvre les nouvelles micro-actions disponibles.',
  },
  trial_day_7_warning: {
    title: '3 jours restants',
    body: '{{firstName}}, ton essai se termine dans 3 jours. Continue ton parcours avec {{monthlyPrice}}/mois.',
  },
  trial_day_8_offer: {
    title: 'Offre spéciale',
    body: '{{firstName}}, ne perds pas ton amélioration. Abonne-toi maintenant à {{monthlyPrice}}/mois.',
  },
  trial_day_9_urgency: {
    title: 'Dernière chance',
    body: '{{firstName}}, il ne reste qu\'un jour. Rejoins les milliers d\'utilisateurs satisfaits.',
  },
  trial_day_10_final: {
    title: 'Ton essai se termine aujourd\'hui',
    body: '{{firstName}}, continue ton parcours. Abonne-toi maintenant à {{monthlyPrice}}/mois.',
  },
  winback_day_3: {
    title: 'On te manque',
    body: '{{firstName}}, reviens et continue ton parcours. Offre spéciale : {{monthlyPrice}}/mois.',
  },
  winback_day_7: {
    title: 'Tu nous manques',
    body: '{{firstName}}, reprends où tu t\'es arrêté. Offre limitée : {{monthlyPrice}}/mois.',
  },
  winback_day_14: {
    title: 'Dernière chance',
    body: '{{firstName}}, ne perds pas tes progrès. Rejoins-nous à {{monthlyPrice}}/mois.',
  },
  winback_day_30: {
    title: 'Offre spéciale',
    body: '{{firstName}}, reviens et profite d\'une offre exclusive : {{monthlyPrice}}/mois.',
  },
  streak_at_risk: {
    title: '⚠️ Ta série est en danger',
    body: '{{firstName}}, tu as {{streak}} jours consécutifs. Ne casse pas ta série maintenant !',
  },
  streak_5: {
    title: '🔥 5 jours de suite !',
    body: '{{firstName}}, tu as créé une habitude. Continue comme ça !',
  },
  streak_7: {
    title: '🔥 7 jours de suite !',
    body: '{{firstName}}, tu as créé une habitude. C\'est le début !',
  },
  streak_14: {
    title: '🏆 14 jours de suite !',
    body: '{{firstName}}, tu es sur la bonne voie. Félicitations !',
  },
  streak_21: {
    title: '🏆 21 jours de suite !',
    body: '{{firstName}}, tu as créé une habitude solide. Continue !',
  },
  streak_30: {
    title: '🏆 30 jours de suite !',
    body: '{{firstName}}, tu es un maître du reset. Félicitations !',
  },
};

export interface LocalePricing {
  monthly: number; // in cents
  annual: number; // in cents
  currency: SupportedCurrency;
}

export const LOCALE_PRICING: Record<SupportedLocale, LocalePricing> = {
  fr: { monthly: 999, annual: 7999, currency: 'EUR' },
  en: { monthly: 999, annual: 7999, currency: 'USD' },
  es: { monthly: 999, annual: 7999, currency: 'EUR' },
  de: { monthly: 999, annual: 7999, currency: 'EUR' },
  it: { monthly: 999, annual: 7999, currency: 'EUR' },
  pt: { monthly: 999, annual: 7999, currency: 'EUR' },
  ar: { monthly: 999, annual: 7999, currency: 'USD' },
  hi: { monthly: 499, annual: 3999, currency: 'USD' },
  id: { monthly: 999, annual: 7999, currency: 'USD' },
  ja: { monthly: 1299, annual: 9999, currency: 'USD' },
  ko: { monthly: 1299, annual: 9999, currency: 'USD' },
  zh: { monthly: 999, annual: 7999, currency: 'USD' },
};
