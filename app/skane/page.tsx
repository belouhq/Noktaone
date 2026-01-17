"use client";

import { useState, useEffect } from "react";
import { Info, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useCamera } from "@/lib/hooks/useCamera";
import { CameraPermissionScreen } from "@/components/skane/CameraPermissionScreen";
import { BottomNav } from "@/components/ui/BottomNav";
import InfoModal from "@/components/modals/InfoModal";
import FaceGuide from "@/components/skane/FaceGuide";
import { FLOW_V1_ENABLED } from "@/lib/flowV1";

export default function SkanePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { videoRef, cameraState, requestPermission, captureFrame } = useCamera();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Charger l'état guestMode depuis localStorage au montage
  useEffect(() => {
    const savedGuestMode = localStorage.getItem("guestMode");
    if (savedGuestMode === "true") {
      setIsGuestMode(true);
    }
  }, []);

  // Attacher les event listeners pour tous les boutons
  useEffect(() => {
    const attachListeners = () => {
      // Bouton Info
      const infoBtn = document.querySelector('[data-skane="info"]');
      if (infoBtn && !infoBtn.hasAttribute('data-listener-attached')) {
        infoBtn.setAttribute('data-listener-attached', 'true');
        infoBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsInfoModalOpen(true);
        });
      }

      // Bouton Guest Mode
      const guestBtn = document.querySelector('[data-skane="guest"]');
      if (guestBtn && !guestBtn.hasAttribute('data-listener-attached')) {
        guestBtn.setAttribute('data-listener-attached', 'true');
        guestBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleGuestMode();
        });
      }

      // Bouton Start Skane
      const startBtn = document.querySelector('[data-skane="start"]');
      if (startBtn && !startBtn.hasAttribute('data-listener-attached')) {
        startBtn.setAttribute('data-listener-attached', 'true');
        startBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleStartSkane();
        });
      }
    };

    attachListeners();
    setTimeout(attachListeners, 100);
    setTimeout(attachListeners, 500);
  }, [isGuestMode]);

  // Toggle guest mode
  const toggleGuestMode = () => {
    const newGuestMode = !isGuestMode;
    setIsGuestMode(newGuestMode);
    localStorage.setItem("guestMode", newGuestMode.toString());
  };

  const handleStartSkane = async () => {
    // Démarrer le compte à rebours
    setIsCountingDown(true);
    setCountdown(3);

    // Compte à rebours de 3 secondes
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Capturer l'image après le compte à rebours
          captureAndRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
      setIsCountingDown(false);
      // Afficher un message à l'utilisateur
      alert("La caméra n'est pas prête. Veuillez réessayer.");
      return;
    }

    // Vérifier que la vidéo a des dimensions valides
    if (!video.videoWidth || !video.videoHeight) {
      console.error("Failed to capture frame: video has no dimensions", {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      setIsCountingDown(false);
      alert("La caméra n'a pas de dimensions valides. Veuillez réessayer.");
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
      setIsCountingDown(false);
      // Afficher un message à l'utilisateur
      alert("Impossible de capturer l'image. Veuillez réessayer.");
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
    <main className="relative min-h-screen bg-nokta-one-black overflow-hidden">
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

      {/* Boutons Top-Right - z-index: 20 */}
      <div
        className="absolute top-4 right-4 flex flex-col items-end"
        style={{ zIndex: 20, gap: "12px" }}
      >
        {/* Bouton Info */}
        <motion.button
          data-skane="info"
          className="btn-circle-responsive rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: 20,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Info size={20} className="text-nokta-one-white" />
        </motion.button>

        {/* Bouton Invité (Guest Mode) */}
        <motion.button
          data-skane="guest"
          className="btn-circle-responsive rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: 20,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <User
            size={20}
            className={isGuestMode ? "text-nokta-one-blue" : "text-nokta-one-white"}
          />
        </motion.button>
      </div>

      {/* Face Guide - visible pendant le compte à rebours */}
      <AnimatePresence>
        {isCountingDown && <FaceGuide />}
      </AnimatePresence>

      {/* Compte à rebours - visible pendant le countdown */}
      <AnimatePresence>
        {isCountingDown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: 25 }}
          >
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                border: "4px solid #10B981",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="text-6xl font-bold text-green-500">{countdown}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton Central Start Skane - z-index: 20 */}
      {!isCountingDown && (
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        >
          <motion.button
            data-skane="start"
            className="skane-button rounded-full flex flex-col items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(30px)",
              pointerEvents: "auto",
              cursor: "pointer",
              zIndex: 20,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17,
            }}
          >
            <span className="text-nokta-one-white text-responsive-xl font-bold text-center whitespace-pre-line">
              {t("skane.startSkane")}
            </span>
          </motion.button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav currentPage="skane" />

      {/* Info Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </main>
  );
}
