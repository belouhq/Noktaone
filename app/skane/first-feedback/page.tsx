"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * FEEDBACK SCREEN (FIRST SKANE) - Étape 6 du Flow V1 Définitif
 * 
 * Question : "Ton état a-t-il changé ?"
 * 
 * Boutons (UX imposée) :
 * 1. "Oui, clairement" - DOMINANT, à droite (thumb zone), contraste max
 * 2. "Un peu" - secondaire
 * 3. "Pas vraiment" - tertiaire
 * 
 * Le bouton "Oui" doit être :
 * - le plus grand
 * - le plus simple à atteindre
 * - visuellement évident
 */

type FeedbackValue = "yes_clearly" | "a_little" | "not_really";

export default function FirstSkaneFeedbackPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackValue | null>(null);

  const handleFeedback = (feedback: FeedbackValue) => {
    if (selectedFeedback) return;
    
    setSelectedFeedback(feedback);
    
    // Stocker le feedback
    sessionStorage.setItem("first_skane_feedback", feedback);
    
    // Convertir pour compatibilité avec le système existant
    const legacyFeedback = feedback === "yes_clearly" ? "better" 
      : feedback === "a_little" ? "same" 
      : "worse";
    sessionStorage.setItem("skane_feedback", legacyFeedback);

    // Rediriger vers l'écran de continuation après un délai
    setTimeout(() => {
      router.push("/onboarding/continue");
    }, 800);
  };

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-6">
      
      {/* Question principale */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-nokta-one-white text-center mb-16"
      >
        {t("firstSkaneFeedback.question")}
      </motion.h1>

      {/* 
        NEURO-UX LAYOUT:
        - Disposition verticale pour mobile (plus naturel)
        - "Oui, clairement" en PREMIER (haut) et PLUS GRAND
        - Gradient de taille et de contraste vers le bas
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm flex flex-col gap-3"
      >
        {/* OUI, CLAIREMENT - DOMINANT */}
        <motion.button
          onClick={() => handleFeedback("yes_clearly")}
          disabled={selectedFeedback !== null}
          className="w-full py-5 rounded-2xl text-lg font-semibold transition-all"
          style={{
            background: selectedFeedback === "yes_clearly"
              ? "rgba(16, 185, 129, 0.4)"
              : "rgba(16, 185, 129, 0.15)",
            border: selectedFeedback === "yes_clearly"
              ? "2px solid #10B981"
              : "2px solid rgba(16, 185, 129, 0.4)",
            color: "#10B981",
            opacity: selectedFeedback && selectedFeedback !== "yes_clearly" ? 0.3 : 1,
            boxShadow: !selectedFeedback 
              ? "0 0 30px rgba(16, 185, 129, 0.2)" 
              : "none",
          }}
          whileHover={!selectedFeedback ? { scale: 1.02 } : {}}
          whileTap={!selectedFeedback ? { scale: 0.98 } : {}}
        >
          ✓ {t("firstSkaneFeedback.yesClearly")}
        </motion.button>

        {/* UN PEU - Secondaire */}
        <motion.button
          onClick={() => handleFeedback("a_little")}
          disabled={selectedFeedback !== null}
          className="w-full py-4 rounded-xl text-base transition-all"
          style={{
            background: selectedFeedback === "a_little"
              ? "rgba(156, 163, 175, 0.3)"
              : "rgba(255, 255, 255, 0.05)",
            border: selectedFeedback === "a_little"
              ? "1px solid rgba(156, 163, 175, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.1)",
            color: selectedFeedback === "a_little" ? "#9CA3AF" : "#6B7280",
            opacity: selectedFeedback && selectedFeedback !== "a_little" ? 0.3 : 1,
          }}
          whileHover={!selectedFeedback ? { scale: 1.01 } : {}}
          whileTap={!selectedFeedback ? { scale: 0.98 } : {}}
        >
          {t("firstSkaneFeedback.aLittle")}
        </motion.button>

        {/* PAS VRAIMENT - Tertiaire (le moins visible) */}
        <motion.button
          onClick={() => handleFeedback("not_really")}
          disabled={selectedFeedback !== null}
          className="w-full py-3 rounded-xl text-sm transition-all"
          style={{
            background: "transparent",
            border: selectedFeedback === "not_really"
              ? "1px solid rgba(255, 255, 255, 0.2)"
              : "1px solid rgba(255, 255, 255, 0.05)",
            color: "#4B5563",
            opacity: selectedFeedback && selectedFeedback !== "not_really" ? 0.3 : 1,
          }}
          whileHover={!selectedFeedback ? { scale: 1.01 } : {}}
          whileTap={!selectedFeedback ? { scale: 0.98 } : {}}
        >
          {t("firstSkaneFeedback.notReally")}
        </motion.button>
      </motion.div>

      {/* Message de confirmation */}
      {selectedFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 text-center"
        >
          <p className="text-nokta-one-white text-lg">
            {selectedFeedback === "yes_clearly" && t("firstSkaneFeedback.confirmYes")}
            {selectedFeedback === "a_little" && t("firstSkaneFeedback.confirmLittle")}
            {selectedFeedback === "not_really" && t("firstSkaneFeedback.confirmNot")}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-nokta-one-blue rounded-full animate-pulse" />
          </div>
        </motion.div>
      )}
    </main>
  );
}
