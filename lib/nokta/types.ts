/**
 * Types Nokta Core - Architecture sans score visible
 * Intégré depuis nokta-v2, adapté pour Next.js (DeviceInfo.platform 'web')
 *
 * RÈGLE: "Nokta ne mesure rien. Il montre un changement."
 * - AUCUN pourcentage visible, AUCUN chiffre affiché
 * - Fourchettes uniquement, delta exagéré pour le WOW effect
 */

// ===========================================
// SIGNAUX VISIBLES
// ===========================================

export type ActivationSignal = "high" | "moderate" | "clear";

export const SIGNAL_COLORS: Record<ActivationSignal, string> = {
  high: "#FF4444",
  moderate: "#FF9500",
  clear: "#34C759",
};

export const SIGNAL_LABELS: Record<ActivationSignal, string> = {
  high: "High Activation",
  moderate: "Moderate Activation",
  clear: "Clear Signal",
};

export const SIGNAL_RANGES: Record<ActivationSignal, string> = {
  high: "Elevated → Saturated",
  moderate: "Active → Elevated",
  clear: "Stable → Neutral",
};

// ===========================================
// FEEDBACK UTILISATEUR
// ===========================================

export type UserFeedback = "still_high" | "reduced" | "clear";

export const FEEDBACK_ICONS: Record<UserFeedback, string> = {
  still_high: "🔴",
  reduced: "🟠",
  clear: "🟢",
};

// ===========================================
// DONNÉES INTERNES (jamais visibles)
// ===========================================

export interface InternalScore {
  rawScore: number;
  zone: "high" | "medium" | "low";
  components: { facial?: FacialAnalysisData; biometric?: BiometricData };
  confidence: number;
}

export interface FacialAnalysisData {
  eyeLidDroop: number;
  blinkFrequency: number;
  facialTonus: number;
  underEyeRedness: number;
  jawTension: number;
  browTension: number;
  eyeOpenness: number;
  microMovements: number;
  facialSymmetry: number;
  analyzedAt: Date;
}

export interface BiometricData {
  hrvSdnn: number | null;
  hrvRmssd: number | null;
  restingHeartRate: number | null;
  currentHeartRate: number | null;
  sleepQuality: number | null;
  sleepDuration: number | null;
  source: "healthkit" | "health_connect" | "none";
  lastSync: Date | null;
}

// ===========================================
// SESSION NOKTA
// ===========================================

export interface NoktaSession {
  id: string;
  userId: string;
  signalBefore: ActivationSignal;
  internalScoreBefore: InternalScore;
  microAction: MicroAction;
  actionDuration: number;
  actionCompletedAt: Date;
  feedback: UserFeedback;
  feedbackAt: Date;
  signalAfter: ActivationSignal;
  internalScoreAfter: InternalScore;
  wasShared: boolean;
  sharedAt: Date | null;
  createdAt: Date;
  deviceInfo: DeviceInfo;
}

export interface MicroAction {
  id: string;
  name: string;
  displayName: string;
  duration: number;
  hapticPattern: HapticPattern;
  recommendedFor: ActivationSignal[];
}

export interface HapticPattern {
  type: "breathing" | "grounding" | "movement";
  steps: HapticStep[];
  totalDuration: number;
  loops: number;
}

export interface HapticStep {
  type: "vibrate" | "pause";
  duration: number;
  intensity?: "light" | "medium" | "heavy";
  count?: number;
}

/** 'web' ajouté pour PWA / Next.js */
export interface DeviceInfo {
  platform: "ios" | "android" | "web";
  osVersion: string;
  appVersion: string;
  hasWearable: boolean;
  wearableType?: string;
}

// ===========================================
// SKANE INDEX (Share uniquement)
// ===========================================

export interface SkaneIndex {
  before: { signal: ActivationSignal; range: string; visualFill: number };
  after: { signal: ActivationSignal; range: string; visualFill: number };
  microActionName: string;
  microActionDuration: string;
  disclaimer: string;
  generatedAt: Date;
  shareImageUrl?: string;
}

// ===========================================
// CONSTANTES
// ===========================================

export const SKANE_INDEX_RULES = {
  before: { minFill: 0.7, maxFill: 0.95, defaultSignal: "high" as ActivationSignal },
  after: { minFill: 0.15, maxFill: 0.35, defaultSignal: "clear" as ActivationSignal },
  minDelta: 0.45,
  disclaimer: "Wellness signal · Not medical",
} as const;

export const SCORE_TO_SIGNAL_THRESHOLDS = {
  high: 65,
  moderate: 35,
  clear: 0,
} as const;
