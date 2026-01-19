/**
 * Générateur du Skane Index - UNIQUEMENT pour le Share
 * Intégré depuis nokta-v2
 */

import {
  SkaneIndex,
  InternalScore,
  ActivationSignal,
  UserFeedback,
  MicroAction,
  SKANE_INDEX_RULES,
  SIGNAL_RANGES,
} from "./types";

export function generateSkaneIndex(
  scoreBefore: InternalScore,
  scoreAfter: InternalScore,
  feedback: UserFeedback,
  microAction: MicroAction
): SkaneIndex | null {
  if (feedback === "still_high") return null;

  const rules = SKANE_INDEX_RULES;
  const beforeFill = generateBeforeFill(scoreBefore);
  const beforeSignal: ActivationSignal = "high";
  const afterFill = generateAfterFill(scoreAfter, feedback);
  const afterSignal = feedbackToSignal(feedback);

  const delta = beforeFill - afterFill;
  if (delta < rules.minDelta) {
    const adjustedAfterFill = Math.max(rules.after.minFill, beforeFill - rules.minDelta);
    return buildSkaneIndex(beforeSignal, beforeFill, afterSignal, adjustedAfterFill, microAction);
  }
  return buildSkaneIndex(beforeSignal, beforeFill, afterSignal, afterFill, microAction);
}

function generateBeforeFill(score: InternalScore): number {
  const { minFill, maxFill } = SKANE_INDEX_RULES.before;
  const baseRatio = score.rawScore / 100;
  const fill = minFill + baseRatio * (maxFill - minFill);
  const variation = (Math.random() - 0.5) * 0.05;
  return clamp(fill + variation, minFill, maxFill);
}

function generateAfterFill(score: InternalScore, feedback: UserFeedback): number {
  const { minFill, maxFill } = SKANE_INDEX_RULES.after;
  const feedbackMultiplier = { clear: 0.3, reduced: 0.6, still_high: 1 };
  const multiplier = feedbackMultiplier[feedback];
  const baseRatio = (score.rawScore / 100) * multiplier;
  const fill = minFill + baseRatio * (maxFill - minFill);
  const variation = (Math.random() - 0.5) * 0.03;
  return clamp(fill + variation, minFill, maxFill);
}

function feedbackToSignal(feedback: UserFeedback): ActivationSignal {
  switch (feedback) {
    case "clear": return "clear";
    case "reduced": return "moderate";
    case "still_high": return "high";
  }
}

function buildSkaneIndex(
  beforeSignal: ActivationSignal,
  beforeFill: number,
  afterSignal: ActivationSignal,
  afterFill: number,
  microAction: MicroAction
): SkaneIndex {
  return {
    before: { signal: beforeSignal, range: SIGNAL_RANGES[beforeSignal], visualFill: Math.round(beforeFill * 100) / 100 },
    after: { signal: afterSignal, range: SIGNAL_RANGES[afterSignal], visualFill: Math.round(afterFill * 100) / 100 },
    microActionName: microAction.displayName,
    microActionDuration: `${microAction.duration}s`,
    disclaimer: SKANE_INDEX_RULES.disclaimer,
    generatedAt: new Date(),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function shouldOfferShare(feedback: UserFeedback): boolean {
  return feedback === "clear" || feedback === "reduced";
}
