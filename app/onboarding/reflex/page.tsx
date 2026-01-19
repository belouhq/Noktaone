"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * ONBOARDING - Étape 10 : Ancrage du réflexe
 * 
 * Titre : "Quand ton corps est off, skane."
 * Sous-texte : "Stress, fatigue, surcharge mentale, avant un moment important → Nokta est là."
 * 
 * CTA : "Faire mon prochain skane"
 * 
 * C'est LA phrase à ancrer dans la tête de l'utilisateur.
 */
export default function OnboardingReflexPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleNextSkane = () => {
    // Marquer l'onboarding comme terminé
    localStorage.setItem("onboarding_completed", "true");
    localStorage.setItem("adaptation_start_date", new Date().toISOString());
    localStorage.setItem("adaptation_day", "1");
    
    // Aller à la home en mode adaptation
    router.push("/");
  };

  const handleSkip = () => {
    // Permettre de sortir de l'onboarding sans le marquer comme terminé
    router.push("/");
  };

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-between px-8 py-16">
      {/* Espace haut */}
      <div className="pt-8" />

      {/* Centre - Message clé */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-sm"
      >
        {/* Titre - LE message à ancrer */}
        <motion.h1
          className="text-3xl font-bold text-nokta-one-white leading-tight mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {t("onboarding.reflex.title")}
        </motion.h1>
        
        {/* Sous-texte avec contextes */}
        <motion.p
          className="text-gray-400 text-base leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {t("onboarding.reflex.subtitle")}
          <br />
          <span className="text-nokta-one-blue">→ {t("onboarding.reflex.noktaIsHere")}</span>
        </motion.p>

        {/* Animation subtile - cercle pulsant */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex justify-center"
        >
          <motion.div
            className="w-16 h-16 rounded-full"
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "2px solid rgba(59, 130, 246, 0.3)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Bas - CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center gap-4"
      >
        {/* CTA Principal */}
        <motion.button
          onClick={handleNextSkane}
          className="w-full py-5 rounded-2xl text-lg font-semibold text-white"
          style={{
            background: "#3B82F6",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("onboarding.reflex.nextSkane")}
        </motion.button>

        {/* Bouton de sortie - Discret */}
        <motion.button
          onClick={handleSkip}
          className="text-sm text-gray-500 py-2 px-4"
          whileTap={{ scale: 0.95 }}
        >
          {t("onboarding.reflex.skip")}
        </motion.button>
      </motion.div>
    </main>
  );
}
