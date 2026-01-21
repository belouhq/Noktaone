"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RotateCcw } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import SkaneShareCardV2 from "@/components/skane/SkaneShareCardV2";
import { getStoredSkanes } from "@/lib/skane/storage";
import type { InternalState, MicroActionType } from "@/lib/skane/types";
import { 
  createShareEvent, 
  getOrCreateGuestId, 
  getUserId 
} from "@/lib/skane/supabase-tracker";
import { useShareTracking, getShareUrl } from "@/lib/hooks/useShareTracking";

interface AnalysisResult {
  state: InternalState;
  skaneIndex: number;
  microAction: MicroActionType;
  sessionId?: string;
  afterScore?: number;
}

type Step = "selfie" | "preview";

export default function SharePageV2() {
  const router = useRouter();
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [step, setStep] = useState<Step>("selfie");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [skaneIndexAfter, setSkaneIndexAfter] = useState<number | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  
  const { shareId, createShareId, trackShare } = useShareTracking();

  useEffect(() => {
    const stored = sessionStorage.getItem("skane_analysis_result");

    if (!stored) {
      router.push("/skane");
      return;
    }

    try {
      const parsed: AnalysisResult = JSON.parse(stored);
      setResult(parsed);

      // Récupérer le afterScore
      if (parsed.afterScore !== undefined) {
        setSkaneIndexAfter(parsed.afterScore);
      } else {
        const skanes = getStoredSkanes();
        const lastSkane = skanes[skanes.length - 1];
        if (lastSkane?.skaneIndexAfter) {
          setSkaneIndexAfter(lastSkane.skaneIndexAfter);
        } else {
          // Fallback calculé
          setSkaneIndexAfter(Math.max(10, parsed.skaneIndex - 40));
        }
      }

      // Créer l'ID de partage dès que les données sont prêtes
      const initShareId = async () => {
        const isGuestMode = localStorage.getItem("guestMode") === "true";
        const userId = getUserId();
        const guestId = isGuestMode ? getOrCreateGuestId() : null;
        
        await createShareId({
          user_id: userId,
          guest_id: guestId,
          session_id: parsed.sessionId,
          share_type: "other", // Sera mis à jour lors du partage réel
          skane_before: parsed.skaneIndex,
          skane_after: parsed.afterScore || Math.max(10, parsed.skaneIndex - 40),
        });
      };
      
      initShareId();
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
  }, [router, createShareId]);

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

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
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

  const handleShare = async (shareType: string) => {
    if (!result) return;
    
    const isGuestMode = localStorage.getItem("guestMode") === "true";
    const userId = getUserId();
    const guestId = isGuestMode ? getOrCreateGuestId() : null;
    
    if (result.sessionId) {
      await createShareEvent({
        user_id: userId,
        guest_id: guestId,
        session_id: result.sessionId,
        share_type: shareType as any,
      });
    }
    
    if (shareId) {
      await trackShare(shareId, shareType as any);
    }
  };

  const handleClose = () => {
    stopCamera();
    router.push("/");
  };

  if (!result || skaneIndexAfter === null) {
    return (
      <main className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Préparation du partage...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-black">
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {step === "selfie" ? (
          <motion.div
            key="selfie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 z-20 p-5 flex items-center justify-between">
              <button onClick={handleClose} className="text-white/60 hover:text-white">
                <X size={24} />
              </button>
              <span className="text-white/60 text-sm">{t("share.selfieTitle", "Selfie victoire")}</span>
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

            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center">
              <p className="text-white/80 text-center mb-6 text-sm">
                {t("share.selfieInstructions", "Montre ton visage après l'exercice !")}<br />
                <span className="text-white/50">{t("share.selfieSubtext", "Souris, tu l'as mérité")}</span>
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
                {t("share.skipSelfie", "Passer cette étape")}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center px-4 overflow-y-auto py-8"
          >
            <SkaneShareCardV2
              capturedImage={selfieUrl || undefined}
              state={result.state}
              skaneIndexBefore={result.skaneIndex}
              skaneIndexAfter={skaneIndexAfter}
              microAction={result.microAction}
              shareId={shareId || undefined}
              onShare={handleShare}
            />

            <div className="mt-6 flex items-center gap-4">
              <motion.button
                onClick={retakeSelfie}
                className="px-5 py-2.5 rounded-xl text-white/60 text-sm border border-white/20 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={16} />
                {t("share.retake", "Reprendre")}
              </motion.button>

              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 rounded-xl text-white/60 font-medium hover:text-white transition-colors"
              >
                {t("common.back", "Retour")}
              </button>
            </div>
            
            {process.env.NODE_ENV === "development" && shareId && (
              <p className="text-white/20 text-xs mt-4">
                Share ID: {shareId} • URL: {getShareUrl(shareId)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
