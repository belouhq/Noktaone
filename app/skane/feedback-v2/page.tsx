"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { hapticV2 } from "@/lib/skane/hapticsV2";

/**
 * FEEDBACK PAGE V2 - Ultra Simple avec Smileys
 * 
 * SPEC V2 :
 * - Question : "Comment tu te sens ?"
 * - 3 réponses avec smileys GRANDS + texte court
 * - 🙂 "Mieux" = légèrement plus contrasté, zone du pouce
 * - Tap 1 doigt, aucune confirmation
 * - Share UNIQUEMENT si 🙂 Mieux
 */

type FeedbackValue = "better" | "same" | "worse";

interface FeedbackOption {
  value: FeedbackValue;
  emoji: string;
  label: string;
  labelKey: string;
}

const FEEDBACK_OPTIONS: FeedbackOption[] = [
  { value: "better", emoji: "🙂", label: "Mieux", labelKey: "feedback.better" },
  { value: "same", emoji: "😐", label: "Pareil", labelKey: "feedback.same" },
  { value: "worse", emoji: "🙁", label: "Pas mieux", labelKey: "feedback.worse" },
];

export default function FeedbackPageV2() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackValue | null>(null);

  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  const handleFeedback = (feedback: FeedbackValue) => {
    if (selectedFeedback) return; // Déjà sélectionné

    // Vibration de confirmation
    hapticV2.feedbackTap();

    setSelectedFeedback(feedback);

    // Stocker le feedback
    sessionStorage.setItem("skane_feedback", feedback);

    // Transition après un court délai
    setTimeout(() => {
      if (feedback === "better") {
        // UNIQUEMENT si "Mieux" → Share Skane V2
        router.push("/skane/share-prompt-v2");
      } else {
        // Sinon → retour silencieux à la home
        router.push("/");
      }
    }, 600);
  };

  return (
    <main className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      {/* Question principale */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-white text-center mb-16"
      >
        {getTranslation("feedback.howDoYouFeel", "Comment tu te sens ?")}
      </motion.h1>

      {/* Smileys - GRANDS, espacés, tap 1 doigt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-end justify-center gap-6"
      >
        {FEEDBACK_OPTIONS.map((option, index) => {
          const isBetter = option.value === "better";
          const isSelected = selectedFeedback === option.value;
          const isOtherSelected = selectedFeedback && selectedFeedback !== option.value;

          return (
            <motion.button
              key={option.value}
              onClick={() => handleFeedback(option.value)}
              disabled={selectedFeedback !== null}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all"
              style={{
                // 🙂 "Mieux" = légèrement plus contrasté et plus grand
                opacity: isOtherSelected ? 0.3 : 1,
                transform: isSelected ? "scale(1.1)" : "scale(1)",
              }}
              whileHover={!selectedFeedback ? { scale: 1.05 } : {}}
              whileTap={!selectedFeedback ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isOtherSelected ? 0.3 : 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {/* Emoji GRAND */}
              <span
                className="transition-all"
                style={{
                  fontSize: isBetter ? "80px" : "64px",
                  filter: isSelected 
                    ? "drop-shadow(0 0 20px rgba(255,255,255,0.3))" 
                    : "none",
                }}
              >
                {option.emoji}
              </span>

              {/* Label court */}
              <span
                className="text-sm font-medium transition-all"
                style={{
                  color: isSelected 
                    ? "#fff" 
                    : isBetter 
                      ? "rgba(255,255,255,0.9)" 
                      : "rgba(255,255,255,0.5)",
                }}
              >
                {getTranslation(option.labelKey, option.label)}
              </span>

              {/* Indicateur "zone du pouce" pour Mieux */}
              {isBetter && !selectedFeedback && (
                <motion.div
                  className="w-1 h-1 rounded-full bg-blue-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Aucune confirmation, transition automatique */}
      {selectedFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        </motion.div>
      )}
    </main>
  );
}
