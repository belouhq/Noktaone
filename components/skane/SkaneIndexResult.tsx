"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Share2, X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// TYPES
// ============================================

type FeedbackType = "clear" | "reduced" | "still_high";

interface SkaneIndexProps {
  selfieUrl: string;
  feedback: FeedbackType;
  microActionName: string;
  microActionDuration: number;
  isGuestMode?: boolean;
  onClose?: () => void;
  onShare?: (data: ShareData) => void;
  previousRanges?: { before: [number, number]; after: [number, number] } | null;
}

interface ShareData {
  beforeRange: [number, number];
  afterRange: [number, number];
  microActionName: string;
  selfieUrl: string;
}

interface GeneratedRanges {
  before: [number, number];
  after: [number, number];
  beforeLabel: string;
  afterLabel: string;
}

// ============================================
// CONSTANTES - ZONES AUTORISÉES PAR FEEDBACK
// ============================================

const FEEDBACK_ZONES = {
  clear: {
    before: { min: 80, max: 100, spread: [15, 20] },
    after: { min: 15, max: 30, spread: [10, 15] },
    beforeLabel: "HIGH ACTIVATION",
    afterLabel: "CLEAR SIGNAL",
  },
  reduced: {
    before: { min: 75, max: 90, spread: [15, 20] },
    after: { min: 25, max: 40, spread: [10, 15] },
    beforeLabel: "HIGH ACTIVATION",
    afterLabel: "SIGNAL REDUCED",
  },
  still_high: {
    before: { min: 75, max: 95, spread: [15, 20] },
    after: { min: 40, max: 55, spread: [10, 15] },
    beforeLabel: "HIGH ACTIVATION",
    afterLabel: "STILL ELEVATED",
  },
} as const;

const MIN_DELTA = 40;
const NOISE_RANGE = { min: 3, max: 7 };
const GUEST_NOISE_RANGE = { min: 5, max: 10 };
const SIMILARITY_THRESHOLD = 5;

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function applyNoise(value: number, noiseRange: { min: number; max: number }): number {
  const noise = randomInRange(noiseRange.min, noiseRange.max);
  return value + noise * (Math.random() > 0.5 ? 1 : -1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function areTooSimilar(r1: [number, number], r2: [number, number], th: number): boolean {
  return Math.abs(r1[0] - r2[0]) < th && Math.abs(r1[1] - r2[1]) < th;
}

function generateRanges(
  feedback: FeedbackType,
  isGuestMode: boolean,
  previousRanges: { before: [number, number]; after: [number, number] } | null,
  maxAttempts = 10
): GeneratedRanges {
  const zone = FEEDBACK_ZONES[feedback];
  const noiseRange = isGuestMode ? GUEST_NOISE_RANGE : NOISE_RANGE;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const beforeSpread = randomInRange(zone.before.spread[0], zone.before.spread[1]);
    let beforeLow = randomInRange(zone.before.min, zone.before.max - beforeSpread);
    let beforeHigh = beforeLow + beforeSpread;
    beforeLow = clamp(applyNoise(beforeLow, noiseRange), zone.before.min, 100);
    beforeHigh = clamp(applyNoise(beforeHigh, noiseRange), beforeLow + 10, 100);

    const afterSpread = randomInRange(zone.after.spread[0], zone.after.spread[1]);
    let afterLow = randomInRange(zone.after.min, zone.after.max - afterSpread);
    let afterHigh = afterLow + afterSpread;
    afterLow = clamp(applyNoise(afterLow, noiseRange), 5, zone.after.max);
    afterHigh = clamp(applyNoise(afterHigh, noiseRange), afterLow + 5, zone.after.max + 10);

    const beforeMean = (beforeLow + beforeHigh) / 2;
    const afterMean = (afterLow + afterHigh) / 2;
    const delta = beforeMean - afterMean;

    if (delta < MIN_DELTA) {
      const adj = MIN_DELTA - delta + 5;
      beforeLow = clamp(beforeLow + adj / 2, zone.before.min, 95);
      beforeHigh = clamp(beforeHigh + adj / 2, beforeLow + 10, 100);
      afterLow = clamp(afterLow - adj / 2, 5, zone.after.max - 10);
      afterHigh = clamp(afterHigh - adj / 2, afterLow + 5, zone.after.max);
    }

    const beforeRange: [number, number] = [Math.round(beforeLow), Math.round(beforeHigh)];
    const afterRange: [number, number] = [Math.round(afterLow), Math.round(afterHigh)];

    if (previousRanges) {
      if (areTooSimilar(beforeRange, previousRanges.before, SIMILARITY_THRESHOLD) || areTooSimilar(afterRange, previousRanges.after, SIMILARITY_THRESHOLD)) continue;
    }

    return { before: beforeRange, after: afterRange, beforeLabel: zone.beforeLabel, afterLabel: zone.afterLabel };
  }

  return { before: [80, 95], after: [20, 35], beforeLabel: zone.beforeLabel, afterLabel: zone.afterLabel };
}

// ============================================
// PROGRESS CIRCLE
// ============================================

interface ProgressCircleProps {
  range: [number, number];
  label: string;
  type: "before" | "after";
  animated?: boolean;
  labelBeforeAfter: string;
}

function ProgressCircle({ range, label, type, animated = true, labelBeforeAfter }: ProgressCircleProps) {
  const [progress, setProgress] = useState(0);
  const targetProgress = (range[0] + range[1]) / 2;

  useEffect(() => {
    if (!animated) {
      setProgress(targetProgress);
      return;
    }
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      setProgress(targetProgress * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [targetProgress, animated]);

  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colors = type === "before" ? { stroke: "#EF4444", bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444" } : { stroke: "#22C55E", bg: "rgba(34, 197, 94, 0.2)", text: "#22C55E" };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.bg} strokeWidth={strokeWidth} />
        </svg>
        <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 0.1s ease-out" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold tracking-tight" style={{ color: colors.text }}>
            {range[0]}–{range[1]}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">{labelBeforeAfter}</p>
        <p className="text-xs font-medium text-white uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SkaneIndexResult({
  selfieUrl,
  feedback,
  microActionName,
  microActionDuration,
  isGuestMode = false,
  onClose,
  onShare,
  previousRanges = null,
}: SkaneIndexProps) {
  const { t } = useTranslation();

  const ranges = useMemo(() => generateRanges(feedback, isGuestMode, previousRanges), [feedback, isGuestMode, previousRanges]);

  const handleShare = () => {
    if (onShare) onShare({ beforeRange: ranges.before, afterRange: ranges.after, microActionName, selfieUrl });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${selfieUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
      </div>

      <div className="relative z-10 flex flex-col h-full px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium text-white/80 tracking-widest uppercase">{t("skaneIndex.title")}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-light text-white/60 tracking-widest uppercase">Nokta One</span>
            {onClose && (
              <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label={t("common.close")}>
                <X size={18} className="text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center justify-center gap-8">
            <ProgressCircle range={ranges.before} label={ranges.beforeLabel} type="before" labelBeforeAfter={t("skaneIndex.before")} />
            <ProgressCircle range={ranges.after} label={ranges.afterLabel} type="after" labelBeforeAfter={t("skaneIndex.after")} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-400 text-sm">✓</span>
              <span className="text-white/80 text-sm font-medium uppercase tracking-wide">{t("skaneIndex.skaneCompleted")}</span>
            </div>
            <p className="text-white font-medium">
              {microActionName} ({microActionDuration}s)
            </p>
            <p className="text-white/50 text-xs mt-1">{t("skaneIndex.activationDisclaimer")}</p>
          </div>

          <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
            <Share2 size={20} className="text-white" />
            <span className="text-white font-medium">{t("skaneIndex.shareYourReset")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { generateRanges, FEEDBACK_ZONES, MIN_DELTA };
export type { FeedbackType, GeneratedRanges, ShareData };
