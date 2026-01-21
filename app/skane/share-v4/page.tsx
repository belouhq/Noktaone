"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RotateCcw, Send, Share2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { MICRO_ACTIONS } from "@/lib/skane/constants";
import { MicroActionType } from "@/lib/skane/types";
import { toPng } from "html-to-image";
import SharePlatformSelector from "@/components/share/SharePlatformSelector";
import shareService, { ShareData, ShareResult } from "@/lib/skane/shareService";

/**
 * SHARE CARD V4 - FORMAT STORY OPTIMISÉ
 * 
 * ✅ Format 1080x1920 (9:16) - Stories/Reels/TikTok
 * ✅ Design maquette : cercles avec fourchettes
 * ✅ Photo selfie en plein écran
 * ✅ Header SKANE INDEX / NOKTA ONE
 * ✅ Card glassmorphism en bas
 * ✅ Nom de fichier SEO optimisé
 */

type Step = "selfie" | "preview";

// === TYPES ===
interface SkaneScores {
  before: [number, number];
  after: [number, number];
  beforeLabel: string;
  afterLabel: string;
}

type UserFeedback = "better" | "same" | "worse";

interface FeedbackZone {
  before: { min: number; max: number; spread: [number, number] };
  after: { min: number; max: number; spread: [number, number] };
  beforeLabel: string;
  afterLabel: string;
}

// === RÈGLES FOURCHETTES ===
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

function generateScores(feedback: UserFeedback = "better"): SkaneScores {
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
  afterHigh = clamp(afterHigh + 5, afterLow + 5, zone.after.max + 10);

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

// === GÉNÉRATION NOM DE FICHIER SEO ===
function generateSEOFilename(actionId: string, username?: string): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  
  // Mapping action -> mots-clés SEO
  const actionKeywords: Record<string, string> = {
    physiological_sigh: "stress-relief-breathing-technique",
    box_breathing: "box-breathing-anxiety-relief",
    expiration_3_8: "deep-breathing-relaxation",
    respiration_4_6: "heart-coherence-breathing",
    respiration_2_1: "energy-boost-breathing",
    drop_trapezes: "shoulder-tension-release",
    shake_neuromusculaire: "stress-shake-off-technique",
    posture_ancrage: "grounding-exercise-anxiety",
    ouverture_thoracique: "chest-opening-wellness",
    pression_plantaire: "grounding-technique-calm",
    regard_fixe_expiration: "focus-breathing-meditation",
  };

  const keyword = actionKeywords[actionId] || "wellness-reset-nokta";
  
  // Format: nokta-one-{keyword}-{username?}-{date}.png
  const parts = ["nokta-one", keyword];
  
  if (username) {
    const cleanUsername = username
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever accents
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 15);
    if (cleanUsername) {
      parts.push(cleanUsername);
    }
  }
  
  parts.push(dateStr);
  
  return `${parts.join('-')}.png`;
}

// === COMPOSANT PRINCIPAL ===
export default function ShareCardV4() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<Step>("selfie");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [microAction, setMicroAction] = useState<MicroActionType>("physiological_sigh");
  const [scores] = useState<SkaneScores>(() => generateScores("better"));
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [username, setUsername] = useState<string | undefined>(undefined);
  
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Initialisation
  useEffect(() => {
    const storedFeedback = sessionStorage.getItem("skane_feedback");
    if (storedFeedback !== "better") {
      router.push("/");
      return;
    }

    const storedResult = sessionStorage.getItem("skane_analysis_result");
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setMicroAction(parsed.microAction || "physiological_sigh");
      } catch (error) {
        console.error("Error parsing skane data:", error);
      }
    }

    // Récupérer le username si disponible
    const storedUser = localStorage.getItem("user_profile");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsername(user.username || user.name);
      } catch {}
    }
  }, [router]);

  // Caméra
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  }, []);

  useEffect(() => {
    if (step === "selfie") {
      startCamera();
    }
    return () => stopCamera();
  }, [step, startCamera, stopCamera]);

  const takeSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // FORMAT STORY: 1080x1920 (9:16)
    const targetWidth = 1080;
    const targetHeight = 1920;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = targetWidth / targetHeight;
    
    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
    
    if (videoRatio > targetRatio) {
      sw = video.videoHeight * targetRatio;
      sx = (video.videoWidth - sw) / 2;
    } else {
      sh = video.videoWidth / targetRatio;
      sy = (video.videoHeight - sh) / 2;
    }

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setSelfieUrl(dataUrl);
    stopCamera();
    setStep("preview");
  };

  const retakeSelfie = () => {
    setSelfieUrl(null);
    setStep("selfie");
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  // Générer et partager avec nom SEO
  const handleShare = async () => {
    if (!cardRef.current) return;

    setIsGeneratingImage(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#000000",
        pixelRatio: 2,
        quality: 1,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Générer le nom de fichier SEO
      const seoFilename = generateSEOFilename(microAction, username);

      setShareData({
        imageBlob: blob,
        imageUrl: dataUrl,
        filename: seoFilename,
        title: "Nokta One - Mon Reset",
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
    if (result.success && !result.requiresManualStep && result.platform !== "copy" && result.platform !== "download") {
      setTimeout(() => router.push("/"), 800);
    }
  };

  const handleClose = () => {
    stopCamera();
    router.push("/");
  };

  const actionDetails = MICRO_ACTIONS[microAction];

  return (
    <main className="fixed inset-0 bg-black">
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {step === "selfie" ? (
          // === ÉTAPE SELFIE ===
          <motion.div
            key="selfie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 z-20 p-5 flex items-center justify-between safe-area-inset-top">
              <button onClick={handleClose} className="text-white/60 hover:text-white">
                <X size={24} />
              </button>
              <span className="text-white/60 text-sm font-medium">Selfie victoire ✨</span>
              <button onClick={switchCamera} className="text-white/60 hover:text-white">
                <RotateCcw size={24} />
              </button>
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex flex-col items-center safe-area-inset-bottom">
              <p className="text-white/80 text-center mb-6 text-sm">
                Montre ton meilleur sourire !<br />
                <span className="text-white/50">Tu viens de faire ton reset 💪</span>
              </p>

              <motion.button
                onClick={takeSelfie}
                disabled={!isCameraReady}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: "0 0 0 4px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <Camera size={32} className="text-black" />
              </motion.button>

              <button 
                onClick={handleClose}
                className="mt-6 text-white/40 text-sm hover:text-white/60"
              >
                Passer
              </button>
            </div>
          </motion.div>
        ) : (
          // === ÉTAPE PREVIEW ===
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-black"
          >
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 z-20 text-white/40 hover:text-white/70"
            >
              <X size={22} />
            </button>

            {/* === SHARE CARD - FORMAT 9:16 EXACT === */}
            <div 
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              style={{ 
                width: "min(100vw - 32px, 300px)",
                aspectRatio: "9 / 16",
              }}
            >
              {/* Container interne pour html-to-image */}
              <div
                ref={cardRef}
                className="absolute inset-0"
                style={{
                  width: "100%",
                  height: "100%",
                  aspectRatio: "9 / 16",
                }}
              >
                {/* Background: Selfie plein écran */}
                {selfieUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selfieUrl})` }}
                  />
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

                {/* === CONTENU === */}
                <div className="relative z-10 flex flex-col h-full p-4">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-[11px] font-bold tracking-[0.15em] uppercase">
                      Skane Index
                    </span>
                    <span className="text-white/50 text-[9px] font-medium tracking-[0.12em] uppercase">
                      Nokta One
                    </span>
                  </div>

                  {/* Cercles centrés */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center justify-center gap-3">
                      <ScoreCircle
                        range={scores.before}
                        label="BEFORE"
                        sublabel={scores.beforeLabel}
                        type="before"
                      />
                      <ScoreCircle
                        range={scores.after}
                        label="AFTER"
                        sublabel={scores.afterLabel}
                        type="after"
                      />
                    </div>
                  </div>

                  {/* Footer: Card glassmorphism */}
                  <div 
                    className="rounded-xl p-3"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-white/80 text-[9px] font-semibold uppercase tracking-wider">
                        Skane Completed
                      </span>
                    </div>
                    <p className="text-white font-bold text-xs">
                      {actionDetails?.name || microAction}
                      <span className="text-white/50 font-normal ml-1">
                        ({actionDetails?.duration || 24}s)
                      </span>
                    </p>
                    <p className="text-white/40 text-[8px] mt-0.5">
                      Wellness signal · Not medical
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="mt-6 flex items-center gap-3">
              <motion.button
                onClick={retakeSelfie}
                className="px-4 py-2.5 rounded-xl text-white/60 text-sm border border-white/20 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={16} />
                Reprendre
              </motion.button>

              <motion.button
                onClick={handleShare}
                disabled={isGeneratingImage}
                className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                  boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Préparation...
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    Partager
                  </>
                )}
              </motion.button>
            </div>

            <button
              onClick={handleClose}
              className="mt-4 text-white/30 text-xs hover:text-white/50"
            >
              Plus tard
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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

// === CERCLE DE SCORE AVEC FOURCHETTE ===
interface ScoreCircleProps {
  range: [number, number];
  label: string;
  sublabel: string;
  type: "before" | "after";
}

function ScoreCircle({ range, label, sublabel, type }: ScoreCircleProps) {
  const isBefore = type === "before";
  const primaryColor = isBefore ? "#EF4444" : "#10B981";
  const bgColor = isBefore ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)";
  const glowColor = isBefore ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)";
  
  const size = 90;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const averageScore = (range[0] + range[1]) / 2;
  const fillPercent = averageScore / 100;
  const strokeDashoffset = circumference * (1 - fillPercent);

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative" 
        style={{ 
          width: size, 
          height: size,
          filter: `drop-shadow(0 0 10px ${glowColor})`,
        }}
      >
        {/* Background cercle */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ background: bgColor }}
        />
        
        {/* SVG Progress */}
        <svg 
          width={size} 
          height={size} 
          className="absolute inset-0 -rotate-90"
        >
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
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
        </svg>

        {/* FOURCHETTE au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-base font-bold text-white tracking-tight"
          >
            {range[0]}–{range[1]}
          </motion.span>
        </div>
      </div>

      {/* Labels */}
      <div className="mt-2 text-center">
        <p className="text-white/50 text-[8px] uppercase tracking-widest font-medium">
          {label}
        </p>
        <p 
          className="text-[7px] font-bold uppercase tracking-wide mt-0.5"
          style={{ color: primaryColor }}
        >
          {sublabel}
        </p>
      </div>
    </div>
  );
}
