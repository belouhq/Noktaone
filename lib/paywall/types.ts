/**
 * Paywall Types
 */

export type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'AUD';

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
