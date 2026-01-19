"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * ONBOARDING - Étape 7 : Proposition de continuation
 * 
 * Texte : "Nokta fonctionne encore mieux quand il te connaît un peu."
 * Sous-texte : "Aucune donnée médicale. Juste ton ressenti."
 * 
 * CTA principal : "Continuer"
 * CTA secondaire discret : "Plus tard"
 */
export default function OnboardingContinuePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleContinue = () => {
    router.push("/onboarding/adaptation");
  };

  const handleLater = () => {
    // Retour à la home en mode "non connecté"
    sessionStorage.setItem("onboarding_skipped", "true");
    router.push("/");
  };

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-between px-8 py-16">
      {/* Espace haut */}
      <div className="pt-8" />

      {/* Centre - Message principal */}
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

      {/* Bas - CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center gap-4"
      >
        {/* CTA Principal */}
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

        {/* CTA Secondaire - Discret */}
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
