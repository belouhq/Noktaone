"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * ONBOARDING - Étape 8 : Introduction de la phase d'adaptation
 * 
 * Titre : "Nokta s'adapte à ton corps."
 * Texte : "Pendant 7 jours, Nokta ajuste ses recommandations..."
 * 
 * CTA unique : "D'accord"
 */
export default function OnboardingAdaptationPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleAccept = () => {
    router.push("/onboarding/best-practices");
  };

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-between px-8 py-16">
      {/* Espace haut */}
      <div className="pt-8" />

      {/* Centre - Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-sm"
      >
        {/* Titre */}
        <h1 className="text-2xl font-semibold text-nokta-one-white mb-8">
          {t("onboarding.adaptation.title")}
        </h1>
        
        {/* Texte explicatif (max 3 lignes) */}
        <div className="text-gray-300 text-base leading-relaxed space-y-2">
          <p>
            {t("onboarding.adaptation.description", { days: 7 })}
          </p>
          <p className="text-gray-400">
            {t("onboarding.adaptation.noAction")}
          </p>
        </div>

        {/* Timeline visuelle simple */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-2"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: day === 1 
                    ? "rgba(59, 130, 246, 0.3)" 
                    : "rgba(255, 255, 255, 0.1)",
                  border: day === 1 
                    ? "2px solid #3B82F6" 
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  color: day === 1 ? "#3B82F6" : "#6B7280",
                }}
              >
                {day}
              </div>
            </div>
          ))}
        </motion.div>
        
        <p className="text-xs text-gray-500 mt-3">
          {t("onboarding.adaptation.timeline")}
        </p>
      </motion.div>

      {/* Bas - CTA unique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <motion.button
          onClick={handleAccept}
          className="w-full py-5 rounded-2xl text-lg font-semibold text-white"
          style={{
            background: "#3B82F6",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("onboarding.adaptation.accept")}
        </motion.button>
      </motion.div>
    </main>
  );
}
