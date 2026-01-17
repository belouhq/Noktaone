/**
 * Score Engine FlowV1
 * Calcule les Skane Index avec fourchettes dynamiques
 */

import type { InternalState } from '@/lib/skane/types';
import { SKANE_INDEX_CONFIG, IMPACT_BASE, ACTION_BONUS, AMPLIFIER_BONUS } from './config';
import { mulberry32, clamp, intInRange, floatInRange, lerp, smoothstep, generateSeed } from './utils';

interface ScoreContext {
  state: InternalState;
  rawDysregulation: number; // 0-1
  userId: string | null;
  sessionId: string;
  actionId: string;
  amplifierEnabled: boolean;
}

/**
 * Calcule le Skane Index BEFORE avec fourchettes dynamiques
 */
export function computeBeforeScore(context: ScoreContext): number {
  const { state, rawDysregulation, userId, sessionId } = context;
  
  const seed = generateSeed(userId, sessionId);
  const rng1 = mulberry32(seed);
  const rng2 = mulberry32(seed ^ 0x9e3779b9);

  const [baseMin, baseMax] = SKANE_INDEX_CONFIG.BASE_BEFORE[state];
  const [safeMin, safeMax] = SKANE_INDEX_CONFIG.SAFE_BEFORE[state];

  // 1) Variation de la fourchette : ±5
  const shift = intInRange(rng1, ...SKANE_INDEX_CONFIG.RANGE_SHIFT);
  let minR = baseMin + shift;
  let maxR = baseMax + shift;

  // 2) Clamp dans des bornes safe
  minR = clamp(minR, safeMin, safeMax);
  maxR = clamp(maxR, safeMin, safeMax);

  // 3) S'assure que min < max (au moins 6 points d'écart)
  if (maxR - minR < 6) {
    maxR = clamp(minR + 6, safeMin, safeMax);
  }

  // 4) Projection raw → score dans la fourchette avec smoothstep
  let score = lerp(minR, maxR, smoothstep(0.35, 0.85, rawDysregulation));

  // 5) Micro bruit stable ±2
  score += floatInRange(rng2, ...SKANE_INDEX_CONFIG.VALUE_NOISE);

  // 6) Retour entier clampé
  return clamp(Math.round(score), 0, 100);
}

/**
 * Calcule le Skane Index AFTER avec impact de l'action
 */
export function computeAfterScore(context: ScoreContext, beforeScore: number): number {
  const { state, actionId, amplifierEnabled, userId, sessionId } = context;
  
  const seed = generateSeed(userId, sessionId);
  const rng1 = mulberry32(seed ^ 0x5a827999);
  const rng2 = mulberry32(seed ^ 0x6ed9eba1);
  const rng3 = mulberry32(seed ^ 0x8f1bbcdc);

  // 1) Impact base selon l'état
  const [impactMin, impactMax] = IMPACT_BASE[state];
  const impactBase = floatInRange(rng1, impactMin, impactMax);

  // 2) Bonus action
  const actionBonus = ACTION_BONUS[actionId] || 0;

  // 3) Bonus amplificateur (si activé)
  let ampBonus = 0;
  if (amplifierEnabled) {
    ampBonus = floatInRange(rng2, ...AMPLIFIER_BONUS);
  }

  // 4) Calcul impact total
  const impact = impactBase + actionBonus + ampBonus;

  // 5) Score après
  let after = beforeScore - impact;

  // 6) Projection dans la fourchette AFTER de l'état
  const [afterMin, afterMax] = SKANE_INDEX_CONFIG.BASE_AFTER[state];
  const [safeAfterMin, safeAfterMax] = SKANE_INDEX_CONFIG.SAFE_AFTER[state];

  // Applique variation de fourchette (±5)
  const shift = intInRange(rng3, ...SKANE_INDEX_CONFIG.RANGE_SHIFT);
  let minAfter = afterMin + shift;
  let maxAfter = afterMax + shift;
  minAfter = clamp(minAfter, safeAfterMin, safeAfterMax);
  maxAfter = clamp(maxAfter, safeAfterMin, safeAfterMax);

  // Clamp dans la fourchette
  after = clamp(after, minAfter, maxAfter);

  // 7) Bruit interne ±2
  const rng4 = mulberry32(seed ^ 0xca62c1d6);
  after += floatInRange(rng4, ...SKANE_INDEX_CONFIG.VALUE_NOISE);

  // 8) Vérifie le delta minimal pour effet "wow"
  const minDelta = SKANE_INDEX_CONFIG.MIN_DELTA[state];
  const delta = beforeScore - after;
  
  if (delta < minDelta) {
    // Corrige en rapprochant after de la borne basse
    after = beforeScore - minDelta;
    after = clamp(after, minAfter, maxAfter);
  }

  // 9) Retour entier clampé
  return clamp(Math.round(after), 0, 100);
}

/**
 * Calcule le raw dysregulation score (0-1) depuis les features
 */
export function computeRawDysregulation(features: {
  eye_openness: number;
  blink_rate: number;
  brow_furrow: number;
  jaw_tension: number;
  lip_compression: number;
  head_jitter: number;
  skin_tone_variance: number;
  symmetry_delta: number;
}): number {
  // Normaliser toutes les features (clamp 0-1)
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

  // Raw dysregulation = max des axes pondéré + moyenne des features
  const maxAxis = Math.max(activationAxis, energyAxis);
  const meanFeatures = (
    normalized.eye_openness +
    normalized.blink_rate +
    normalized.brow_furrow +
    normalized.jaw_tension +
    normalized.lip_compression +
    normalized.head_jitter +
    normalized.skin_tone_variance +
    normalized.symmetry_delta
  ) / 8;

  const raw = 0.55 * maxAxis + 0.45 * meanFeatures;
  return clamp(raw, 0, 1);
}
