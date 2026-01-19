"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { BottomNav } from "@/components/ui/BottomNav";

/**
 * HOME - Mode Adaptation (7 jours)
 * 
 * Contenu unique :
 * - "Adaptation en cours — Jour X sur 7"
 * - "Chaque skane améliore la précision."
 * - Bouton central unique : "Skane"
 * - Option secondaire : Icône "Mode invité" (pas de texte)
 * 
 * PAS de stats, PAS de dashboard, PAS de graphe
 */

function getAdaptationDay(): number {
  const startDateStr = localStorage.getItem("adaptation_start_date");
  if (!startDateStr) return 1;
  
  const startDate = new Date(startDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.min(diffDays, 7);
}

function isAdaptationComplete(): boolean {
  return getAdaptationDay() > 7;
}

export default function HomeAdaptationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [adaptationDay, setAdaptationDay] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a complété l'onboarding
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (!onboardingCompleted) {
      // Rediriger vers le splash si pas d'onboarding
      router.push("/splash");
      return;
    }

    const day = getAdaptationDay();
    setAdaptationDay(day);
    setIsComplete(isAdaptationComplete());
  }, [router]);

  const handleSkane = () => {
    router.push("/skane");
  };

  const handleGuestMode = () => {
    sessionStorage.setItem("skane_guest_mode", "true");
    localStorage.setItem("guestMode", "true");
    router.push("/skane");
  };

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-8 text-center"
      >
      </motion.header>

      {/* Contenu principal centré */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24">
        {/* Message d'adaptation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {!isComplete ? (
            <>
              <p className="text-nokta-one-white text-lg font-medium mb-2">
                {t("homeAdaptation.inProgress", { day: adaptationDay })}
              </p>
              <p className="text-gray-400 text-sm">
                {t("homeAdaptation.improvesPrecision")}
              </p>
            </>
          ) : (
            <>
              <p className="text-green-400 text-lg font-medium mb-2">
                {t("homeAdaptation.complete")}
              </p>
              <p className="text-gray-400 text-sm">
                {t("homeAdaptation.calibrated")}
              </p>
            </>
          )}
        </motion.div>

        {/* Timeline visuelle des 7 jours */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-16"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{
                background: day <= adaptationDay 
                  ? day === adaptationDay 
                    ? "rgba(59, 130, 246, 0.3)" 
                    : "rgba(16, 185, 129, 0.3)"
                  : "rgba(255, 255, 255, 0.05)",
                border: day <= adaptationDay 
                  ? day === adaptationDay 
                    ? "2px solid #3B82F6" 
                    : "2px solid #10B981"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                color: day <= adaptationDay 
                  ? day === adaptationDay 
                    ? "#3B82F6" 
                    : "#10B981"
                  : "#4B5563",
              }}
            >
              {day < adaptationDay ? "✓" : day}
            </div>
          ))}
        </motion.div>

        {/* Bouton SKANE central */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          onClick={handleSkane}
          className="w-40 h-40 rounded-full flex items-center justify-center text-xl font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
            boxShadow: "0 8px 40px rgba(59, 130, 246, 0.4)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t("home.pressToSkane")}
        </motion.button>

        {/* Mode invité - Icône seulement */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleGuestMode}
          className="mt-8 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={t("skane.guestModeEnabled")}
        >
          <User size={20} className="text-gray-400" />
        </motion.button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="home" />
    </main>
  );
}
