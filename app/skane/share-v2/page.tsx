"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RotateCcw, Share2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { MicroActionType } from "@/lib/skane/types";
import { MICRO_ACTIONS } from "@/lib/skane/constants";
import { toPng } from "html-to-image";
import SharePlatformSelector from "@/components/share/SharePlatformSelector";
import shareService, { ShareData, ShareResult } from "@/lib/skane/shareService";
import { generateSEOFilename } from "@/lib/skane/seo-filename";

/**
 * SHARE CARD V2.1 FINAL
 * 
 * Design épuré, professionnel, B2B-ready :
 * - AUCUN émoji
 * - Fourchettes (pas de %)
 * - Ton minimaliste
 * - TikTok inclus
 * - Selfie victoire (pas la photo du skane)
 */

type Step = "selfie" | "preview";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("selfie");
  const [feedback] = useState<UserFeedback>("better");
  const [microAction, setMicroAction] = useState<MicroActionType>("physiological_sigh");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [viralMessage, setViralMessage] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  
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

    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setMicroAction(parsed.microAction || "physiological_sigh");
      } catch (error) {
        console.error("Error parsing skane data:", error);
      }
    }

    setViralMessage(VIRAL_MESSAGES[Math.floor(Math.random() * VIRAL_MESSAGES.length)]);
  }, [router]);

  // Démarrer la caméra
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

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  }, []);

  // Démarrer caméra au montage
  useEffect(() => {
    if (step === "selfie") {
      startCamera();
    }
    return () => stopCamera();
  }, [step, startCamera, stopCamera]);

  // Prendre le selfie
  const takeSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    // Ratio 9:16 pour le format story
    const targetWidth = 1080;
    const targetHeight = 1920;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Centrer et cropper le selfie
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

    // Mirror si caméra frontale
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSelfieUrl(dataUrl);
    stopCamera();
    setStep("preview");
  };

  // Retake selfie
  const retakeSelfie = () => {
    setSelfieUrl(null);
    setStep("selfie");
  };

  // Switch camera
  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const handleShareClick = async () => {
    if (!cardRef.current) return;

    setIsGeneratingImage(true);

    try {
      // FORMAT STORY OPTIMAL : 1080x1920 pixels (9:16)
      // Taille standard pour Instagram Stories, TikTok, Facebook Stories, etc.
      const STORY_WIDTH = 1080;
      const STORY_HEIGHT = 1920;
      const PIXEL_RATIO = 2; // Pour une qualité Retina/HiDPI

      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#0a0a0a",
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        pixelRatio: PIXEL_RATIO, // Génère 2160x3840 pour qualité Retina, redimensionné à 1080x1920
        quality: 1,
        cacheBust: true,
      });

      // Convertir dataUrl en Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Récupérer username si disponible (depuis sessionStorage ou localStorage)
      let username: string | undefined;
      try {
        const userId = localStorage.getItem("nokta_user_id");
        if (userId) {
          // Essayer de récupérer depuis sessionStorage ou autre source
          const userData = sessionStorage.getItem("nokta_user_data");
          if (userData) {
            const parsed = JSON.parse(userData);
            username = parsed.username || parsed.name || parsed.email?.split("@")[0];
          }
        }
      } catch {
        // Ignorer les erreurs
      }

      // Générer le nom de fichier SEO optimisé et personnalisé
      const seoFilename = generateSEOFilename({
        actionId: microAction,
        username,
        scores: ranges,
        feedback,
        locale: "fr",
      });

      setShareData({
        imageBlob: blob,
        imageUrl: dataUrl,
        filename: seoFilename,
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
    stopCamera();
    router.push("/");
  };

  const actionDetails = MICRO_ACTIONS[microAction];
  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  return (
    <main className="fixed inset-0 bg-black">
      {/* Canvas caché pour capture */}
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {step === "selfie" ? (
          // === ÉTAPE 1: SELFIE ===
          <motion.div
            key="selfie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-5 flex items-center justify-between">
              <button onClick={handleClose} className="text-white/60 hover:text-white">
                <X size={24} />
              </button>
              <span className="text-white/60 text-sm">Selfie victoire</span>
              <button onClick={switchCamera} className="text-white/60 hover:text-white">
                <RotateCcw size={24} />
              </button>
            </div>

            {/* Vidéo */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />

            {/* Overlay guidage */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            {/* Instructions et bouton capture */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center">
              <p className="text-white/80 text-center mb-6 text-sm">
                Montre ton visage après l'exercice !<br />
                <span className="text-white/50">Souris, tu l'as mérité</span>
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
                Passer cette étape
              </button>
            </div>
          </motion.div>
        ) : (
          // === ÉTAPE 2: PREVIEW ===
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center p-4"
          >
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

          {/* Boutons sous la card */}
          <div className="mt-6 flex items-center gap-4">
            <motion.button
              onClick={retakeSelfie}
              className="px-5 py-2.5 rounded-xl text-white/60 text-sm border border-white/20 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw size={16} />
              Reprendre
            </motion.button>

            <motion.button
              onClick={handleShareClick}
              disabled={isGeneratingImage}
              className="px-6 py-2.5 rounded-xl text-white font-medium text-sm flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGeneratingImage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {getTranslation("share.preparing", "Préparation")}
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  {getTranslation("share.shareMySkane", "Partager mon Skane")}
                </>
              )}
            </motion.button>
          </div>

          <button
            onClick={handleClose}
            className="mt-4 text-white/30 text-xs hover:text-white/50"
          >
            {getTranslation("share.later", "Plus tard")}
          </button>
        </motion.div>
        )}
      </AnimatePresence>

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
