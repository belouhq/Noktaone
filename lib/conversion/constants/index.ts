/**
 * Conversion System Constants
 * 
 * All constants for pricing, trial configuration, and templates
 */

// Re-export from paywall constants
export { PAYWALL_CONFIG } from '@/lib/paywall/constants';

// Re-export from notification constants
export { NOTIFICATION_TEMPLATES, LOCALE_PRICING } from '@/lib/notifications/constants';

// Trial configuration
export const TRIAL_CONFIG = {
  DURATION_DAYS: 10,
  MAX_SKANES_PER_DAY: 3,
  CONVERSION_WINDOW_DAYS: 3, // Days after trial expiry to still convert
} as const;

// Conversion triggers configuration
export const CONVERSION_TRIGGERS = {
  TRIAL_DAY_7: { day: 7, hour: 10, type: 'trial_day_7_warning' as const },
  TRIAL_DAY_8: { day: 8, hour: 10, type: 'trial_day_8_offer' as const },
  TRIAL_DAY_9: { day: 9, hour: 10, type: 'trial_day_9_urgency' as const },
  TRIAL_DAY_10: { day: 10, hour: 8, type: 'trial_day_10_final' as const },
  TRIAL_EXPIRED: { type: 'trial_expired' as const },
  DAILY_LIMIT: { type: 'daily_limit_reached' as const },
} as const;

// Conversion probability thresholds
export const CONVERSION_THRESHOLDS = {
  HIGH: 0.7, // 70%+ chance to convert
  MEDIUM: 0.4, // 40-70% chance
  LOW: 0.1, // 10-40% chance
} as const;
