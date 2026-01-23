"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { checkRitualEligibility } from "@/lib/skane/ritual-trigger";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface RitualSuggestionProps {
  userId: string;
}

/**
 * RitualSuggestion
 * 
 * Affiche une suggestion de rituel si l'utilisateur est éligible.
 * Utilise le système i18n pour les traductions.
 */
export default function RitualSuggestion({ userId }: RitualSuggestionProps) {
  const { t } = useTranslation();
  const [isEligible, setIsEligible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed permanently
    const dismissed = localStorage.getItem("nokta_ritual_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    // Check if already shown this session
    const shown = sessionStorage.getItem("nokta_ritual_shown");
    if (shown === "true") {
      return;
    }

    // Check eligibility
    checkRitualEligibility(userId).then((result) => {
      if (result.eligible) {
        setIsEligible(true);
        sessionStorage.setItem("nokta_ritual_shown", "true");
      }
    });
  }, [userId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("nokta_ritual_dismissed", "true");
  };

  if (!isEligible || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mx-4 mb-4"
      >
        <div
          className="relative p-4 rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label={t("common.close")}
          >
            <X size={16} className="text-gray-500" />
          </button>

          <div className="flex gap-3 pr-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(139, 92, 246, 0.1)" }}
            >
              <Sparkles size={16} className="text-violet-400" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("ritual.suggestion")}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
