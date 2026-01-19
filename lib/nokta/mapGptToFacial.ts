/**
 * Mappe les réponses GPT (canon, analyze-full) vers FacialAnalysisData
 * pour le scoring interne Nokta.
 */

import type { FacialAnalysisData } from "./types";

interface InferredSignals {
  eye_openness?: number;
  blink_rate?: number;
  jaw_tension?: number;
  lip_compression?: number;
  forehead_tension?: number;
  head_stability?: number;
}

interface PhysiologicalSignals {
  eye_openness?: number;
  jaw_tension?: number;
  brow_tension?: number;
  forehead_tension?: number;
  eye_fatigue?: number;
  [k: string]: number | undefined;
}

/** Analyse canon (prompt-canon) ou analyse-full */
interface GptLikeAnalysis {
  internal_state?: string;
  activation_state?: { primary_state?: string };
  inferred_signals?: InferredSignals;
  physiological_signals?: PhysiologicalSignals;
  facial_signals?: PhysiologicalSignals;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Produit un FacialAnalysisData à partir d’une analyse GPT.
 * Utilise inferred_signals si présent, sinon physiological_signals / facial_signals,
 * sinon des valeurs par défaut dérivées de l’état (HIGH_ACTIVATION / LOW_ENERGY / REGULATED).
 */
export function mapGptToFacial(analysis: GptLikeAnalysis | null | undefined): FacialAnalysisData {
  const state = (analysis?.internal_state || analysis?.activation_state?.primary_state || "REGULATED").toUpperCase();
  const inf = analysis?.inferred_signals;
  const phys = analysis?.physiological_signals || analysis?.facial_signals;

  // Défauts selon l’état
  const defaults = {
    HIGH_ACTIVATION: { eyeOpenness: 0.8, jawTension: 0.7, browTension: 0.7, microMovements: 0.6, eyeLidDroop: 0.2 },
    LOW_ENERGY: { eyeOpenness: 0.3, jawTension: 0.2, browTension: 0.2, microMovements: 0.5, eyeLidDroop: 0.7 },
    REGULATED: { eyeOpenness: 0.6, jawTension: 0.3, browTension: 0.3, microMovements: 0.2, eyeLidDroop: 0.3 },
  } as const;
  const d = defaults[state as keyof typeof defaults] || defaults.REGULATED;

  const eyeOpenness = clamp01(inf?.eye_openness ?? phys?.eye_openness ?? d.eyeOpenness);
  const blinkRate = clamp01(inf?.blink_rate ?? 0.5);
  const jawTension = clamp01(inf?.jaw_tension ?? phys?.jaw_tension ?? d.jawTension);
  const browTension = clamp01(inf?.forehead_tension ?? phys?.brow_tension ?? phys?.forehead_tension ?? d.browTension);
  const headStability = clamp01(inf?.head_stability ?? 0.5);

  return {
    eyeLidDroop: clamp01(1 - eyeOpenness),
    blinkFrequency: blinkRate * 30,
    facialTonus: 0.5,
    underEyeRedness: 0.5,
    jawTension,
    browTension,
    eyeOpenness,
    microMovements: clamp01(1 - headStability),
    facialSymmetry: 0.5,
    analyzedAt: new Date(),
  };
}
