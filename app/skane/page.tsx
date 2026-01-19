"use client";

import { useState, useEffect } from "react";
import { Info, User, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useCamera } from "@/lib/hooks/useCamera";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { CameraPermissionScreen } from "@/components/skane/CameraPermissionScreen";
import { BottomNav } from "@/components/ui/BottomNav";
import InfoModal from "@/components/modals/InfoModal";
import FaceDetectionGuide from "@/components/skane/FaceDetectionGuide";
import ScreenFlash from "@/components/skane/ScreenFlash";
import Toast from "@/components/ui/Toast";
import { FLOW_V1_ENABLED } from "@/lib/flowV1";

export default function SkanePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { videoRef, cameraState, requestPermission, captureFrame } = useCamera();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isFaceReady, setIsFaceReady] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Charger l'état guestMode et flash depuis localStorage au montage
  useEffect(() => {
    const savedGuestMode = localStorage.getItem("guestMode");
    const savedFlash = localStorage.getItem("screenFlashEnabled");
    
    // Réinitialiser les états pour éviter les conflits
    setIsGuestMode(savedGuestMode === "true");
    setIsFlashEnabled(savedFlash === "true");
  }, []);

  // Les boutons utilisent maintenant onClick directement, pas besoin de event listeners

  // Toggle guest mode
  const toggleGuestMode = () => {
    const newGuestMode = !isGuestMode;
    setIsGuestMode(newGuestMode);
    localStorage.setItem("guestMode", newGuestMode.toString());
    
    // Afficher le message de confirmation
    if (newGuestMode) {
      setToastMessage(t("skane.guestModeEnabled") || "Mode invité activé");
    } else {
      setToastMessage(t("skane.guestModeDisabled") || "Mode invité désactivé");
    }
    setShowToast(true);
  };

  // Toggle screen flash
  const toggleFlash = () => {
    const newFlash = !isFlashEnabled;
    setIsFlashEnabled(newFlash);
    localStorage.setItem("screenFlashEnabled", newFlash.toString());
  };

  // Swipe gestures pour naviguer entre les pages
  const swipeRef = useSwipe({
    onSwipeLeft: () => {
      // Swipe vers la gauche = aller vers Settings
      router.push("/settings");
    },
    onSwipeRight: () => {
      // Swipe vers la droite = aller vers Home
      router.push("/");
    },
    threshold: 50,
    velocityThreshold: 0.3,
  });

  const handleStartSkane = async () => {
    // Capturer directement l'image (pas de countdown)
    captureAndRedirect();
  };

  const captureAndRedirect = async () => {
    // Attendre un peu pour s'assurer que la vidéo est prête
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Vérifier que la vidéo est prête
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      console.error("Failed to capture frame: video not ready", {
        hasVideo: !!video,
        readyState: video?.readyState,
        videoWidth: video?.videoWidth,
        videoHeight: video?.videoHeight
      });
      alert(t("skane.cameraNotReady") || "La caméra n'est pas prête. Veuillez réessayer.");
      return;
    }

    // Vérifier que la vidéo a des dimensions valides
    if (!video.videoWidth || !video.videoHeight) {
      console.error("Failed to capture frame: video has no dimensions", {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      alert(t("skane.cameraInvalidDimensions") || "La caméra n'a pas de dimensions valides. Veuillez réessayer.");
      return;
    }

    // Capturer le frame actuel avec le hook
    const frame = captureFrame();
    
    if (frame) {
      // Extraire le base64 sans le préfixe data:image si présent
      let imageBase64 = frame;
      if (frame.startsWith('data:image')) {
        imageBase64 = frame.split(',')[1] || frame;
      }
      
      // Stocker dans sessionStorage (format base64 pur pour l'API)
      sessionStorage.setItem("skane_captured_image", imageBase64);
      sessionStorage.setItem("skane_guest_mode", isGuestMode.toString());
      
      // Rediriger vers le flow approprié
      if (FLOW_V1_ENABLED) {
        router.push("/skane/flowV1/analyzing");
      } else {
        router.push("/skane/analyzing");
      }
    } else {
      console.error("Failed to capture frame: captureFrame returned null");
      alert(t("skane.captureError") || "Impossible de capturer l'image. Veuillez réessayer.");
    }
  };

  // Afficher l'écran de permission si nécessaire
  if (cameraState !== 'granted') {
    return (
      <CameraPermissionScreen
        state={cameraState}
        onRequestPermission={requestPermission}
      />
    );
  }

  return (
    <main 
      ref={swipeRef}
      className="relative min-h-screen bg-nokta-one-black overflow-hidden"
    >
      {/* Screen Flash Overlay - activé immédiatement quand isFlashEnabled */}
      <ScreenFlash isActive={isFlashEnabled} />

      {/* Video Background - z-index: 0 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="fixed inset-0 w-full h-full object-cover"
        style={{
          zIndex: 0,
          pointerEvents: "none",
          transform: "scaleX(-1)", // Mirror pour selfie
        }}
      />

      {/* Vignette Overlay - z-index: 1 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Boutons Top-Right - z-index: 30 */}
      <div
        className="absolute top-4 right-4 flex flex-col items-end"
        style={{ zIndex: 30, gap: "12px", pointerEvents: "auto" }}
      >
        {/* Bouton Info */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsInfoModalOpen(true);
          }}
          className="btn-circle-responsive rounded-full flex items-center justify-center"
          style={{
            background: isFlashEnabled 
              ? "rgba(0, 0, 0, 0.7)" 
              : "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: isFlashEnabled 
              ? "2px solid rgba(255, 255, 255, 0.4)" 
              : "1px solid rgba(255, 255, 255, 0.2)",
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: 30,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Info 
            size={20} 
            className={isFlashEnabled ? "text-white" : "text-nokta-one-white"} 
          />
        </motion.button>

        {/* Bouton Flash (Screen Flash) - ROND */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFlash();
          }}
          className="rounded-full flex items-center justify-center"
          style={{
            width: "clamp(44px, 12vw, 56px)",
            height: "clamp(44px, 12vw, 56px)",
            background: isFlashEnabled 
              ? "rgba(59, 130, 246, 0.3)" 
              : "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: isFlashEnabled 
              ? "1px solid rgba(59, 130, 246, 0.5)" 
              : "1px solid rgba(255, 255, 255, 0.2)",
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: 30,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Zap
            size={20}
            className={isFlashEnabled ? "text-blue-400" : "text-white"}
            fill={isFlashEnabled ? "#3B82F6" : "none"}
          />
        </motion.button>

        {/* Bouton Invité (Guest Mode) - ROND */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleGuestMode();
          }}
          className="rounded-full flex items-center justify-center"
          style={{
            width: "clamp(44px, 12vw, 56px)",
            height: "clamp(44px, 12vw, 56px)",
            background: isFlashEnabled
              ? (isGuestMode 
                  ? "rgba(59, 130, 246, 0.8)" 
                  : "rgba(0, 0, 0, 0.7)")
              : (isGuestMode 
                  ? "rgba(59, 130, 246, 0.3)" 
                  : "rgba(255, 255, 255, 0.1)"),
            backdropFilter: "blur(10px)",
            border: isFlashEnabled
              ? (isGuestMode 
                  ? "2px solid rgba(59, 130, 246, 0.9)" 
                  : "2px solid rgba(255, 255, 255, 0.4)")
              : (isGuestMode 
                  ? "1px solid rgba(59, 130, 246, 0.5)" 
                  : "1px solid rgba(255, 255, 255, 0.2)"),
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: 30,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <User
            size={20}
            className={isFlashEnabled
              ? (isGuestMode ? "text-blue-300" : "text-white")
              : (isGuestMode ? "text-blue-400" : "text-white")
            }
          />
        </motion.button>
      </div>

      {/* Face Detection Guide - visible en permanence */}
      <FaceDetectionGuide 
        videoRef={videoRef}
        showInstructions={true}
        flashEnabled={isFlashEnabled}
        onReadyChange={setIsFaceReady}
      />

      {/* Bouton Start Skane - UNIQUEMENT si visage prêt - En bas au niveau du pouce - ROND */}
      {isFaceReady && (
        <div
          className="absolute"
          style={{
            bottom: "120px", // Au-dessus de la bottom nav (80px) + marge (40px)
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            pointerEvents: "auto",
          }}
        >
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleStartSkane();
            }}
            className="rounded-full flex flex-col items-center justify-center"
            style={{
              // IMPORTANT: même width et height pour un cercle parfait
              width: "clamp(140px, 40vw, 200px)",
              height: "clamp(140px, 40vw, 200px)",
              // Bleu quand prêt
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)",
              backdropFilter: "blur(30px)",
              border: "2px solid rgba(59, 130, 246, 0.5)",
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              pointerEvents: "auto",
              cursor: "pointer",
              zIndex: 30,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17,
            }}
          >
            <span className="text-white text-responsive-xl font-bold text-center whitespace-pre-line">
              {t("skane.startSkane")}
            </span>
          </motion.button>
        </div>
      )}

      {/* NOTE: Pas de dots indicator (pagination) - supprimé comme demandé */}

      {/* Bottom Navigation */}
      <BottomNav currentPage="skane" />

      {/* Info Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Toast pour le mode invité */}
      <Toast
        message={toastMessage || ""}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
    </main>
  );
}
