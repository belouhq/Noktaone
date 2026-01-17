/**
 * Scan Features FlowV1
 * Extrait les features depuis l'analyse GPT ou calcule depuis l'image
 */

import type { InferredSignals } from '@/lib/skane/types';

/**
 * Convertit les signaux inférés GPT en features complètes
 * Si certains signaux manquent, on les infère depuis ceux disponibles
 */
export function extractFeaturesFromSignals(signals: Partial<InferredSignals>): {
  eye_openness: number;
  blink_rate: number;
  brow_furrow: number;
  jaw_tension: number;
  lip_compression: number;
  head_jitter: number;
  skin_tone_variance: number;
  symmetry_delta: number;
} {
  // Utilise les signaux GPT si disponibles, sinon valeurs par défaut
  const eye_openness = signals.eye_openness ?? 0.5;
  const blink_rate = signals.blink_rate ?? 0.5;
  const brow_furrow = signals.forehead_tension ?? 0.5;
  const jaw_tension = signals.jaw_tension ?? 0.5;
  const lip_compression = signals.lip_compression ?? 0.5;
  
  // Inférer head_jitter depuis head_stability (inverse)
  const head_jitter = signals.head_stability !== undefined 
    ? 1 - signals.head_stability 
    : 0.5;
  
  // Inférer skin_tone_variance depuis les autres signaux (corrélation avec tension)
  const skin_tone_variance = 
    (brow_furrow + jaw_tension + lip_compression) / 3;
  
  // Inférer symmetry_delta depuis les différences de tension
  const symmetry_delta = Math.abs(brow_furrow - jaw_tension) * 0.5 + 
                         Math.abs(eye_openness - 0.5) * 0.5;

  return {
    eye_openness,
    blink_rate,
    brow_furrow,
    jaw_tension,
    lip_compression,
    head_jitter,
    skin_tone_variance,
    symmetry_delta,
  };
}

/**
 * Génère des features par défaut (fallback)
 */
export function generateDefaultFeatures(): {
  eye_openness: number;
  blink_rate: number;
  brow_furrow: number;
  jaw_tension: number;
  lip_compression: number;
  head_jitter: number;
  skin_tone_variance: number;
  symmetry_delta: number;
} {
  // Valeurs moyennes pour un état REGULATED
  return {
    eye_openness: 0.6,
    blink_rate: 0.4,
    brow_furrow: 0.3,
    jaw_tension: 0.3,
    lip_compression: 0.2,
    head_jitter: 0.2,
    skin_tone_variance: 0.3,
    symmetry_delta: 0.2,
  };
}
