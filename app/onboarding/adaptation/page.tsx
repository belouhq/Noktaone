"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { X, User, Users, Zap } from "lucide-react";

/**
 * ONBOARDING - Adaptation (7 jours) + bonnes pratiques
 * Dernier code reçu : framer-motion + i18n
 */
export default function OnboardingAdaptationPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleContinue = () => {
    router.push("/onboarding/reflex");
  };

  const handleBack = () => {
    router.push("/");
  };

  const practices = [
    { icon: User, textKey: "practice1", color: "#3B82F6" },
    { icon: Users, textKey: "practice2", color: "#8B5CF6" },
    { icon: Zap, textKey: "practice3", color: "#10B981" },
  ];

  return (
    <main className="fixed inset-0 bg-black flex flex-col px-6 py-safe overflow-y-auto">
      <div className="flex items-center justify-between py-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleBack}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          style={{
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          whileTap={{ scale: 0.9 }}
          aria-label="Retour à l'accueil"
        >
          <X size={20} className="text-white/70" />
        </motion.button>

        <div className="flex gap-2">
          <div className="w-8 h-1 rounded-full bg-cyan-500" />
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col justify-center py-8 max-w-sm mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-semibold text-white mb-4 text-center">
            {t("onboarding.adaptation.title")}
          </h1>
          <p className="text-white/70 text-center text-sm leading-relaxed mb-6">
            {t("onboarding.adaptation.description", { days: 7 })}
          </p>

          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                style={{
                  background: day === 1 ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  border: day === 1 ? "2px solid #06b6d4" : "1px solid rgba(255, 255, 255, 0.1)",
                  color: day === 1 ? "#06b6d4" : "rgba(255, 255, 255, 0.4)",
                }}
              >
                {day}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="w-full h-px bg-white/10 my-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-medium text-white/90 mb-4 text-center">
            {t("onboarding.bestPractices.title")}
          </h2>
          <div className="space-y-3">
            {practices.map((practice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${practice.color}15`,
                    border: `1px solid ${practice.color}30`,
                  }}
                >
                  <practice.icon size={16} style={{ color: practice.color }} />
                </div>
                <p className="text-white/80 text-sm leading-snug">
                  {t(`onboarding.bestPractices.${practice.textKey}`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="py-6"
      >
        <motion.button
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl text-lg font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
            boxShadow: "0 4px 20px rgba(6, 182, 212, 0.4)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("onboarding.bestPractices.understood")}
        </motion.button>
      </motion.div>
    </main>
  );
}
