"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { checkRitualEligibility, RITUAL_MICROCOPY } from "@/lib/skane/ritual-trigger";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface RitualSuggestionProps {
  userId: string;
  locale?: "fr" | "en";
}

/**
 * RitualSuggestion
 * 
 * Affiche une suggestion de rituel UNIQUEMENT si l'utilisateur est éligible.
 * 
 * Règles :
 * - Ne jamais mentionner "thé" ou produit
 * - Ton suggestif, jamais impératif
 * - Dismissable définitivement
 * - Apparaît une seule fois par session max
 */
export default function RitualSuggestion({ userId, locale = "fr" }: RitualSuggestionProps) {
  const [isEligible, setIsEligible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { currentLanguage } = useTranslation();
  
  // Utiliser la langue actuelle si non spécifiée
  const displayLocale = locale || (currentLanguage === "fr" ? "fr" : "en");

  useEffect(() => {
    // Vérifier si déjà dismiss
    const dismissed = localStorage.getItem("nokta_ritual_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    // Vérifier si déjà montré cette session
    const shown = sessionStorage.getItem("nokta_ritual_shown");
    if (shown === "true") {
      setHasShown(true);
      return;
    }

    // Vérifier éligibilité
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

  // Ne rien afficher si pas éligible, déjà dismiss, ou déjà montré
  if (!isEligible || isDismissed || hasShown) {
    return null;
  }

  const message = RITUAL_MICROCOPY.suggestion[displayLocale];

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
          {/* Bouton fermer */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={16} className="text-gray-500" />
          </button>

          {/* Contenu */}
          <div className="flex gap-3 pr-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
              }}
            >
              <Sparkles size={16} className="text-violet-400" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
