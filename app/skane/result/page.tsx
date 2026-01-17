"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { MICRO_ACTIONS } from "@/lib/skane/constants";
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
}

// Couleurs selon l'état
const STATE_COLORS = {
  HIGH_ACTIVATION: "#F43F5E", // Rose/Rouge
  LOW_ENERGY: "#3B82F6", // Bleu
  REGULATED: "#10B981", // Vert
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SkaneResult | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("skane_result");
    if (!storedResult) {
      router.push("/skane");
      return;
    }
    try {
      setResult(JSON.parse(storedResult));
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
  }, [router]);

  const handleStartAction = () => {
    if (!result) return;
    
    // Utiliser microAction ou micro_action.id
    const actionId = result.microAction || result.micro_action?.id;
    if (actionId) {
      sessionStorage.setItem("skane_action", actionId);
    }
    router.push("/skane/action");
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
          <div className="w-full h-full bg-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
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
              border: `3px solid ${stateColor}`,
              borderStyle: "dashed",
            }}
          >
            <Check className="w-10 h-10" style={{ color: stateColor }} />
          </div>
        </motion.div>

        {/* SKANE COMPLETED */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white tracking-wider mb-8"
        >
          SKANE COMPLETED
        </motion.h1>

        {/* Signal et Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <p className="text-xl text-white mb-2">
            <span className="font-semibold">Signal : </span>
            <span
              className="inline-flex items-center gap-2"
              style={{ color: stateColor }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stateColor }}
              />
              {signalLabel}
            </span>
          </p>
          <p className="text-xl text-white">
            <span className="font-semibold">Action : </span>
            <span className="text-white/90">
              {action?.name || actionId}
            </span>
          </p>
        </motion.div>

        {/* Bouton Start micro-action */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleStartAction}
          className="flex items-center gap-4 px-8 py-4 rounded-full"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-lg">Start micro-action</span>
        </motion.button>
      </div>

      {/* Disclaimer en bas */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/40 text-xs">
          Signal bien-être – pas médical
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
