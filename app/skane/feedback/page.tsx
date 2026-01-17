"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateSkaneFeedback, getStoredSkanes, generateSkaneId, saveSkane } from "@/lib/skane/storage";
import type { UserFeedback, InternalState, MicroActionType } from "@/lib/skane/types";
import { 
  updateMicroActionFeedback, 
  updateSkaneSession,
  feedbackToEffect,
  getOrCreateGuestId,
  getUserId
} from "@/lib/skane/supabase-tracker";
import { updateSessionFeedback } from "@/lib/skane/session-model";

interface AnalysisResult {
  state: InternalState;
  skaneIndex: number;
  microAction: MicroActionType;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("skane_analysis_result");
    if (!stored) {
      router.push("/skane");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setResult(parsed);
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
  }, [router]);

  const handleFeedback = async (feedback: UserFeedback) => {
    if (!result || selectedFeedback) return; // Éviter les doubles clics

    setSelectedFeedback(feedback);

    // Récupérer les IDs
    const isGuestMode = localStorage.getItem("guestMode") === "true";
    const userId = getUserId();
    const guestId = isGuestMode ? getOrCreateGuestId() : null;
    
    // Calculer after_score basé sur le feedback
    const effect = feedbackToEffect(feedback);
    const afterScore = calculateAfterScore(result.skaneIndex, effect);

    // Mettre à jour le feedback dans Supabase
    const eventId = sessionStorage.getItem('micro_action_event_id');
    if (eventId) {
      await updateMicroActionFeedback(eventId, effect);
    }

    // Mettre à jour la session SKANE (after_score)
    const sessionId = (result as any).sessionId;
    if (sessionId) {
      await updateSkaneSession(sessionId, afterScore, result.skaneIndex);
      
      // Mettre à jour sessionStorage pour la page share
      const updatedResult = {
        ...result,
        afterScore: afterScore,
      };
      sessionStorage.setItem("skane_analysis_result", JSON.stringify(updatedResult));
    }

    // Mettre à jour la session locale (nouveau modèle)
    const localSessionId = (result as any).localSessionId;
    if (localSessionId) {
      updateSessionFeedback(localSessionId, feedback);
    }

    // Sauvegarder aussi en localStorage (fallback)
    const skaneId = generateSkaneId();
    const skaneResult = {
      id: skaneId,
      timestamp: new Date(),
      internalState: result.state,
      microAction: result.microAction,
      feedback: feedback,
      userId: userId || undefined,
      isGuestMode: isGuestMode,
      skaneIndexBefore: result.skaneIndex,
      skaneIndexAfter: afterScore,
    };

    saveSkane(skaneResult);
    updateSkaneFeedback(skaneId, feedback);

    // Rediriger après un court délai
    setTimeout(() => {
      router.push("/skane/share-prompt");
    }, 500);
  };

  // Calculer le after_score basé sur le feedback
  function calculateAfterScore(beforeScore: number, effect: -1 | 0 | 1): number {
    switch (effect) {
      case 1: // Mieux
        return Math.max(10, beforeScore - Math.floor(Math.random() * 30 + 40));
      case 0: // Pareil
        return Math.max(15, beforeScore - Math.floor(Math.random() * 15 + 10));
      case -1: // Pire
        return Math.min(95, beforeScore + Math.floor(Math.random() * 10));
      default:
        return beforeScore - 20;
    }
  }

  if (!result) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <p className="text-nokta-one-white">Loading...</p>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold text-nokta-one-white mb-12 text-center">
        How are you feeling?
      </h1>

      <div className="flex gap-8 items-center">
        {/* Worse */}
        <motion.button
          onClick={() => handleFeedback("worse")}
          disabled={selectedFeedback !== null}
          className="text-6xl disabled:opacity-50"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          😕
        </motion.button>

        {/* Same */}
        <motion.button
          onClick={() => handleFeedback("same")}
          disabled={selectedFeedback !== null}
          className="text-6xl disabled:opacity-50"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          😐
        </motion.button>

        {/* Better */}
        <motion.button
          onClick={() => handleFeedback("better")}
          disabled={selectedFeedback !== null}
          className="text-6xl disabled:opacity-50"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          🙂
        </motion.button>
      </div>
    </main>
  );
}
