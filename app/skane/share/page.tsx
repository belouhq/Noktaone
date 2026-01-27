"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RotateCcw } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import SkaneIndexResult, { type FeedbackType } from "@/components/skane/SkaneIndexResult";
import { getMicroActionDetails } from "@/lib/skane/selector";
import { getStoredSkanes } from "@/lib/skane/storage";
import type { InternalState, MicroActionType } from "@/lib/skane/types";
import { 
  createShareEvent, 
  getOrCreateGuestId, 
  getUserId 
} from "@/lib/skane/supabase-tracker";
import { useAuthContext } from "@/components/providers/AuthProvider";

interface AnalysisResult {
  state: InternalState;
  skaneIndex: number;
  microAction: MicroActionType;
  selectedFeedback?: string;
  /** Score après micro-action, dérivé du smiley "Comment te sens-tu ?" */
  afterScore?: number;
}

// Mapper le feedback utilisateur vers le type attendu
const FEEDBACK_TO_TYPE: Record<string, FeedbackType> = {
  worse: "still_high",
  same: "reduced",
  better: "clear",
};

type Step = "selfie" | "preview";

export default function SharePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [step, setStep] = useState<Step>("selfie");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [skaneIndexAfter, setSkaneIndexAfter] = useState<number | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [previousRanges, setPreviousRanges] = useState<{ before: [number, number]; after: [number, number] } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("skane_analysis_result");

    if (!stored) {
      router.push("/skane");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setResult(parsed);

      // Récupérer les fourchettes précédentes pour anti-répétition
      const pr = sessionStorage.getItem("skane_previous_ranges");
      if (pr) {
        try {
          setPreviousRanges(JSON.parse(pr));
        } catch {
          /* ignore */
        }
      }

      // Ne pas utiliser le selfie existant - toujours demander une nouvelle photo pour le partage
      // L'utilisateur doit prendre un selfie spécifiquement pour le partage
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
    
    // Stocker le selfie dans sessionStorage pour le partage (sans le préfixe data:image/jpeg;base64,)
    const base64Data = dataUrl.split(',')[1];
    sessionStorage.setItem("skane_share_image", base64Data); // Utiliser une clé différente pour le partage
    
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

  if (!result) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <p className="text-nokta-one-white">{t("common.loading")}</p>
      </main>
    );
  }

  // Si on a un selfie et qu'on est en mode preview, afficher SkaneIndexResult
  if (step === "preview" && selfieUrl) {
    // Utiliser le selfie pris spécifiquement pour le partage
    const actionId = result.microAction || (result as any).micro_action?.id || "box_breathing";
    const actionDetails = getMicroActionDetails(actionId as MicroActionType) || { name: "Skane", duration: 30 };
    const feedbackUi = result.selectedFeedback || "same";
    const feedback: FeedbackType = FEEDBACK_TO_TYPE[feedbackUi] ?? "reduced";
    const isGuestMode = localStorage.getItem("guestMode") === "true";

    // Récupérer le username
    let username: string;
    if (isGuestMode) {
      const guestId = getOrCreateGuestId();
      // Extraire la partie aléatoire de l'ID (les caractères après le dernier underscore)
      const randomPart = guestId.split('_').pop() || guestId;
      username = `guest-${randomPart.slice(0, 6)}`; // Prendre les 6 premiers caractères de la partie aléatoire
    } else if (user?.user_metadata?.username) {
      username = user.user_metadata.username;
    } else if (user?.email) {
      username = user.email.split('@')[0];
    } else {
      username = 'guest';
    }

    // Toujours fournir un identifiant (user ou guest) pour le tracking / cooldown
    const userId = getUserId() ?? getOrCreateGuestId();

    // Fonction pour retry avec une autre action (still_high)
    const handleRetryWithDifferentAction = () => {
      // Stocker l'info qu'on veut une autre action
      sessionStorage.setItem("skane_retry_different_action", "true");
      // Rediriger vers le scan
      router.push("/skane");
    };

    // Fonction pour retry simple (clear/reduced)
    const handleRetry = () => {
      // Rediriger vers le scan
      router.push("/skane");
    };


    const skaneIndexBefore = result.skaneIndex ?? (result as { skane_index?: number }).skane_index;
    const afterScoreFromSmiley = result.afterScore;

    return (
      <SkaneIndexResult
        selfieUrl={selfieUrl}
        feedback={feedback}
        microActionName={actionDetails.name}
        microActionDuration={actionDetails.duration}
        username={username}
        userId={userId}
        currentMicroAction={actionId as MicroActionType}
        isGuestMode={isGuestMode}
        previousRanges={previousRanges}
        skaneIndexBefore={typeof skaneIndexBefore === "number" ? skaneIndexBefore : undefined}
        afterScore={typeof afterScoreFromSmiley === "number" ? afterScoreFromSmiley : undefined}
        onClose={() => router.push("/")}
        onRetryWithDifferentAction={handleRetryWithDifferentAction}
        onRetry={handleRetry}
        onShare={async (data) => {
          // Tracker le partage
          const guestId = isGuestMode ? getOrCreateGuestId() : null;
          const sessionId = (result as any).sessionId;
          
          if (sessionId) {
            await createShareEvent({
              user_id: userId,
              guest_id: guestId,
              session_id: sessionId,
              share_type: 'story' as any,
            });
          }

          // Stocker les ranges pour la prochaine fois (anti-répétition)
          sessionStorage.setItem("skane_previous_ranges", JSON.stringify({ 
            before: data.beforeRange, 
            after: data.afterRange 
          }));

          console.log('Share filename:', data.filename);
        }}
      />
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
              <div className="flex-1" />
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

            {/* Overlay gradient en bas pour lisibilité */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Instructions et bouton capture */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center z-10">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                onClick={takeSelfie}
                disabled={!isCameraReady}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isCameraReady ? 1.1 : 1 }}
                whileTap={{ scale: isCameraReady ? 0.9 : 1 }}
                style={{
                  boxShadow: "0 0 0 4px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <Camera size={32} className="text-black" />
              </motion.button>

              <p className="mt-6 text-white/60 text-xs text-center">
                {t("share.selfieRequired", "Une photo est requise pour partager votre Skane Index")}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
