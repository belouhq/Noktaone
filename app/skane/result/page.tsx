"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { MICRO_ACTIONS } from "@/lib/skane/constants";
import { getMicroActionDetails } from "@/lib/skane/selector";
import type { InternalState, MicroActionType } from "@/lib/skane/types";

interface SkaneResult {
  internal_state?: "HIGH_ACTIVATION" | "LOW_ENERGY" | "REGULATED";
  state?: InternalState;
  signal_label?: string;
  micro_action?: {
    id: string;
    duration_seconds: number;
    category: string;
  };
  microAction?: MicroActionType;
  skane_index?: number;
  skaneIndex?: number;
  sessionId?: string;
  sessionPayload?: {
    sessionId?: string;
  };
}

// Couleurs selon l'état
const STATE_COLORS = {
  HIGH_ACTIVATION: "#F43F5E", // Rose/Rouge
  LOW_ENERGY: "#3B82F6", // Bleu
  REGULATED: "#10B981", // Vert
};

export default function ResultPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [result, setResult] = useState<SkaneResult | null>(null);

  useEffect(() => {
    // Essayer d'abord skane_analysis_result (nouveau format)
    let storedResult = sessionStorage.getItem("skane_analysis_result");
    // Sinon essayer skane_result (ancien format)
    if (!storedResult) {
      storedResult = sessionStorage.getItem("skane_result");
    }
    
    if (!storedResult) {
      router.push("/skane");
      return;
    }
    try {
      const parsed = JSON.parse(storedResult);
      setResult(parsed);
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
  }, [router]);

  const handleStartAction = () => {
    if (!result) return;
    
    // Utiliser microAction ou micro_action.id
    const actionId = result.microAction || result.micro_action?.id;
    if (!actionId) {
      console.error("No action ID found in result");
      router.push("/skane");
      return;
    }
    
    // Récupérer sessionId de façon robuste
    const sessionId = result.sessionId || result.sessionPayload?.sessionId;
    
    // Stocker le résultat complet avec toutes les données nécessaires
    const fullResult = {
      ...result,
      microAction: actionId,
      sessionId: sessionId, // S'assurer que sessionId est à la racine
    };
    sessionStorage.setItem("skane_analysis_result", JSON.stringify(fullResult));
    
    // CHANGEMENT: Aller vers briefing au lieu de action directement
    router.push("/skane/briefing");
  };

  if (!result) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Déterminer l'état interne
  const internalState = (result.internal_state || result.state || "REGULATED") as InternalState;
  const actionId = (result.microAction || result.micro_action?.id || "box_breathing") as MicroActionType;
  const action = MICRO_ACTIONS[actionId];
  const actionDetails = getMicroActionDetails(actionId);
  const actionName = actionDetails?.name || action?.name || actionId;
  const stateColor = STATE_COLORS[internalState];
  const signalLabel = result.signal_label || getSignalLabel(internalState);

  // Récupérer l'image capturée pour l'afficher en fond
  const capturedImage =
    typeof window !== "undefined"
      ? sessionStorage.getItem("skane_captured_image")
      : null;

  return (
    <div className="fixed inset-0 bg-black">
      {/* Image de fond */}
      <div className="absolute inset-0">
        {capturedImage ? (
          <img
            src={`data:image/jpeg;base64,${capturedImage}`}
            alt="Scan"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Icône de succès */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-6"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              border: `3px dashed ${stateColor}`,
              background: `${stateColor}15`,
            }}
          >
            <Check className="w-10 h-10" style={{ color: stateColor }} />
          </div>
        </motion.div>

        {/* SKANE TERMINÉ */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white tracking-wider mb-8"
        >
          {t("skane.completed")}
        </motion.h1>

        {/* Signal et Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <p className="text-lg text-white mb-3">
            <span className="text-white/60">{t("skane.signal")}: </span>
            <span
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: stateColor }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: stateColor }}
              />
              {signalLabel}
            </span>
          </p>
          <p className="text-lg text-white">
            <span className="text-white/60">{t("skane.action")}: </span>
            <span className="text-white font-semibold">
              {actionName}
            </span>
          </p>
        </motion.div>
      </div>

      {/* Bouton Start micro-action - ROND, Liquid glass, position fixe en bas */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        onClick={handleStartAction}
        className="fixed z-30 rounded-full flex items-center justify-center"
        style={{
          width: "160px",
          height: "160px",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          // Liquid glass style amélioré
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1.5px solid rgba(255, 255, 255, 0.25)",
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 80px ${stateColor}20,
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.5),
            0 0 100px ${stateColor}30,
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-white text-lg font-bold text-center leading-tight px-4">
          {t("skane.startMicroAction")}
        </span>
      </motion.button>

      {/* Disclaimer en bas */}
      <div className="fixed bottom-6 left-0 right-0 text-center z-10">
        <p className="text-white/30 text-xs">
          {t("skane.disclaimer")}
        </p>
      </div>
    </div>
  );
}

// Helper pour obtenir le label du signal
function getSignalLabel(state: InternalState): string {
  const labels: Record<InternalState, string> = {
    HIGH_ACTIVATION: "High Activation",
    LOW_ENERGY: "Low Energy",
    REGULATED: "Clear Signal",
  };
  return labels[state] || "Clear Signal";
}
