/**
 * Conversion System Utilities
 * 
 * Helper functions for conversion logic, pricing, dates, and validation
 */

import type { TrialProgress, PaywallTrigger, PricingDisplay } from '@/lib/paywall/types';
import { CONVERSION_THRESHOLDS, LOCALE_PRICING, TRIAL_CONFIG, FREE_MODE_CONFIG } from '../constants';
import type { SupportedLocale, SupportedCurrency } from '../constants';
import { formatPrice as formatPriceUtil } from '@/lib/utils/formatPrice';

// ===================
// CONVERSION UTILITIES
// ===================

/**
 * Calculate conversion probability based on trial progress
 */
export function calculateConversionProbability(
  progress: TrialProgress | null
): number {
  if (!progress) return 0;

  let probability = 0;

  // Base probability from total skanes (more skanes = higher engagement)
  const skaneScore = Math.min(progress.totalSkanes / 30, 1) * 0.3; // Max 30% from skanes
  probability += skaneScore;

  // Improvement score (positive improvement = higher conversion)
  const improvementScore = Math.max(0, progress.averageImprovement / 50) * 0.4; // Max 40% from improvement
  probability += improvementScore;

  // Trial day score (later in trial = higher urgency)
  const dayScore = Math.min(progress.trialDay / 10, 1) * 0.2; // Max 20% from day
  probability += dayScore;

  // Distinct days score (consistency matters)
  const distinctDays = progress.trialDay; // Assuming trialDay represents distinct days
  const consistencyScore = Math.min(distinctDays / 10, 1) * 0.1; // Max 10% from consistency
  probability += consistencyScore;

  return Math.min(probability, 1);
}

/**
 * Determine the best paywall trigger based on trial progress
 */
export function getRecommendedTrigger(
  progress: TrialProgress | null,
  trialDay: number
): PaywallTrigger {
  if (!progress) return null;

  const probability = calculateConversionProbability(progress);

  // High probability + late in trial = urgency trigger
  if (probability >= CONVERSION_THRESHOLDS.HIGH && trialDay >= 8) {
    return 'trial_expired';
  }

  // Day-based triggers
  if (trialDay >= 10) return 'trial_expired';
  if (trialDay >= 7) return 'trial_expired';
  if (trialDay >= 5 && probability >= CONVERSION_THRESHOLDS.MEDIUM) {
    return 'daily_limit_reached';
  }

  return null;
}

/**
 * Check if user should see paywall based on trial status
 */
export function shouldShowPaywall(
  subscriptionStatus: string,
  trialEndDate: Date | null
): boolean {
  // Don't show if already subscribed
  if (subscriptionStatus === 'active' || subscriptionStatus === 'premium') {
    return false;
  }

  // Show if trial expired or about to expire
  if (trialEndDate) {
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Show if expired or within 3 days of expiry
    return daysUntilExpiry <= 3;
  }

  // Show if no trial (free user)
  return subscriptionStatus === 'free' || !subscriptionStatus;
}

/**
 * Format trial days remaining
 */
export function formatTrialDaysRemaining(trialEndDate: Date | null): string {
  if (!trialEndDate) return '';

  const now = new Date();
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expiré';
  if (diffDays === 0) return 'Aujourd\'hui';
  if (diffDays === 1) return '1 jour restant';
  return `${diffDays} jours restants`;
}

// ===================
// PRICING UTILITIES
// ===================

/**
 * Get pricing for a locale
 */
export function getPricingForLocale(locale: SupportedLocale) {
  return LOCALE_PRICING[locale] || LOCALE_PRICING.en;
}

// ===================
// TRIAL UTILITIES
// ===================

/**
 * Calculate trial day (1-10)
 */
export function calculateTrialDay(trialStartDate: Date): number {
  const now = new Date();
  const start = new Date(trialStartDate);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays + 1, 1), TRIAL_CONFIG.durationDays + 1);
}

/**
 * Check if trial is expired
 */
export function isTrialExpired(trialStartDate: Date): boolean {
  const trialDay = calculateTrialDay(trialStartDate);
  return trialDay > TRIAL_CONFIG.durationDays;
}

/**
 * Calculate remaining trial days
 */
export function getTrialDaysRemaining(trialStartDate: Date): number {
  const trialDay = calculateTrialDay(trialStartDate);
  return Math.max(0, TRIAL_CONFIG.durationDays - trialDay + 1);
}

/**
 * Calculate trial end date
 */
export function getTrialEndDate(trialStartDate: Date): Date {
  const endDate = new Date(trialStartDate);
  endDate.setDate(endDate.getDate() + TRIAL_CONFIG.durationDays);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}

/**
 * Check if user can perform a skane
 */
export function canPerformSkane(
  subscriptionStatus: string,
  todaySkanesCount: number
): { allowed: boolean; reason?: string } {
  // Premium and trial = unlimited
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trial') {
    return { allowed: true };
  }
  
  // Free = 1/day
  if (todaySkanesCount >= FREE_MODE_CONFIG.skanePerDay) {
    return { 
      allowed: false, 
      reason: 'daily_limit_reached' 
    };
  }
  
  return { allowed: true };
}

// ===================
// DATE UTILITIES
// ===================

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Format countdown (HH:MM:SS)
 */
export function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) return '00:00:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}

// ===================
// STRING UTILITIES
// ===================

/**
 * Replace placeholders in template
 * Ex: "Bonjour {name}!" with {name: "Benjamin"} => "Bonjour Benjamin!"
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

// ===================
// VALIDATION UTILITIES
// ===================

/**
 * Validate if locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return Object.keys(LOCALE_PRICING).includes(locale);
}

/**
 * Detect user locale from browser
 */
export function detectUserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  
  if (isValidLocale(browserLang)) {
    return browserLang;
  }
  
  return 'en';
}
