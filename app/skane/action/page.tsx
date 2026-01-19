'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { MICRO_ACTIONS } from '@/lib/skane/constants';
import { MicroActionRunner, PhaseState } from '@/lib/skane/microActionRunner';
import { BreathingCircle } from '@/components/skane/BreathingCircle';
import { MicroActionType, MicroAction } from '@/lib/skane/types';
import { 
  createMicroActionEvent, 
  getOrCreateGuestId, 
  getUserId 
} from '@/lib/skane/supabase-tracker';

export default function ActionPage() {
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

  // Charger les données depuis sessionStorage
  useEffect(() => {
    const storedResult = sessionStorage.getItem('skane_analysis_result');
    
    if (!storedResult) {
      router.push('/skane');
      return;
    }

    try {
      const parsed = JSON.parse(storedResult);
      if (parsed.microAction && parsed.sessionId) {
        setActionId(parsed.microAction as MicroActionType);
        
        // Tracker le lancement de la micro-action
        const isGuestMode = localStorage.getItem("guestMode") === "true";
        const userId = getUserId();
        const guestId = isGuestMode ? getOrCreateGuestId() : null;
        const selectionResult = parsed.selectionResult;
        
        createMicroActionEvent({
          user_id: userId,
          guest_id: guestId,
          session_id: parsed.sessionId,
          micro_action_id: parsed.microAction,
          mode: isGuestMode ? 'guest' : 'account',
          candidates_shown: selectionResult?.candidates,
          picked_action_id: parsed.microAction,
          selection_rule: selectionResult?.selectionRule,
          penalties_applied: selectionResult?.penalties,
          user_lift_used: selectionResult?.userLiftUsed,
          completed: false,
        }).then(event => {
          if (event) {
            // Stocker l'event ID pour mettre à jour le feedback plus tard
            sessionStorage.setItem('micro_action_event_id', event.id);
          }
        });
        
        setIsReady(true);
      } else {
        router.push('/skane');
      }
    } catch (error) {
      console.error('Error parsing result:', error);
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
        router.push('/skane/feedback');
      }
    );

    // Démarrer immédiatement (start() appelle emitState() immédiatement)
    runnerRef.current.start();

    return () => {
      runnerRef.current?.stop();
    };
  }, [isReady, actionId, router]);

  if (!actionId || !phase) {
    return (
      <div className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-nokta-one-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const action = MICRO_ACTIONS[actionId];

  return (
    <div className="fixed inset-0 bg-nokta-one-black flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <h1 className="text-2xl font-semibold text-nokta-one-white mb-2">
          {action.nameKey ? t(action.nameKey) : action.name}
        </h1>
        <p className="text-gray-400">
          {action.duration}s
        </p>
      </div>

      {/* Zone centrale */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Cercle respiratoire */}
        <BreathingCircle
          phase={phase.type}
          duration={phase.totalSeconds}
          secondsRemaining={phase.secondsRemaining}
        />

        {/* Instruction */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase.instruction}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 text-xl text-nokta-one-white text-center max-w-xs"
          >
            {phase.instruction}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Footer - Progression */}
      <div className="pb-12 text-center">
        <p className="text-gray-500 text-sm">
          {phase.currentCycle} / {phase.totalCycles}
        </p>

        {/* Barre de progression */}
        <div className="mt-4 mx-auto w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-nokta-one-blue"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(phase.currentCycle / phase.totalCycles) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
