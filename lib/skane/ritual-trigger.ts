/**
 * Ritual Trigger - Moment Rituel Nokta
 * 
 * Le rituel ne peut être suggéré que si :
 * - ≥5 micro-actions complétées
 * - ≥60% de feedback positif
 * - ≥3 jours depuis premier usage
 * - ≥2 jours distincts avec usage
 * 
 * "On ne vend pas du thé à des utilisateurs. 
 *  On propose un rituel à des personnes qui ont déjà repris le contrôle."
 */

import { supabase } from '@/lib/supabase/client';

// ============================================
// CONFIG
// ============================================

const RITUAL_THRESHOLDS = {
  minActions: 5,           // Minimum 5 micro-actions
  minPositiveRate: 0.6,    // Minimum 60% feedback positif
  minDaysSinceFirst: 3,    // Minimum 3 jours depuis premier usage
  minDistinctDays: 2,      // Minimum 2 jours distincts avec usage
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
    // Récupérer toutes les micro-actions de l'utilisateur
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
    
    // === Calculs ===
    
    // 1. Total actions
    const totalActions = events.length;
    
    // 2. Taux de feedback positif (effect = 1)
    const withFeedback = events.filter(e => e.effect !== null);
    const positiveCount = withFeedback.filter(e => e.effect === 1).length;
    const positiveRate = withFeedback.length > 0 
      ? positiveCount / withFeedback.length 
      : 0;
    
    // 3. Jours depuis premier usage
    const firstUsage = new Date(events[0].created_at);
    const now = new Date();
    const daysSinceFirst = Math.floor(
      (now.getTime() - firstUsage.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // 4. Jours distincts avec usage
    const distinctDays = new Set(
      events.map(e => new Date(e.created_at).toISOString().split('T')[0])
    ).size;
    
    const stats = { totalActions, positiveRate, daysSinceFirst, distinctDays };
    
    // === Vérifications ===
    
    if (totalActions < RITUAL_THRESHOLDS.minActions) {
      return {
        eligible: false,
        reason: `need_${RITUAL_THRESHOLDS.minActions - totalActions}_more_actions`,
        stats,
      };
    }
    
    if (positiveRate < RITUAL_THRESHOLDS.minPositiveRate) {
      return {
        eligible: false,
        reason: 'positive_rate_too_low',
        stats,
      };
    }
    
    if (daysSinceFirst < RITUAL_THRESHOLDS.minDaysSinceFirst) {
      return {
        eligible: false,
        reason: `wait_${RITUAL_THRESHOLDS.minDaysSinceFirst - daysSinceFirst}_more_days`,
        stats,
      };
    }
    
    if (distinctDays < RITUAL_THRESHOLDS.minDistinctDays) {
      return {
        eligible: false,
        reason: 'need_more_distinct_days',
        stats,
      };
    }
    
    // ✅ Éligible
    return {
      eligible: true,
      reason: 'eligible',
      stats,
    };
    
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
// HOOK REACT (optionnel)
// ============================================

/**
 * Usage dans un composant :
 * 
 * const { eligible, stats } = useRitualEligibility(userId);
 * 
 * {eligible && (
 *   <RitualSuggestion />
 * )}
 */

// ============================================
// MICRO-COPY
// ============================================

export const RITUAL_MICROCOPY = {
  // Suggestion initiale (quand éligible)
  suggestion: {
    fr: "Certains utilisateurs aiment associer ces moments à un rituel calme (boisson chaude, silence, lumière douce). C'est optionnel.",
    en: "Some users like to pair these moments with a calm ritual (warm drink, silence, soft light). It's optional.",
  },
  
  // Jamais mentionner :
  // - "thé"
  // - "Nokta Tea"
  // - promesses d'efficacité
  // - obligation
};

// ============================================
// EXPORTS
// ============================================

export { RITUAL_THRESHOLDS };
