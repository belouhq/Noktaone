"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * RESULT SCREEN (FIRST SKANE) - Étape 4 du Flow V1 Définitif
 * 
 * RÈGLES STRICTES :
 * - Aucun chiffre
 * - Aucun score
 * - Aucune comparaison
 * - Texte universel pour les 3 états
 * - CTA UNIQUE : "Reset maintenant (20s)"
 * - PAS de bouton "non"
 * 
 * Ce screen est utilisé UNIQUEMENT pour le premier skane (avant inscription)
 */

// Les 2 micro-actions avec le meilleur ressenti (aléatoire 50/50)
const TOP_ACTIONS = [
  {
    id: "physiological_sigh",
    name: "Physiological Sigh",
    duration: 20, // Réduit à 20s comme demandé
    ressentiBased: 92,
  },
  {
    id: "box_breathing", 
    name: "Box Breathing",
    duration: 20, // Réduit à 20s comme demandé
    ressentiBased: 89,
  },
];

// Sélection aléatoire pour éviter "tout le monde a eu le même résultat"
function selectRandomTopAction() {
  const randomIndex = Math.random() < 0.5 ? 0 : 1;
  return TOP_ACTIONS[randomIndex];
}

export default function FirstSkaneResultPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<typeof TOP_ACTIONS[0] | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    // Sélectionner l'action aléatoirement au montage
    const action = selectRandomTopAction();
    setSelectedAction(action);
    
    // Stocker dans sessionStorage pour la page action
    sessionStorage.setItem("first_skane_action", JSON.stringify(action));

    // Récupérer l'image capturée
    const image = sessionStorage.getItem("skane_captured_image");
    if (image) {
      setCapturedImage(image);
    }
  }, []);

  const handleReset = () => {
    if (!selectedAction) return;
    
    // Passer à la micro-action
    router.push("/skane/first-action");
  };

  if (!selectedAction) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nokta-one-blue border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-black">
      {/* Image de fond (capturée) - effet subtil */}
      {capturedImage && (
        <div className="absolute inset-0">
          <img
            src={`data:image/jpeg;base64,${capturedImage}`}
            alt=""
            className="w-full h-full object-cover opacity-30"
            style={{ filter: "blur(20px)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>
      )}

      {/* Contenu centré */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        
        {/* Icône subtile - pas de check, juste un cercle pulsant */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-10"
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(59, 130, 246, 0.15)",
              border: "2px solid rgba(59, 130, 246, 0.4)",
            }}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.4)",
                "0 0 0 20px rgba(59, 130, 246, 0)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-nokta-one-blue" />
          </motion.div>
        </motion.div>

        {/* Message principal - UNIVERSEL pour les 3 états */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-white text-center mb-4"
        >
          {t("firstSkaneResult.title")}
        </motion.h1>

        {/* Sous-texte */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-center mb-16"
        >
          {t("firstSkaneResult.subtitle")}
        </motion.p>

        {/* CTA UNIQUE - Plein écran, bas */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleReset}
          className="w-full max-w-sm py-5 rounded-2xl text-lg font-semibold text-white"
          style={{
            background: "#3B82F6",
            boxShadow: "0 4px 30px rgba(59, 130, 246, 0.5)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("firstSkaneResult.resetNow", { duration: selectedAction.duration })}
        </motion.button>

        {/* PAS de bouton "non" - PAS d'alternative */}
      </div>

      {/* Disclaimer très discret */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-gray-600">
          {t("skane.disclaimer")}
        </p>
      </div>
    </main>
  );
}
