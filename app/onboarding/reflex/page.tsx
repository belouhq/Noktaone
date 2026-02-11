"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { X, Sparkles } from "lucide-react";

/**
 * ONBOARDING - Dernière étape : réflexe Nokta
 * Dernier code reçu : framer-motion + i18n
 */
export default function OnboardingReflexPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleNextSkane = () => {
    localStorage.setItem("onboarding_completed", "true");
    localStorage.setItem("adaptation_start_date", new Date().toISOString());
    localStorage.setItem("adaptation_day", "1");
    router.push("/skane");
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    localStorage.setItem("adaptation_start_date", new Date().toISOString());
    localStorage.setItem("adaptation_day", "1");
    router.push("/");
  };

  const handleBack = () => {
    router.push("/onboarding/adaptation");
  };

  return (
    <main className="fixed inset-0 bg-black flex flex-col px-6 py-safe">
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
          aria-label="Retour"
        >
          <X size={20} className="text-white/70" />
        </motion.button>

        <div className="flex gap-2">
          <div className="w-8 h-1 rounded-full bg-cyan-500" />
          <div className="w-8 h-1 rounded-full bg-cyan-500" />
        </div>

        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)",
              border: "2px solid rgba(6, 182, 212, 0.3)",
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles size={36} className="text-cyan-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white leading-tight mb-6">
            {t("onboarding.reflex.title")}
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            {t("onboarding.reflex.subtitle")}
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-cyan-400 font-medium"
          >
            → {t("onboarding.reflex.noktaIsHere")}
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="py-6 space-y-3"
      >
        <motion.button
          onClick={handleNextSkane}
          className="w-full py-4 rounded-2xl text-lg font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
            boxShadow: "0 4px 24px rgba(6, 182, 212, 0.5)",
          }}
          whileHover={{ scale: 1.02, boxShadow: "0 6px 30px rgba(6, 182, 212, 0.6)" }}
          whileTap={{ scale: 0.98 }}
        >
          {t("onboarding.reflex.nextSkane")}
        </motion.button>

        <motion.button
          onClick={handleSkip}
          className="w-full py-3 text-white/40 text-sm hover:text-white/60 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          {t("onboarding.reflex.skip")}
        </motion.button>
      </motion.div>
    </main>
  );
}
