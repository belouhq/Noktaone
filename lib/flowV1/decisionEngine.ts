/**
 * Decision Engine FlowV1
 * Détermine l'état interne depuis les features avec hystérésis
 */

import type { InternalState } from '@/lib/skane/types';
import { clamp } from './utils';

interface Features {
  eye_openness: number;
  blink_rate: number;
  brow_furrow: number;
  jaw_tension: number;
  lip_compression: number;
  head_jitter: number;
  skin_tone_variance: number;
  symmetry_delta: number;
}

interface DecisionContext {
  features: Features;
  previousState?: InternalState;
}

/**
 * Détermine l'état interne avec hystérésis pour éviter les sauts
 */
export function determineInternalState(context: DecisionContext): InternalState {
  const { features, previousState } = context;

  // Normaliser toutes les features
  const normalized = {
    eye_openness: clamp(features.eye_openness, 0, 1),
    blink_rate: clamp(features.blink_rate, 0, 1),
    brow_furrow: clamp(features.brow_furrow, 0, 1),
    jaw_tension: clamp(features.jaw_tension, 0, 1),
    lip_compression: clamp(features.lip_compression, 0, 1),
    head_jitter: clamp(features.head_jitter, 0, 1),
    skin_tone_variance: clamp(features.skin_tone_variance, 0, 1),
    symmetry_delta: clamp(features.symmetry_delta, 0, 1),
  };

  // Calcul des axes
  const activationAxis = 
    0.25 * normalized.brow_furrow +
    0.25 * normalized.jaw_tension +
    0.20 * normalized.head_jitter +
    0.15 * normalized.lip_compression +
    0.15 * normalized.symmetry_delta;

  const energyAxis =
    0.35 * (1 - normalized.eye_openness) +
    0.25 * normalized.skin_tone_variance +
    0.25 * (1 - normalized.blink_rate) +
    0.15 * normalized.symmetry_delta;

  // Seuils avec hystérésis
  const HIGH_THRESHOLD = 0.62;
  const HIGH_EXIT_THRESHOLD = 0.55; // Plus bas pour sortir de HIGH
  const LOW_THRESHOLD = 0.58;
  const LOW_EXIT_THRESHOLD = 0.50; // Plus bas pour sortir de LOW

  // Règles de décision avec hystérésis
  if (previousState === 'HIGH_ACTIVATION') {
    // Si on était HIGH, il faut descendre sous 0.55 pour quitter
    if (activationAxis >= HIGH_EXIT_THRESHOLD) {
      return 'HIGH_ACTIVATION';
    }
  } else if (previousState === 'LOW_ENERGY') {
    // Si on était LOW, il faut descendre sous 0.50 pour quitter
    if (energyAxis >= LOW_EXIT_THRESHOLD) {
      return 'LOW_ENERGY';
    }
  }

  // Décision normale (sans hystérésis ou après sortie)
  if (activationAxis >= HIGH_THRESHOLD) {
    return 'HIGH_ACTIVATION';
  }
  
  if (energyAxis >= LOW_THRESHOLD) {
    return 'LOW_ENERGY';
  }

  return 'REGULATED';
}

/**
 * Détermine si un amplificateur doit être activé
 */
export function shouldEnableAmplifier(
  state: InternalState,
  rawDysregulation: number,
  hasUsedAmplifierToday: boolean
): boolean {
  // Règles minimales
  if (state === 'REGULATED') return false;
  if (rawDysregulation < 0.70) return false;
  if (hasUsedAmplifierToday) return false;
  
  return true;
}
