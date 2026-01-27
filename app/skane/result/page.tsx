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

    // microAction ou micro_action.id ; si absent (ancien cache, erreur API), fallback pour ne pas bloquer
    const actionId = (result.microAction || result.micro_action?.id || "box_breathing") as MicroActionType;
    const sessionId = result.sessionId || result.sessionPayload?.sessionId;

    const fullResult = {
      ...result,
      microAction: actionId,
      micro_action: result.micro_action || { id: actionId, duration_seconds: 24, category: "breathing" },
      sessionId: sessionId ?? undefined,
    };
    sessionStorage.setItem("skane_analysis_result", JSON.stringify(fullResult));
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

      {/* Contenu : colonne pour ne pas cacher Signal, Action ni disclaimer */}
      <div className="relative z-10 flex flex-col min-h-screen px-8">
        {/* Bloc principal centré */}
        <div className="flex-1 flex flex-col items-center justify-center">
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

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white tracking-wider mb-8"
          >
            {t("skane.completed")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
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

        {/* Zone bouton + disclaimer : en flux, rien n’est caché */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4 pt-6 pb-6">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            onClick={handleStartAction}
            className="rounded-full flex items-center justify-center text-center"
            style={{
              width: "112px",
              height: "112px",
              background: "linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)",
              border: "1.5px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 24px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white text-sm font-semibold leading-tight px-3 text-center">
              {t("skane.startMicroAction")}
            </span>
          </motion.button>

          <p className="text-white/50 text-xs text-center">
            {t("skane.disclaimer")}
          </p>
        </div>
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
