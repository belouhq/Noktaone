"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Zap, BookOpen, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { MICRO_ACTIONS } from "@/lib/skane/constants";
import { MICRO_ACTION_SCIENCE, getInstructionColor, getInstructionIcon } from "@/lib/skane/science";
import type { MicroActionType, Instruction } from "@/lib/skane/types";
import { hapticV2 } from "@/lib/skane/hapticsV2";
import ActionTip from "@/components/skane/ActionTip";

/**
 * PAGE BRIEFING - Avant la micro-action
 * 
 * Affiche :
 * 1. Composition de l'exercice (timeline visuelle)
 * 2. Preuves scientifiques (études, source, stat clé)
 * 3. Bouton "Je suis prêt" pour lancer
 */

export default function BriefingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [actionId, setActionId] = useState<MicroActionType | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("skane_analysis_result");
    
    if (!storedResult) {
      router.push("/skane");
      return;
    }

    try {
      const parsed = JSON.parse(storedResult);
      const microAction = parsed.microAction || parsed.micro_action?.id;
      
      if (microAction) {
        setActionId(microAction as MicroActionType);
        setIsReady(true);
      } else {
        router.push("/skane");
      }
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
  }, [router]);

  const handleStart = () => {
    // Si l'action a un tip, l'afficher d'abord
    if (action?.tip) {
      setShowTip(true);
    } else {
      // Sinon, démarrer directement le compte à rebours
      startCountdown();
    }
  };

  const startCountdown = () => {
    // Démarrer le compte à rebours de 3 secondes
    setCountdown(3);
    
    // Retour haptique initial
    hapticV2.transition();
    
    // Compte à rebours avec retour haptique à chaque seconde
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          // Retour haptique final avant le démarrage
          hapticV2.cycleEnd();
          // Rediriger vers l'action après un court délai
          setTimeout(() => {
            router.push("/skane/action");
          }, 100);
          return null;
        }
        // Retour haptique à chaque seconde
        hapticV2.transition();
        return prev - 1;
      });
    }, 1000);
  };

  const handleTipSkip = () => {
    setShowTip(false);
    startCountdown();
  };

  const handleTipContinue = () => {
    setShowTip(false);
    startCountdown();
  };

  const handleBack = () => {
    router.push("/skane/result");
  };

  if (!isReady || !actionId) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0B] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const action = MICRO_ACTIONS[actionId];
  const science = MICRO_ACTION_SCIENCE[actionId];

  if (!action || !science) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0B] flex items-center justify-center">
        <p className="text-white/60">Action non trouvée</p>
      </div>
    );
  }

  // Calcul de la durée totale d'un cycle
  const cycleDuration = action.instructions.reduce((sum, inst) => sum + inst.duration, 0);
  // Durée totale de l'exercice (cycle × répétitions)
  const totalDuration = cycleDuration * action.repetitions;

  return (
    <div className="fixed inset-0 bg-[#0A0A0B] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 py-4 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            ← Retour
          </button>
          <span className="text-white/30 text-xs uppercase tracking-widest">
            Briefing
          </span>
        </div>
      </div>

      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Titre de l'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            {action.nameKey ? t(action.nameKey) : action.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-white/50 text-sm">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {action.duration}s
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} />
              {action.repetitions} {action.repetitions > 1 ? "cycles" : "cycle"}
            </span>
          </div>
        </motion.div>

        {/* === SECTION 1: COMPOSITION === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-white/70 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
            Composition
          </h2>
          
          {/* Timeline visuelle */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="space-y-3">
              {action.instructions.map((instruction, index) => (
                <InstructionRow 
                  key={index} 
                  instruction={instruction} 
                  index={index}
                  total={action.instructions.length}
                />
              ))}
            </div>
            
            {/* Résumé du cycle */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">1 cycle complet</span>
                <span className="text-white font-semibold text-sm">
                  {cycleDuration} {cycleDuration > 1 ? "secondes" : "seconde"}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <span className="text-white/70 text-xs font-medium">
                  {action.repetitions} {action.repetitions > 1 ? "cycles" : "cycle"} · Durée totale
                </span>
                <span className="text-white font-bold text-base">
                  {totalDuration} {totalDuration > 1 ? "secondes" : "seconde"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* === SECTION 2: SCIENCE === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-white/70 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
            Science
          </h2>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-5 border border-blue-500/20">
            {/* Stat clé - Hero */}
            <div className="text-center mb-5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-bold text-white mb-1"
              >
                {science.keyStat.value}
              </motion.div>
              <p className="text-white/60 text-sm">{science.keyStat.label}</p>
            </div>

            {/* Source */}
            <div className="bg-white/5 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-3">
                <BookOpen size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    {science.keySource.institution}
                  </p>
                  <p className="text-white/40 text-xs">
                    {science.keySource.year} · {science.studiesCount} études
                  </p>
                </div>
              </div>
            </div>

            {/* Effet principal */}
            <p className="text-white/70 text-sm leading-relaxed">
              {science.primaryEffect}
            </p>

            {/* Bouton voir plus */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 text-blue-400 text-xs flex items-center gap-1 hover:text-blue-300 transition-colors"
            >
              {showDetails ? "Masquer" : "Comment ça marche ?"}
              <ChevronRight 
                size={14} 
                className={`transition-transform ${showDetails ? "rotate-90" : ""}`}
              />
            </button>

            {/* Détails expandables */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/50 text-xs leading-relaxed">
                      {science.mechanism}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* === SECTION 3: CONFIRMATION === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-white/70 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">3</span>
            Prêt ?
          </h2>
          
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <p className="text-white/60 text-sm mb-3 text-center">
              Trouve un endroit calme
            </p>
            
            {/* Rappel de mémorisation */}
            <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/5">
              <p className="text-white/70 text-xs font-medium mb-2">
                As-tu bien mémorisé l'exercice ?
              </p>
              <div className="space-y-1.5">
                {action.instructions.map((inst, idx) => {
                  const typeLabels: Record<string, string> = {
                    inhale: "Inspire",
                    exhale: "Expire",
                    hold: "Retiens",
                    pause: "Pause",
                    action: "Action",
                  };
                  return (
                    <div key={idx} className="flex items-center gap-2 text-white/50 text-[10px]">
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span>
                        {typeLabels[inst.type] || inst.type} {inst.duration}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <p className="text-white/40 text-xs text-center">
              Durée totale : <span className="font-semibold text-white/60">{totalDuration} {totalDuration > 1 ? "secondes" : "seconde"}</span> ({action.repetitions} {action.repetitions > 1 ? "cycles" : "cycle"})
            </p>
          </div>
        </motion.div>

        {/* Spacer pour le bouton fixe */}
        <div className="h-24" />
      </div>

      {/* Tip d'usage (optionnel) */}
      {showTip && action?.tip && (
        <ActionTip
          tip={action.tip}
          tipKey={action.tipKey}
          onSkip={handleTipSkip}
          onContinue={handleTipContinue}
        />
      )}

      {/* Overlay de compte à rebours */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-9xl font-bold text-white"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton CTA fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B] to-transparent">
        <motion.button
          onClick={handleStart}
          disabled={countdown !== null}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
            boxShadow: "0 8px 32px rgba(59, 130, 246, 0.4)",
          }}
          whileHover={countdown === null ? { scale: 1.02 } : {}}
          whileTap={countdown === null ? { scale: 0.98 } : {}}
        >
          {countdown === null ? (
            <>
              Je suis prêt
              <ArrowRight size={20} />
            </>
          ) : (
            "Préparation..."
          )}
        </motion.button>
      </div>
    </div>
  );
}

// === COMPOSANT: Ligne d'instruction ===
interface InstructionRowProps {
  instruction: Instruction;
  index: number;
  total: number;
}

function InstructionRow({ instruction, index, total }: InstructionRowProps) {
  const color = getInstructionColor(instruction.type);
  const icon = getInstructionIcon(instruction.type);
  
  // Labels français pour les types
  const typeLabels: Record<string, string> = {
    inhale: "Inspire",
    exhale: "Expire",
    hold: "Retiens",
    pause: "Pause",
    action: "Action",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="flex items-center gap-4"
    >
      {/* Numéro + ligne */}
      <div className="flex flex-col items-center">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ 
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </div>
        {index < total - 1 && (
          <div 
            className="w-0.5 h-6 mt-1"
            style={{ backgroundColor: `${color}30` }}
          />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 flex items-center justify-between py-1">
        <div>
          <p className="text-white font-medium text-sm">
            {typeLabels[instruction.type] || instruction.type}
          </p>
          <p className="text-white/40 text-xs">
            {instruction.text}
          </p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ 
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {instruction.duration} {instruction.duration > 1 ? "s" : "s"}
        </div>
      </div>
    </motion.div>
  );
}
