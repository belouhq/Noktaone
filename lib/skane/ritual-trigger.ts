/**
 * Ritual Trigger - Moment Rituel Nokta
 * 
 * Le rituel ne peut être suggéré que si :
 * - ≥5 micro-actions complétées
 * - ≥60% de feedback positif
 * - ≥3 jours depuis premier usage
 * - ≥2 jours distincts avec usage
 */

import { supabase } from '@/lib/supabase/client';

// ============================================
// CONFIG
// ============================================

const RITUAL_THRESHOLDS = {
  minActions: 5,
  minPositiveRate: 0.6,
  minDaysSinceFirst: 3,
  minDistinctDays: 2,
};

// ============================================
// TYPES
// ============================================

export interface RitualEligibility {
  eligible: boolean;
  reason: string;
  stats: {
    totalActions: number;
    positiveRate: number;
    daysSinceFirst: number;
    distinctDays: number;
  };
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

export async function checkRitualEligibility(userId: string): Promise<RitualEligibility> {
  try {
    const { data: events, error } = await supabase
      .from('micro_action_events')
      .select('effect, created_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('created_at', { ascending: true });

    if (error || !events || events.length === 0) {
      return {
        eligible: false,
        reason: 'no_actions',
        stats: { totalActions: 0, positiveRate: 0, daysSinceFirst: 0, distinctDays: 0 },
      };
    }

    const totalActions = events.length;

    const withFeedback = events.filter(e => e.effect !== null);
    const positiveCount = withFeedback.filter(e => e.effect === 1).length;
    const positiveRate = withFeedback.length > 0 ? positiveCount / withFeedback.length : 0;

    const firstUsage = new Date(events[0].created_at);
    const now = new Date();
    const daysSinceFirst = Math.floor((now.getTime() - firstUsage.getTime()) / (1000 * 60 * 60 * 24));

    const distinctDays = new Set(
      events.map(e => new Date(e.created_at).toISOString().split('T')[0])
    ).size;

    const stats = { totalActions, positiveRate, daysSinceFirst, distinctDays };

    if (totalActions < RITUAL_THRESHOLDS.minActions) {
      return { eligible: false, reason: 'not_enough_actions', stats };
    }
    if (positiveRate < RITUAL_THRESHOLDS.minPositiveRate) {
      return { eligible: false, reason: 'positive_rate_too_low', stats };
    }
    if (daysSinceFirst < RITUAL_THRESHOLDS.minDaysSinceFirst) {
      return { eligible: false, reason: 'too_recent', stats };
    }
    if (distinctDays < RITUAL_THRESHOLDS.minDistinctDays) {
      return { eligible: false, reason: 'not_enough_distinct_days', stats };
    }

    return { eligible: true, reason: 'eligible', stats };
  } catch (error) {
    console.error('checkRitualEligibility error:', error);
    return {
      eligible: false,
      reason: 'error',
      stats: { totalActions: 0, positiveRate: 0, daysSinceFirst: 0, distinctDays: 0 },
    };
  }
}

// ============================================
// MICRO-COPY
// ============================================

export const RITUAL_MICROCOPY = {
  suggestion: {
    fr: "Certains utilisateurs aiment associer ces moments à un rituel calme (boisson chaude, silence, lumière douce). C'est optionnel.",
    en: "Some users like to pair these moments with a calm ritual (warm drink, silence, soft light). It's optional.",
  },
};

// ============================================
// EXPORTS
// ============================================

export { RITUAL_THRESHOLDS };
