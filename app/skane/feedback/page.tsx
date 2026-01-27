"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useAuthContext } from "@/components/providers/AuthProvider";
import QuickSignupModal from "@/components/signup/QuickSignupModal";
import { saveSkane, updateSkaneFeedback, generateSkaneId } from "@/lib/skane/storage";
import { updateSessionFeedback } from "@/lib/skane/session-model";
import { updateMicroActionFeedback, updateSkaneSession, getOrCreateGuestId, getUserId } from "@/lib/skane/supabase-tracker";
import { addToGuestCache } from "@/lib/skane/guest-cache";

type FeedbackValue = "worse" | "same" | "better";

// Convertir feedback en effet numérique pour Supabase
function feedbackToEffect(feedback: FeedbackValue): -1 | 0 | 1 {
  switch (feedback) {
    case "worse": return -1;
    case "same": return 0;
    case "better": return 1;
  }
}

export default function FeedbackPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuthContext();
  const [result, setResult] = useState<any>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState<FeedbackValue | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("skane_analysis_result");
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
  }, []);

  const handleFeedback = (feedback: FeedbackValue) => {
    if (selectedFeedback || isSubmitting) return;

    setSelectedFeedback(feedback);
    setIsSubmitting(true);

    const isGuestMode = localStorage.getItem("guestMode") === "true";
    const userId = getUserId();
    const effect = feedbackToEffect(feedback);
    const afterScore = calculateAfterScore(result?.skaneIndex || 50, effect);

    // Mise à jour sessionStorage immédiate pour que share-prompt ait aprèsScore/feedback sans attendre le réseau
    const updatedResult = {
      ...result,
      afterScore,
      selectedFeedback: feedback,
    };
    sessionStorage.setItem("skane_analysis_result", JSON.stringify(updatedResult));

    // Sauvegardes locales synchrones (pas de réseau)
    const localSessionId = result?.localSessionId;
    if (localSessionId) {
      updateSessionFeedback(localSessionId, feedback);
    }
    const skaneId = generateSkaneId();
    const skaneResult = {
      id: skaneId,
      timestamp: new Date(),
      internalState: result?.state,
      microAction: result?.microAction,
      feedback: feedback,
      userId: userId || undefined,
      isGuestMode: isGuestMode,
      skaneIndexBefore: result?.skaneIndex,
      skaneIndexAfter: afterScore,
    };
    saveSkane(skaneResult);
    updateSkaneFeedback(skaneId, feedback);
    if (isGuestMode) {
      addToGuestCache({
        id: skaneId,
        ts: Date.now(),
        feedback: feedback,
        mode: result?.state,
      });
    }

    // Sauvegardes réseau en arrière-plan (ne bloquent plus la redirection)
    const sessionId = result?.sessionId;
    const sessionPayload = (result as { sessionPayload?: unknown })?.sessionPayload;
    const eventId = sessionStorage.getItem("micro_action_event_id");
    void (async () => {
      let noktaData: { sessionId: string | null; skaneIndex: unknown } | null = null;
      if (sessionPayload) {
        try {
          const res = await fetch("/api/nokta/submit-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionPayload, feedback }),
          });
          const data = await res.json();
          if (data?.success)
            noktaData = { sessionId: data.sessionId ?? null, skaneIndex: data.skaneIndex };
          if (noktaData) {
            const current = sessionStorage.getItem("skane_analysis_result");
            if (current) {
              const parsed = JSON.parse(current) as Record<string, unknown>;
              sessionStorage.setItem(
                "skane_analysis_result",
                JSON.stringify({ ...parsed, ...noktaData })
              );
            }
          }
        } catch (e) {
          console.warn("[Nokta] submit-feedback failed", e);
        }
      }
      if (eventId) {
        try {
          await updateMicroActionFeedback(eventId, effect);
        } catch (e) {
          console.warn("[Feedback] updateMicroActionFeedback failed", e);
        }
      }
      if (sessionId) {
        try {
          await updateSkaneSession(sessionId, afterScore, result.skaneIndex);
        } catch (e) {
          console.warn("[Feedback] updateSkaneSession failed", e);
        }
      }
    })();

    if (!user && !authLoading && !isGuestMode) {
      setPendingFeedback(feedback);
      setShowSignupModal(true);
      setIsSubmitting(false);
      return;
    }

    // Redirection rapide après un court délai (message de confiance)
    const redirectDelayMs = 500;
    setTimeout(() => {
      if (feedback === "better") {
        router.push("/skane/share-prompt");
      } else {
        router.push("/");
      }
    }, redirectDelayMs);
  };

  const handleSignupSuccess = async (userId: string, username: string) => {
    // Associer le skane au nouvel utilisateur si nécessaire
    if (pendingFeedback && result) {
      // Le skane a déjà été sauvegardé localement, on peut le lier à l'utilisateur
      // via une mise à jour dans Supabase si nécessaire
      const sessionId = result?.sessionId;
      if (sessionId) {
        // Mettre à jour la session avec le userId
        await updateSkaneSession(sessionId, result.afterScore, result.skaneIndex);
      }
    }

    setShowSignupModal(false);
    setPendingFeedback(null);

    // Rediriger selon le feedback
    if (pendingFeedback === "better") {
      router.push("/skane/share-prompt");
    } else {
      router.push("/");
    }
  };

  const handleSignupSkip = () => {
    const feedbackToRedirect = pendingFeedback;
    setShowSignupModal(false);
    setPendingFeedback(null);
    
    // Rediriger selon le feedback (utiliser la variable locale pour éviter le problème de timing)
    if (feedbackToRedirect === "better") {
      router.push("/skane/share-prompt");
    } else {
      router.push("/");
    }
  };

  // Calculer le after_score basé sur le feedback
  function calculateAfterScore(beforeScore: number, effect: -1 | 0 | 1): number {
    switch (effect) {
      case 1: // Mieux - grande amélioration
        return Math.max(10, beforeScore - Math.floor(Math.random() * 30 + 40));
      case 0: // Pareil - légère amélioration
        return Math.max(15, beforeScore - Math.floor(Math.random() * 15 + 10));
      case -1: // Pire - pas d'amélioration
        return Math.min(95, beforeScore + Math.floor(Math.random() * 10));
      default:
        return beforeScore - 20;
    }
  }

  if (!result) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nokta-one-blue border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-6">
      {/* Question principale - claire et simple */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-semibold text-nokta-one-white mb-3">
          {t("feedback.howDoYouFeel")}
        </h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          {t("feedback.helpImprove")}
        </p>
      </motion.div>

      {/* 
        NEURO-UX DESIGN:
        - 3 boutons disposés horizontalement
        - "Mieux" (better) est PLUS GRAND et à DROITE (zone du pouce naturelle)
        - Couleurs: better=vert dominant, same=neutre, worse=discret
        - Hiérarchie visuelle pousse vers "Mieux"
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-end justify-center gap-4 w-full max-w-sm"
      >
        {/* Worse - Petit, discret, à gauche */}
        <motion.button
          onClick={() => handleFeedback("worse")}
          disabled={selectedFeedback !== null || isSubmitting}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
          style={{
            background: selectedFeedback === "worse" 
              ? "rgba(239, 68, 68, 0.2)" 
              : "rgba(255, 255, 255, 0.05)",
            border: selectedFeedback === "worse"
              ? "2px solid rgba(239, 68, 68, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.1)",
            opacity: selectedFeedback && selectedFeedback !== "worse" ? 0.4 : 1,
            minWidth: "80px",
          }}
          whileHover={!selectedFeedback && !isSubmitting ? { scale: 1.05 } : {}}
          whileTap={!selectedFeedback && !isSubmitting ? { scale: 0.95 } : {}}
        >
          <span className="text-3xl">😕</span>
          <span className="text-xs text-gray-400">
            {t("feedback.worse")}
          </span>
        </motion.button>

        {/* Same - Moyen, neutre, au centre */}
        <motion.button
          onClick={() => handleFeedback("same")}
          disabled={selectedFeedback !== null || isSubmitting}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
          style={{
            background: selectedFeedback === "same" 
              ? "rgba(156, 163, 175, 0.2)" 
              : "rgba(255, 255, 255, 0.05)",
            border: selectedFeedback === "same"
              ? "2px solid rgba(156, 163, 175, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.1)",
            opacity: selectedFeedback && selectedFeedback !== "same" ? 0.4 : 1,
            minWidth: "90px",
          }}
          whileHover={!selectedFeedback && !isSubmitting ? { scale: 1.05 } : {}}
          whileTap={!selectedFeedback && !isSubmitting ? { scale: 0.95 } : {}}
        >
          <span className="text-4xl">😐</span>
          <span className="text-xs text-gray-400">
            {t("feedback.same")}
          </span>
        </motion.button>

        {/* Better - GRAND, dominant, à DROITE (thumb zone) */}
        <motion.button
          onClick={() => handleFeedback("better")}
          disabled={selectedFeedback !== null || isSubmitting}
          className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all"
          style={{
            background: selectedFeedback === "better" 
              ? "rgba(16, 185, 129, 0.3)" 
              : "rgba(16, 185, 129, 0.1)",
            border: selectedFeedback === "better"
              ? "2px solid rgba(16, 185, 129, 0.7)"
              : "2px solid rgba(16, 185, 129, 0.3)",
            opacity: selectedFeedback && selectedFeedback !== "better" ? 0.4 : 1,
            minWidth: "110px",
            // Box shadow pour attirer l'attention
            boxShadow: !selectedFeedback && !isSubmitting
              ? "0 0 20px rgba(16, 185, 129, 0.2)" 
              : "none",
          }}
          whileHover={!selectedFeedback && !isSubmitting ? { scale: 1.08 } : {}}
          whileTap={!selectedFeedback && !isSubmitting ? { scale: 0.95 } : {}}
        >
          <span className="text-5xl">🙂</span>
          <span className="text-sm font-medium text-green-400">
            {t("feedback.better")}
          </span>
        </motion.button>
      </motion.div>

      {/* Message de confirmation après sélection */}
      {selectedFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-nokta-one-white text-lg">
            {selectedFeedback === "better" && t("feedback.greatToHear")}
            {selectedFeedback === "same" && t("feedback.noted")}
            {selectedFeedback === "worse" && t("feedback.willImprove")}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-nokta-one-blue rounded-full animate-pulse" />
            <span className="text-gray-400 text-sm">
              {t("feedback.redirecting")}
            </span>
          </div>
        </motion.div>
      )}

      {/* Explication discrète en bas */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-500 px-8"
      >
        {t("feedback.privacyNote")}
      </motion.p>

      {/* Modal d'inscription pour utilisateurs non connectés */}
      <QuickSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSkip={handleSignupSkip}
        onSuccess={handleSignupSuccess}
      />
    </main>
  );
}
