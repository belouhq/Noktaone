"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { X } from "lucide-react";

/**
 * ONBOARDING - Étape : Proposition de continuation
 * Dernier code reçu : framer-motion + i18n
 */
export default function OnboardingContinuePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleContinue = () => {
    router.push("/onboarding/adaptation");
  };

  const handleLater = () => {
    sessionStorage.setItem("onboarding_skipped", "true");
    router.push("/");
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-between px-8 py-16">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        style={{
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Retour à l'accueil"
      >
        <X size={20} className="text-white/70" />
      </motion.button>

      <div className="pt-8" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-sm"
      >
        <h1 className="text-2xl font-semibold text-nokta-one-white leading-relaxed mb-6">
          {t("onboarding.continue.title")}
        </h1>
        <p className="text-gray-400 text-base">
          {t("onboarding.continue.subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center gap-4"
      >
        <motion.button
          onClick={handleContinue}
          className="w-full py-5 rounded-2xl text-lg font-semibold text-white"
          style={{
            background: "#3B82F6",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("onboarding.continue.continue")}
        </motion.button>

        <motion.button
          onClick={handleLater}
          className="text-sm text-gray-500 py-2"
          whileTap={{ scale: 0.95 }}
        >
          {t("onboarding.continue.later")}
        </motion.button>
      </motion.div>
    </main>
  );
}
