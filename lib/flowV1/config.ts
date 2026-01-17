/**
 * FlowV1 Configuration
 * Feature flag pour activer le nouveau flow
 */

export const FLOW_V1_ENABLED = process.env.NEXT_PUBLIC_FLOW_V1 === 'true' || false;

// Configuration des fourchettes Skane Index
export const SKANE_INDEX_CONFIG = {
  BASE_BEFORE: {
    HIGH_ACTIVATION: [83, 91] as [number, number],
    LOW_ENERGY: [78, 88] as [number, number],
    REGULATED: [42, 58] as [number, number],
  },
  SAFE_BEFORE: {
    HIGH_ACTIVATION: [78, 96] as [number, number],
    LOW_ENERGY: [72, 93] as [number, number],
    REGULATED: [35, 65] as [number, number],
  },
  BASE_AFTER: {
    HIGH_ACTIVATION: [18, 32] as [number, number],
    LOW_ENERGY: [20, 35] as [number, number],
    REGULATED: [18, 30] as [number, number],
  },
  SAFE_AFTER: {
    HIGH_ACTIVATION: [12, 38] as [number, number],
    LOW_ENERGY: [14, 42] as [number, number],
    REGULATED: [10, 36] as [number, number],
  },
  // Delta minimal pour effet "wow"
  MIN_DELTA: {
    HIGH_ACTIVATION: 45,
    LOW_ENERGY: 38,
    REGULATED: 15,
  },
  // Variation de fourchette (±5)
  RANGE_SHIFT: [-5, 5] as [number, number],
  // Bruit interne (±2)
  VALUE_NOISE: [-2, 2] as [number, number],
} as const;

// Impact base par état
export const IMPACT_BASE = {
  HIGH_ACTIVATION: [52, 68] as [number, number],
  LOW_ENERGY: [45, 62] as [number, number],
  REGULATED: [18, 30] as [number, number],
} as const;

// Bonus par action
export const ACTION_BONUS: Record<string, number> = {
  physiological_sigh: 6,
  expiration_3_8: 5,
  shake_neuromusculaire: 4,
  drop_trapezes: 3,
  box_breathing: 2,
  respiration_4_6: 2,
  respiration_2_1: 2,
  ouverture_thoracique: 1,
  posture_ancrage: 1,
  pression_plantaire: 1,
  regard_fixe_expiration: 1,
};

// Bonus amplificateur
export const AMPLIFIER_BONUS = [4, 9] as [number, number];
