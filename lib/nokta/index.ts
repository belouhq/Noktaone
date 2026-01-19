/**
 * Service principal Nokta - Orchestration du flow (nokta-v2 adapté Next.js)
 * Règles : aucun chiffre visible, fourchettes uniquement, feedback obligatoire.
 */

import type {
  ActivationSignal,
  UserFeedback,
  InternalScore,
  MicroAction,
  SkaneIndex,
  FacialAnalysisData,
  DeviceInfo,
} from "./types";
import { calculateInternalScore, scoreToSignal, calculateScoreAfterAction } from "./internalScoring";
import { generateSkaneIndex, shouldOfferShare } from "./skaneIndex";
import { biometricService } from "./biometricService";
import { saveNoktaSession } from "./supabaseService";

export const MICRO_ACTIONS: MicroAction[] = [
  {
    id: "physiological_sigh",
    name: "physiological_sigh",
    displayName: "Physiological Sigh",
    duration: 30,
    hapticPattern: {
      type: "breathing",
      steps: [
        { type: "vibrate", duration: 300, intensity: "medium" },
        { type: "pause", duration: 700 },
        { type: "vibrate", duration: 150, intensity: "light", count: 2 },
        { type: "pause", duration: 1700 },
        { type: "vibrate", duration: 100, intensity: "medium" },
        { type: "pause", duration: 900 },
        { type: "vibrate", duration: 100, intensity: "light" },
        { type: "pause", duration: 900 },
        { type: "vibrate", duration: 100, intensity: "light" },
        { type: "pause", duration: 900 },
        { type: "vibrate", duration: 100, intensity: "light" },
        { type: "pause", duration: 900 },
        { type: "vibrate", duration: 100, intensity: "light" },
        { type: "pause", duration: 900 },
        { type: "vibrate", duration: 100, intensity: "light" },
        { type: "pause", duration: 900 },
      ],
      totalDuration: 9000,
      loops: 3,
    },
    recommendedFor: ["high", "moderate"],
  },
  {
    id: "box_breathing",
    name: "box_breathing",
    displayName: "Box Breathing",
    duration: 32,
    hapticPattern: {
      type: "breathing",
      steps: [
        { type: "vibrate", duration: 300, intensity: "medium" },
        { type: "pause", duration: 700 },
        { type: "vibrate", duration: 100, intensity: "light", count: 4 },
        { type: "pause", duration: 3600 },
        { type: "pause", duration: 4000 },
        { type: "vibrate", duration: 100, intensity: "light", count: 4 },
        { type: "pause", duration: 3600 },
        { type: "pause", duration: 4000 },
      ],
      totalDuration: 16000,
      loops: 2,
    },
    recommendedFor: ["high"],
  },
  {
    id: "grounding_54321",
    name: "grounding_54321",
    displayName: "5-4-3-2-1 Grounding",
    duration: 30,
    hapticPattern: {
      type: "grounding",
      steps: [
        { type: "vibrate", duration: 300, intensity: "medium" },
        { type: "pause", duration: 5700 },
        { type: "vibrate", duration: 200, intensity: "light" },
        { type: "pause", duration: 5800 },
        { type: "vibrate", duration: 200, intensity: "light" },
        { type: "pause", duration: 5800 },
        { type: "vibrate", duration: 200, intensity: "light" },
        { type: "pause", duration: 5800 },
        { type: "vibrate", duration: 200, intensity: "light" },
        { type: "pause", duration: 5800 },
        { type: "vibrate", duration: 500, intensity: "heavy" },
      ],
      totalDuration: 30000,
      loops: 1,
    },
    recommendedFor: ["high", "moderate"],
  },
];

export interface NoktaSessionPayload {
  userId: string;
  signalBefore: ActivationSignal;
  internalScoreBefore: InternalScore;
  microAction: MicroAction;
  deviceInfo: DeviceInfo;
}

function getDeviceInfo(): DeviceInfo {
  return {
    platform: "web",
    osVersion: "unknown",
    appVersion: "1.0.0",
    hasWearable: false,
  };
}

function recommendAction(signal: ActivationSignal, _score: InternalScore): MicroAction {
  const suitable = MICRO_ACTIONS.filter((a) => a.recommendedFor.includes(signal));
  if (suitable.length === 0) return MICRO_ACTIONS[0];
  return suitable[Math.floor(Math.random() * suitable.length)];
}

async function startSession(
  userId: string,
  facialData: FacialAnalysisData
): Promise<{
  signal: ActivationSignal;
  recommendedAction: MicroAction;
  sessionPayload: NoktaSessionPayload;
}> {
  const biometricData = await biometricService.getCurrentData();
  const internalScore = calculateInternalScore(facialData, biometricData);
  const signal = scoreToSignal(internalScore);
  const recommendedAction = recommendAction(signal, internalScore);

  const sessionPayload: NoktaSessionPayload = {
    userId,
    signalBefore: signal,
    internalScoreBefore: internalScore,
    microAction: recommendedAction,
    deviceInfo: getDeviceInfo(),
  };

  return { signal, recommendedAction, sessionPayload };
}

async function submitFeedbackWithPayload(
  payload: NoktaSessionPayload,
  feedback: UserFeedback
): Promise<{
  signalAfter: ActivationSignal;
  shouldOfferShare: boolean;
  sessionId: string | null;
  skaneIndex: SkaneIndex | null;
}> {
  const internalScoreAfter = calculateScoreAfterAction(payload.internalScoreBefore, feedback);
  const signalAfter = scoreToSignal(internalScoreAfter);
  const now = new Date();

  const session = {
    userId: payload.userId,
    signalBefore: payload.signalBefore,
    internalScoreBefore: payload.internalScoreBefore,
    microAction: payload.microAction,
    actionDuration: payload.microAction.duration,
    actionCompletedAt: now,
    feedback,
    feedbackAt: now,
    signalAfter,
    internalScoreAfter,
    wasShared: false,
    sharedAt: null as Date | null,
    deviceInfo: payload.deviceInfo,
  };

  const sessionId = await saveNoktaSession(session);
  const skaneIndex = generateSkaneIndex(
    payload.internalScoreBefore,
    internalScoreAfter,
    feedback,
    payload.microAction
  );

  return {
    signalAfter,
    shouldOfferShare: shouldOfferShare(feedback),
    sessionId,
    skaneIndex,
  };
}

export const noktaService = {
  initialize: () => biometricService.initialize(),
  startSession,
  submitFeedbackWithPayload,
  getDeviceInfo,
  hasWearableConnected: () => biometricService.hasWearableConnected(),
};

export * from "./types";
export { SIGNAL_COLORS, SIGNAL_LABELS, FEEDBACK_ICONS } from "./types";
export { mapGptToFacial } from "./mapGptToFacial";
export { calculateScoreAfterAction, scoreToSignal } from "./internalScoring";
export { shouldOfferShare } from "./skaneIndex";
export { markNoktaSessionShared } from "./supabaseService";
