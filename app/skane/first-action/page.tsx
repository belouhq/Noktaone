"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { MicroActionRunner, PhaseState } from "@/lib/skane/microActionRunner";
import { BreathingCircle } from "@/components/skane/BreathingCircle";
import { MICRO_ACTIONS } from "@/lib/skane/constants";
import { MicroActionType, MicroAction } from "@/lib/skane/types";

/**
 * FIRST ACTION PAGE - Micro-action pour le premier skane
 * 
 * Similaire à /skane/action mais adapté pour le flow premier skane
 * L'action est stockée dans sessionStorage sous "first_skane_action"
 */

export default function FirstActionPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const runnerRef = useRef<MicroActionRunner | null>(null);

  const [actionId, setActionId] = useState<MicroActionType | null>(null);
  const [phase, setPhase] = useState<PhaseState | null>(null);
  const [isReady, setIsReady] = useState(false);

  // État initial pour éviter le loader infini
  const getInitialPhase = (action: MicroAction): PhaseState => {
    const firstInstruction = action.instructions[0];
    return {
      type: firstInstruction?.type || 'pause',
      instruction: firstInstruction?.text || 'Get ready...',
      secondsRemaining: firstInstruction?.duration || 0,
      totalSeconds: firstInstruction?.duration || 0,
      currentCycle: 0,
      totalCycles: action.repetitions,
      isComplete: false,
    };
  };

  // Charger l'action depuis sessionStorage
  useEffect(() => {
    const storedAction = sessionStorage.getItem('first_skane_action');
    
    if (!storedAction) {
      router.push('/skane');
      return;
    }

    try {
      const parsed = JSON.parse(storedAction);
      if (parsed.id) {
        setActionId(parsed.id as MicroActionType);
        setIsReady(true);
      } else {
        router.push('/skane');
      }
    } catch (error) {
      console.error('Error parsing action:', error);
      router.push('/skane');
    }
  }, [router]);

  // Démarrer l'action
  useEffect(() => {
    if (!isReady || !actionId) return;

    const action = MICRO_ACTIONS[actionId];
    if (!action) {
      router.push('/skane');
      return;
    }

    // Initialiser phase avec l'état de préparation
    setPhase(getInitialPhase(action));

    // Créer le runner
    runnerRef.current = new MicroActionRunner(
      action,
      (state) => setPhase(state),
      () => {
        // Action terminée → aller au feedback
        router.push('/skane/first-feedback');
      }
    );

    // Démarrer immédiatement
    runnerRef.current.start();

    return () => {
      if (runnerRef.current) {
        runnerRef.current.stop();
      }
    };
  }, [isReady, actionId, router]);

  if (!phase || !actionId) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nokta-one-blue border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const action = MICRO_ACTIONS[actionId];
  if (!action) {
    return null;
  }

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-6">
      {/* Instruction */}
      <motion.div
        key={phase.instruction}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-semibold text-nokta-one-white mb-2">
          {phase.instruction}
        </h1>
        {phase.secondsRemaining > 0 && (
          <p className="text-gray-400 text-lg">
            {Math.ceil(phase.secondsRemaining)}s
          </p>
        )}
      </motion.div>

      {/* Breathing Circle pour les actions de respiration */}
      {(actionId === 'box_breathing' || 
        actionId === 'physiological_sigh' || 
        actionId === 'expiration_3_8' ||
        actionId === 'respiration_4_6' ||
        actionId === 'respiration_2_1') && (
        <BreathingCircle
          phase={phase.type}
          duration={phase.totalSeconds}
          secondsRemaining={phase.secondsRemaining}
        />
      )}

      {/* Cycle indicator */}
      {action.repetitions > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex gap-2"
        >
          {Array.from({ length: action.repetitions }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < phase.currentCycle
                  ? 'bg-nokta-one-blue'
                  : i === phase.currentCycle
                  ? 'bg-nokta-one-blue/50'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </motion.div>
      )}

      {/* Completion indicator */}
      {phase.isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8"
        >
          <p className="text-green-400 text-lg font-medium">
            {t("skane.actionCompleted") || "Action terminée ✓"}
          </p>
        </motion.div>
      )}
    </main>
  );
}
