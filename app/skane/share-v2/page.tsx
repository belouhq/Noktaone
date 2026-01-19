"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { MicroActionType } from "@/lib/skane/types";
import { MICRO_ACTIONS } from "@/lib/skane/constants";
import { toPng } from "html-to-image";
import SharePlatformSelector from "@/components/share/SharePlatformSelector";
import shareService, { ShareData, ShareResult } from "@/lib/skane/shareService";

/**
 * SHARE CARD V2.1 FINAL
 * 
 * Design épuré, professionnel, B2B-ready :
 * - AUCUN émoji
 * - Fourchettes (pas de %)
 * - Ton minimaliste
 * - TikTok inclus
 */

type UserFeedback = "better" | "same" | "worse";

interface FeedbackZone {
  before: { min: number; max: number; spread: [number, number] };
  after: { min: number; max: number; spread: [number, number] };
  beforeLabel: string;
  afterLabel: string;
}

interface GeneratedRanges {
  before: [number, number];
  after: [number, number];
  beforeLabel: string;
  afterLabel: string;
}

const FEEDBACK_ZONES: Record<UserFeedback, FeedbackZone> = {
  better: {
    before: { min: 80, max: 100, spread: [10, 15] },
    after: { min: 15, max: 30, spread: [8, 12] },
    beforeLabel: "HIGH ACTIVATION",
    afterLabel: "CLEAR SIGNAL",
  },
  same: {
    before: { min: 75, max: 90, spread: [10, 15] },
    after: { min: 30, max: 45, spread: [8, 12] },
    beforeLabel: "ELEVATED",
    afterLabel: "REDUCED",
  },
  worse: {
    before: { min: 70, max: 85, spread: [10, 15] },
    after: { min: 45, max: 60, spread: [8, 12] },
    beforeLabel: "ELEVATED",
    afterLabel: "STILL ELEVATED",
  },
};

const MIN_DELTA = 40;
const NOISE_RANGE = { min: 3, max: 7 };

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function applyNoise(value: number): number {
  const noise = randomInRange(NOISE_RANGE.min, NOISE_RANGE.max);
  const direction = Math.random() > 0.5 ? 1 : -1;
  return value + noise * direction;
}

function generateRanges(feedback: UserFeedback): GeneratedRanges {
  const zone = FEEDBACK_ZONES[feedback];

  const beforeSpread = randomInRange(zone.before.spread[0], zone.before.spread[1]);
  let beforeLow = randomInRange(zone.before.min, zone.before.max - beforeSpread);
  let beforeHigh = beforeLow + beforeSpread;

  beforeLow = clamp(applyNoise(beforeLow), zone.before.min, 95);
  beforeHigh = clamp(applyNoise(beforeHigh), beforeLow + 8, 100);

  const afterSpread = randomInRange(zone.after.spread[0], zone.after.spread[1]);
  let afterLow = randomInRange(zone.after.min, zone.after.max - afterSpread);
  let afterHigh = afterLow + afterSpread;

  afterLow = clamp(applyNoise(afterLow), 5, zone.after.max);
  afterHigh = clamp(applyNoise(afterHigh), afterLow + 5, zone.after.max + 10);

  const beforeMean = (beforeLow + beforeHigh) / 2;
  const afterMean = (afterLow + afterHigh) / 2;
  const delta = beforeMean - afterMean;

  if (delta < MIN_DELTA) {
    const adjustment = MIN_DELTA - delta + 5;
    beforeLow = clamp(beforeLow + adjustment / 2, zone.before.min, 92);
    beforeHigh = clamp(beforeHigh + adjustment / 2, beforeLow + 8, 100);
    afterLow = clamp(afterLow - adjustment / 2, 5, 35);
    afterHigh = clamp(afterHigh - adjustment / 2, afterLow + 5, 40);
  }

  return {
    before: [Math.round(beforeLow), Math.round(beforeHigh)],
    after: [Math.round(afterLow), Math.round(afterHigh)],
    beforeLabel: zone.beforeLabel,
    afterLabel: zone.afterLabel,
  };
}

// Composant cercle de progression
interface ProgressCircleProps {
  range: [number, number];
  label: string;
  type: "before" | "after";
}

function ProgressCircle({ range, label, type }: ProgressCircleProps) {
  const isBefore = type === "before";
  const color = isBefore ? "#EF4444" : "#10B981";
  const bgColor = isBefore ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)";
  const fillPercent = (range[0] + range[1]) / 2 / 100;

  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fillPercent);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full"
          style={{ background: bgColor }}
        >
          {/* 
            FOURCHETTE - PAS DE % 
            Affichage : "85-95" pas "85%"
          */}
          <span className="text-lg font-semibold text-white tracking-tight">
            {range[0]}-{range[1]}
          </span>
        </div>
      </div>
      <div className="mt-2.5 text-center">
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
          {isBefore ? "Before" : "After"}
        </p>
        <p className="text-[9px] font-medium text-white/60 uppercase tracking-wide mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

// Messages viraux SANS ÉMOJI
const VIRAL_MESSAGES = [
  "J'étais off. J'ai skané.",
  "30 secondes. Reset.",
  "Quand le corps est off, skane.",
  "Mon reset du jour.",
];

export default function ShareCardV2Final() {
  const router = useRouter();
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  const [feedback] = useState<UserFeedback>("better");
  const [microAction, setMicroAction] = useState<MicroActionType>("physiological_sigh");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [viralMessage, setViralMessage] = useState("");
  
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const ranges = useMemo(() => generateRanges(feedback), [feedback]);

  useEffect(() => {
    const storedFeedback = sessionStorage.getItem("skane_feedback");
    if (storedFeedback !== "better") {
      router.push("/");
      return;
    }

    const storedResult = sessionStorage.getItem("skane_analysis_result");
    const capturedImage = sessionStorage.getItem("skane_captured_image");

    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setMicroAction(parsed.microAction || "physiological_sigh");
      } catch (error) {
        console.error("Error parsing skane data:", error);
      }
    }

    if (capturedImage) {
      setSelfieUrl(`data:image/jpeg;base64,${capturedImage}`);
    }

    setViralMessage(VIRAL_MESSAGES[Math.floor(Math.random() * VIRAL_MESSAGES.length)]);
  }, [router]);

  const handleShareClick = async () => {
    if (!cardRef.current) return;

    setIsGeneratingImage(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#0a0a0a",
        pixelRatio: 2,
        quality: 1,
      });

      // Convertir dataUrl en Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      setShareData({
        imageBlob: blob,
        imageUrl: dataUrl,
        title: "Nokta One",
        text: shareService.getShareMessage("fr"),
        url: shareService.getShareUrl(),
      });

      setIsShareSheetOpen(true);
    } catch (error) {
      console.error("Error generating share image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShareComplete = (result: ShareResult) => {
    console.log("Share completed:", result);
    
    // Ne fermer que si pas d'étape manuelle
    if (result.success && !result.requiresManualStep && result.platform !== "copy" && result.platform !== "download") {
      setTimeout(() => {
        router.push("/");
      }, 800);
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  const actionDetails = MICRO_ACTIONS[microAction];
  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  return (
    <main className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4">
      {/* Bouton fermer */}
      <motion.button
        onClick={handleClose}
        className="absolute top-5 right-5 p-2 z-20 text-white/40 hover:text-white/70 transition-colors"
        whileTap={{ scale: 0.9 }}
      >
        <X size={22} />
      </motion.button>

      {/* SHARE CARD */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-xs rounded-2xl overflow-hidden"
        style={{ aspectRatio: "9/16" }}
      >
        {/* Selfie en arrière-plan */}
        {selfieUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${selfieUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)" }}
          />
        )}

        {/* Contenu */}
        <div className="relative z-10 flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-white/70 tracking-[0.2em] uppercase">
              {getTranslation("skaneIndex.title", "Skane Index")}
            </span>
            <span className="text-[10px] font-light text-white/50 tracking-[0.15em] uppercase">
              NOKTA
            </span>
          </div>

          {/* Message viral (sans émoji) */}
          <p className="text-white/60 text-xs text-center mt-6 font-light">
            {viralMessage}
          </p>

          {/* Cercles */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center justify-center gap-5">
              <ProgressCircle range={ranges.before} label={ranges.beforeLabel} type="before" />
              <div className="text-white/20 text-lg font-light">→</div>
              <ProgressCircle range={ranges.after} label={ranges.afterLabel} type="after" />
            </div>
          </div>

          {/* Footer */}
          <div>
            <div className="bg-white/8 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide">
                  {getTranslation("skaneIndex.skaneCompleted", "Skane Completed")}
                </span>
              </div>
              <p className="text-white/90 text-xs mt-1 font-medium">
                {actionDetails?.name || microAction}
              </p>
              <p className="text-white/40 text-[10px] mt-0.5">
                {actionDetails?.duration || 24}s
              </p>
            </div>
            
            {/* Disclaimer */}
            <p className="text-[8px] text-white/25 text-center mt-2 tracking-wide">
              {getTranslation("skaneIndex.activationDisclaimer", "Wellness signal · Not medical")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bouton Partager (SANS ÉMOJI) */}
      <motion.button
        onClick={handleShareClick}
        disabled={isGeneratingImage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 px-10 py-3.5 rounded-xl text-white font-medium text-sm tracking-wide"
        style={{
          background: "#3B82F6",
          boxShadow: "0 4px 24px rgba(59, 130, 246, 0.35)",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isGeneratingImage ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {getTranslation("share.preparing", "Préparation")}
          </span>
        ) : (
          getTranslation("share.shareMySkane", "Partager mon Skane")
        )}
      </motion.button>

      {/* Lien "Plus tard" */}
      <motion.button
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-3 text-white/35 text-xs font-medium hover:text-white/50 transition-colors"
      >
        {getTranslation("share.later", "Plus tard")}
      </motion.button>

      {/* Sheet de sélection de plateforme */}
      {shareData && (
        <SharePlatformSelector
          isOpen={isShareSheetOpen}
          onClose={() => setIsShareSheetOpen(false)}
          shareData={shareData}
          onShareComplete={handleShareComplete}
        />
      )}
    </main>
  );
}
