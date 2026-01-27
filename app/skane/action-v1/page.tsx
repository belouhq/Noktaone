"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { MICRO_ACTIONS } from "@/lib/skane/constants";
import { MicroActionRunnerV1, PhaseStateV1 } from "@/lib/skane/microActionRunnerV1";
import { MicroActionType } from "@/lib/skane/types";
import { hapticV1 } from "@/lib/skane/hapticsV1";

/**
 * MICRO-ACTION PAGE V1 - Flow Adaptatif & Universel
 *
 * PRINCIPES CLÉS :
 * 1. UI minimale - fond calme, 1 texte court, aucun bouton
 * 2. Haptique = guide principal (inspire/expire différenciés)
 * 3. Visuel = support optionnel (regarder l'écran pas obligatoire)
 * 4. Message "Tu peux poser ton téléphone"
 * 5. Fin = vibration signature + 300ms silence
 */

export default function MicroActionPageV1() {
  const router = useRouter();
  const { t } = useTranslation();
  const runnerRef = useRef<MicroActionRunnerV1 | null>(null);

  const [actionId, setActionId] = useState<MicroActionType | null>(null);
  const [phase, setPhase] = useState<PhaseStateV1 | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("skane_analysis_result");

    if (!storedResult) {
      router.push("/skane");
      return;
    }

    try {
      const parsed = JSON.parse(storedResult);
      if (parsed.microAction) {
        setActionId(parsed.microAction as MicroActionType);
        setIsReady(true);
      } else {
        router.push("/skane");
      }
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
  }, [router]);

  useEffect(() => {
    if (!isReady || !actionId) return;

    const action = MICRO_ACTIONS[actionId];
    if (!action) {
      router.push("/skane");
      return;
    }

    runnerRef.current = new MicroActionRunnerV1(
      action,
      (state) => setPhase(state),
      () => handleComplete()
    );

    const timeout = setTimeout(() => {
      runnerRef.current?.start();
    }, 800);

    const hintTimeout = setTimeout(() => {
      setShowHint(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(hintTimeout);
      runnerRef.current?.stop();
    };
  }, [isReady, actionId, router]);

  const handleComplete = () => {
    setIsComplete(true);

    hapticV1.endSignature();

    setTimeout(() => {
      router.push("/skane/feedback");
    }, 800);
  };

  if (!actionId || !phase) {
    return (
      <main className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          initial={{
            width: 280,
            height: 380,
            borderRadius: "50%",
            opacity: 0.5,
          }}
          animate={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            opacity: 1,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="border-2 border-white/20"
        />
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/60 text-lg text-center px-8"
        >
          {t("skane.observeFeeling") || "Observe ce que tu ressens."}
        </motion.p>
      </main>
    );
  }

  const isInhale = phase.type === "inhale";
  const isExhale = phase.type === "exhale";
  const baseScale = isInhale ? 1.4 : isExhale ? 0.7 : 1;
  const circleScale = baseScale * (0.9 + phase.phaseProgress * 0.1);

  return (
    <main className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.03) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative flex items-center justify-center"
        animate={{ scale: circleScale }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="w-32 h-32 rounded-full"
          style={{
            background:
              isInhale
                ? "rgba(59, 130, 246, 0.15)"
                : isExhale
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(255, 255, 255, 0.05)",
            border:
              isInhale
                ? "2px solid rgba(59, 130, 246, 0.4)"
                : isExhale
                  ? "2px solid rgba(16, 185, 129, 0.4)"
                  : "2px solid rgba(255, 255, 255, 0.1)",
            boxShadow: isInhale
              ? "0 0 60px rgba(59, 130, 246, 0.2)"
              : isExhale
                ? "0 0 60px rgba(16, 185, 129, 0.2)"
                : "none",
          }}
        />

        <motion.div
          className="absolute w-3 h-3 rounded-full bg-white/40"
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <motion.p
        key={phase.instruction}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-12 text-white text-xl font-light text-center"
      >
        {phase.instruction || t("skane.breatheWithRhythm") || "Respire avec le rythme."}
      </motion.p>

      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-32 text-white/40 text-sm text-center"
          >
            {t("skane.canPutPhoneDown") || "Tu peux poser ton téléphone."}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="absolute bottom-16 flex gap-2">
        {Array.from({ length: phase.totalCycles }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background:
                i < phase.currentCycle
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(255, 255, 255, 0.15)",
            }}
          />
        ))}
      </div>
    </main>
  );
}
