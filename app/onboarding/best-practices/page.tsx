"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Users, Zap, X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * ONBOARDING - Étape 9 : Bonnes pratiques (positives)
 * 
 * Titre : "Pour de meilleurs résultats"
 * 
 * Règles (max 3, formulation POSITIVE) :
 * 1. Skane uniquement ton visage
 * 2. Utilise le mode invité pour quelqu'un d'autre
 * 3. Skane quand tu te sens vraiment off
 * 
 * CTA : "Compris"
 * 
 * Aucune formulation négative.
 */
export default function OnboardingBestPracticesPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleUnderstood = () => {
    router.push("/onboarding/reflex");
  };

  const handleBack = () => {
    // Retour à la page d'accueil normale
    router.push("/");
  };

  const practices = [
    {
      icon: User,
      textKey: "practice1",
      color: "#3B82F6",
    },
    {
      icon: Users,
      textKey: "practice2",
      color: "#8B5CF6",
    },
    {
      icon: Zap,
      textKey: "practice3",
      color: "#10B981",
    },
  ];

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-between px-8 py-16">
      {/* Bouton retour en haut à gauche */}
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

      {/* Espace haut */}
      <div className="pt-8" />

      {/* Centre - Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center w-full max-w-sm"
      >
        {/* Titre */}
        <h1 className="text-2xl font-semibold text-nokta-one-white mb-10">
          {t("onboarding.bestPractices.title")}
        </h1>
        
        {/* Liste des bonnes pratiques */}
        <div className="space-y-4">
          {practices.map((practice, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.15 }}
              className="flex items-center gap-4 p-4 rounded-xl text-left"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${practice.color}15`,
                  border: `1px solid ${practice.color}30`,
                }}
              >
                <practice.icon size={18} style={{ color: practice.color }} />
              </div>
              <p className="text-nokta-one-white text-sm leading-snug">
                {t(`onboarding.bestPractices.${practice.textKey}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bas - CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <motion.button
          onClick={handleUnderstood}
          className="w-full py-5 rounded-2xl text-lg font-semibold text-white"
          style={{
            background: "#3B82F6",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
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
