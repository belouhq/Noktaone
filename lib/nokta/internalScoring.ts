/**
 * Scoring interne Nokta - JAMAIS affiché à l'utilisateur
 * Intégré depuis nokta-v2
 */

import {
  InternalScore,
  FacialAnalysisData,
  BiometricData,
  ActivationSignal,
  SCORE_TO_SIGNAL_THRESHOLDS,
} from "./types";

const WEIGHTS = {
  facial: {
    total: 0.7,
    components: {
      eyeLidDroop: 0.15,
      blinkFrequency: 0.1,
      facialTonus: 0.1,
      underEyeRedness: 0.05,
      jawTension: 0.15,
      browTension: 0.1,
      eyeOpenness: 0.1,
      microMovements: 0.15,
      facialSymmetry: 0.1,
    },
  },
  biometric: {
    total: 0.3,
    components: { hrv: 0.5, heartRate: 0.3, sleepContext: 0.2 },
  },
};

export function calculateInternalScore(
  facialData: FacialAnalysisData | null,
  biometricData: BiometricData | null
): InternalScore {
  let totalScore = 0;
  let totalWeight = 0;
  let confidence = 0;

  if (facialData) {
    const facialScore = calculateFacialScore(facialData);
    totalScore += facialScore * WEIGHTS.facial.total;
    totalWeight += WEIGHTS.facial.total;
    confidence += 0.7;
  }

  if (biometricData && biometricData.source !== "none") {
    const biometricScore = calculateBiometricScore(biometricData);
    if (biometricScore !== null) {
      totalScore += biometricScore * WEIGHTS.biometric.total;
      totalWeight += WEIGHTS.biometric.total;
      confidence += 0.3;
    }
  }

  const rawScore =
    totalWeight > 0 ? Math.round((totalScore / totalWeight) * 10000) / 100 : 50;
  const zone = getZoneFromScore(rawScore);

  return {
    rawScore: Math.round(rawScore),
    zone,
    components: { facial: facialData || undefined, biometric: biometricData || undefined },
    confidence: Math.min(1, confidence),
  };
}

function calculateFacialScore(data: FacialAnalysisData): number {
  const w = WEIGHTS.facial.components;
  const fatigueScore =
    data.eyeLidDroop * w.eyeLidDroop +
    normalizeBlinkFrequency(data.blinkFrequency) * w.blinkFrequency +
    (1 - data.facialTonus) * w.facialTonus +
    data.underEyeRedness * w.underEyeRedness;
  const activationScore =
    data.jawTension * w.jawTension +
    data.browTension * w.browTension +
    data.eyeOpenness * w.eyeOpenness;
  const instabilityScore =
    data.microMovements * w.microMovements +
    (1 - data.facialSymmetry) * w.facialSymmetry;
  const total = fatigueScore + activationScore + instabilityScore;
  const maxPossible = Object.values(w).reduce((a, b) => a + b, 0);
  return total / maxPossible;
}

function normalizeBlinkFrequency(blinksPerMin: number): number {
  if (blinksPerMin < 10) return 0.7;
  if (blinksPerMin < 15) return 0.3;
  if (blinksPerMin <= 20) return 0.1;
  if (blinksPerMin <= 25) return 0.4;
  return 0.8;
}

function calculateBiometricScore(data: BiometricData): number | null {
  const w = WEIGHTS.biometric.components;
  let score = 0;
  let weight = 0;

  if (data.hrvSdnn !== null || data.hrvRmssd !== null) {
    const hrvValue = data.hrvSdnn ?? (data.hrvRmssd != null ? data.hrvRmssd * 1.3 : null);
    if (hrvValue != null) {
      score += normalizeHRV(hrvValue) * w.hrv;
      weight += w.hrv;
    }
  }
  if (data.restingHeartRate !== null || data.currentHeartRate !== null) {
    const hr = data.restingHeartRate ?? data.currentHeartRate!;
    score += normalizeHeartRate(hr) * w.heartRate;
    weight += w.heartRate;
  }
  if (data.sleepQuality !== null) {
    score += ((100 - data.sleepQuality) / 100) * w.sleepContext;
    weight += w.sleepContext;
  }

  if (weight === 0) return null;
  return score / weight;
}

function normalizeHRV(sdnnMs: number): number {
  if (sdnnMs >= 100) return 0.1;
  if (sdnnMs >= 70) return 0.25;
  if (sdnnMs >= 50) return 0.4;
  if (sdnnMs >= 30) return 0.65;
  if (sdnnMs >= 20) return 0.8;
  return 0.95;
}

function normalizeHeartRate(bpm: number): number {
  if (bpm <= 50) return 0.1;
  if (bpm <= 60) return 0.2;
  if (bpm <= 70) return 0.35;
  if (bpm <= 80) return 0.5;
  if (bpm <= 90) return 0.7;
  return 0.9;
}

function getZoneFromScore(score: number): "high" | "medium" | "low" {
  if (score >= 65) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function scoreToSignal(score: InternalScore): ActivationSignal {
  if (score.rawScore >= SCORE_TO_SIGNAL_THRESHOLDS.high) return "high";
  if (score.rawScore >= SCORE_TO_SIGNAL_THRESHOLDS.moderate) return "moderate";
  return "clear";
}

export function calculateScoreAfterAction(
  scoreBefore: InternalScore,
  feedback: "still_high" | "reduced" | "clear"
): InternalScore {
  const reductionFactors = { still_high: 0.15, reduced: 0.45, clear: 0.65 };
  const reduction = reductionFactors[feedback];
  const newRawScore = Math.max(5, scoreBefore.rawScore * (1 - reduction));
  return {
    ...scoreBefore,
    rawScore: Math.round(newRawScore),
    zone: getZoneFromScore(newRawScore),
  };
}
