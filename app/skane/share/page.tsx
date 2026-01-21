"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RotateCcw } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import SkaneShareCard from "@/components/skane/SkaneShareCard";
import { getStoredSkanes } from "@/lib/skane/storage";
import type { InternalState, MicroActionType } from "@/lib/skane/types";
import { 
  createShareEvent, 
  getOrCreateGuestId, 
  getUserId 
} from "@/lib/skane/supabase-tracker";

interface AnalysisResult {
  state: InternalState;
  skaneIndex: number;
  microAction: MicroActionType;
}

type Step = "selfie" | "preview";

export default function SharePage() {
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

  useEffect(() => {
    const stored = sessionStorage.getItem("skane_analysis_result");

    if (!stored) {
      router.push("/skane");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setResult(parsed);

      // Fourchettes SkaneIndexResult (share-prompt) : avant/après depuis les ranges
      let usedPayload = false;
      const payloadRaw = sessionStorage.getItem("skane_share_payload");
      if (payloadRaw) {
        try {
          const payload = JSON.parse(payloadRaw);
          if (payload.beforeRange?.length === 2 && payload.afterRange?.length === 2) {
            const before = (payload.beforeRange[0] + payload.beforeRange[1]) / 2;
            const after = (payload.afterRange[0] + payload.afterRange[1]) / 2;
            setResult((r) => (r ? { ...r, skaneIndex: Math.round(before) } : r));
            setSkaneIndexAfter(Math.round(after));
            sessionStorage.removeItem("skane_share_payload");
            usedPayload = true;
          }
        } catch {
          /* ignore */
        }
      }

      if (!usedPayload) {
        if (parsed.afterScore != null) {
          setSkaneIndexAfter(parsed.afterScore);
        } else {
          const skanes = getStoredSkanes();
          const lastSkane = skanes[skanes.length - 1];
          if (lastSkane?.skaneIndexAfter != null) {
            setSkaneIndexAfter(lastSkane.skaneIndexAfter);
          } else {
            setSkaneIndexAfter(Math.max(10, (parsed.skaneIndex ?? 50) - 40));
          }
        }
      }
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
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

  const handleClose = () => {
    stopCamera();
    router.push("/");
  };

  if (!result || skaneIndexAfter === null) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <p className="text-nokta-one-white">{t("common.loading")}</p>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-nokta-one-black">
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
              <span className="text-white/60 text-sm">{t("share.selfieTitle", "Selfie victoire")}</span>
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
          // === ÉTAPE 2: PREVIEW ===
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center px-4 overflow-y-auto py-8"
          >
            <SkaneShareCard
              capturedImage={selfieUrl || undefined}
              state={result.state}
              skaneIndexBefore={result.skaneIndex}
              skaneIndexAfter={skaneIndexAfter}
              microAction={result.microAction}
              onShare={async (shareType: string) => {
                // Tracker le partage
                const isGuestMode = localStorage.getItem("guestMode") === "true";
                const userId = getUserId();
                const guestId = isGuestMode ? getOrCreateGuestId() : null;
                const sessionId = (result as any).sessionId;
                
                if (sessionId) {
                  await createShareEvent({
                    user_id: userId,
                    guest_id: guestId,
                    session_id: sessionId,
                    share_type: shareType as any,
                  });
                }
              }}
            />

            {/* Boutons */}
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
                className="px-6 py-3 rounded-xl text-nokta-one-white font-medium"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(40px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                {t("common.back")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
