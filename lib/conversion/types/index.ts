/**
 * Conversion System Types
 * 
 * All TypeScript types for the conversion system
 */

// Re-export from paywall types
export type {
  PricingDisplay,
  TrialProgress,
  PaywallTrigger,
  SupportedCurrency,
} from '@/lib/paywall/types';

// Re-export from subscription types
export type {
  SubscriptionPlan,
  SupportedLocale,
} from '@/types/subscription';

// Re-export from notification types
export type {
  NotificationType,
} from '@/lib/notifications/types';

// Additional conversion-specific types
export interface ConversionMetrics {
  trialStartDate: Date;
  trialEndDate: Date;
  totalSkanes: number;
  averageImprovement: number;
  conversionProbability: number; // 0-1
  recommendedTrigger: PaywallTrigger | null;
}

export interface PaywallState {
  isVisible: boolean;
  trigger: PaywallTrigger | null;
  pricing: PricingDisplay;
  trialProgress: TrialProgress | null;
}
