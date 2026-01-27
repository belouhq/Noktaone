/**
 * Paywall Types
 */

export type SupportedCurrency = 
  // Tier 1
  | 'USD' | 'EUR' | 'GBP'
  // Tier 2
  | 'CAD' | 'AUD' | 'CHF'
  // Tier 3
  | 'JPY' | 'CNY' | 'HKD' | 'SGD' | 'KRW' | 'INR'
  // Tier 4
  | 'BRL' | 'MXN'
  // Tier 5
  | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK'
  // Tier 6
  | 'AED' | 'ILS' | 'ZAR'
  // Tier 7
  | 'TRY' | 'THB' | 'PHP' | 'IDR' | 'MYR' | 'VND'
  // Tier 8
  | 'NZD' | 'TWD' | 'HUF' | 'RON'
  // Legacy / already used in codebase
  | 'RUB';

export type PaywallTrigger = 
  | 'trial_expired'
  | 'daily_limit_reached'
  | 'feature_gated'
  | 'manual'
  | null;

export interface PricingDisplay {
  monthly: {
    original: number; // in cents
    discounted?: number; // in cents
  };
  annual: {
    original: number; // in cents
    discounted?: number; // in cents
    savingsPercent: number;
  };
  currency: SupportedCurrency;
  influencerDiscount?: {
    code: string;
    influencerName: string;
    percent: number;
    validMonths: number;
  } | null;
}

export interface TrialProgress {
  totalSkanes: number;
  trialDay: number;
  averageScoreBefore: number;
  averageScoreAfter: number;
  averageImprovement: number; // percentage
}
