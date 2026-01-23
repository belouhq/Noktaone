"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Shield, X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface CameraPermissionPromptProps {
  onAllow: () => void;
  onDeny?: () => void;
  isVisible: boolean;
}

/**
 * CameraPermissionPrompt
 * 
 * Affiche un écran explicatif AVANT de demander la permission caméra.
 * Réduit le taux de refus en expliquant pourquoi + en rassurant sur la privacy.
 * 
 * Usage:
 * 1. Afficher ce composant
 * 2. User clique "Activer"
 * 3. Alors seulement demander navigator.mediaDevices.getUserMedia()
 */
export default function CameraPermissionPrompt({
  onAllow,
  onDeny,
  isVisible,
}: CameraPermissionPromptProps) {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-sm"
        >
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <Camera size={36} className="text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-white text-center mb-4">
            {t("camera.permissionTitle")}
          </h2>

          {/* Main explanation */}
          <p className="text-gray-400 text-center mb-6 leading-relaxed">
            {t("camera.permissionDescription")}
          </p>

          {/* Privacy reassurance */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-8"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <Shield size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300 text-sm leading-relaxed">
              {t("camera.privacyNote")}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onAllow}
              className="w-full py-4 rounded-2xl font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              }}
            >
              {t("camera.allowButton")}
            </button>

            {onDeny && (
              <button
                onClick={onDeny}
                className="w-full py-4 rounded-2xl font-medium text-gray-400 transition-all hover:text-white"
              >
                {t("camera.laterButton")}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// HOOK pour gérer le flow de permission
// ============================================

type PermissionState = "prompt" | "granted" | "denied" | "unknown";

export function useCameraPermission() {
  const [permissionState, setPermissionState] = useState<PermissionState>("unknown");
  const [showPrompt, setShowPrompt] = useState(false);

  // Vérifier l'état actuel de la permission
  useEffect(() => {
    async function checkPermission() {
      try {
        // API Permission (pas supportée partout)
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: "camera" as PermissionName });
          setPermissionState(result.state as PermissionState);
          
          result.onchange = () => {
            setPermissionState(result.state as PermissionState);
          };
        }
      } catch {
        // Fallback : on ne sait pas
        setPermissionState("unknown");
      }
    }
    checkPermission();
  }, []);

  // Demander la permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Arrêter immédiatement le stream (on voulait juste la permission)
      stream.getTracks().forEach(track => track.stop());
      setPermissionState("granted");
      setShowPrompt(false);
      return true;
    } catch (err) {
      setPermissionState("denied");
      setShowPrompt(false);
      return false;
    }
  };

  // Afficher le prompt custom avant de demander
  const promptForPermission = () => {
    if (permissionState === "granted") {
      // Déjà autorisé, pas besoin de prompt
      return true;
    }
    setShowPrompt(true);
    return false;
  };

  return {
    permissionState,
    showPrompt,
    setShowPrompt,
    promptForPermission,
    requestPermission,
    isGranted: permissionState === "granted",
    isDenied: permissionState === "denied",
  };
}
