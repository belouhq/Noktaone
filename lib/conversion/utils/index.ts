/**
 * Conversion System Utilities
 * 
 * Helper functions for conversion logic
 */

import type { TrialProgress, PaywallTrigger } from '@/lib/paywall/types';
import { CONVERSION_THRESHOLDS } from '../constants';

/**
 * Calculate conversion probability based on trial progress
 * @param progress Trial progress data
 * @returns Probability between 0 and 1
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
 * @param progress Trial progress data
 * @param trialDay Current day of trial
 * @returns Recommended trigger
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
  if (trialDay >= 7) return 'trial_day_7_warning';
  if (trialDay >= 5 && probability >= CONVERSION_THRESHOLDS.MEDIUM) {
    return 'daily_limit_reached';
  }

  return null;
}

/**
 * Check if user should see paywall based on trial status
 * @param subscriptionStatus Current subscription status
 * @param trialEndDate Trial end date
 * @returns Whether paywall should be shown
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
 * @param trialEndDate Trial end date
 * @returns Formatted string
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
