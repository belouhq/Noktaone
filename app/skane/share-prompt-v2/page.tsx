"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * SHARE PROMPT V2 - Moment Social Optimisé
 * 
 * CONDITION D'AFFICHAGE :
 * ❗ UNIQUEMENT si feedback = 🙂 "Mieux"
 * 
 * CONTENU :
 * - Texte : "Tu veux partager ton reset ?"
 * - Sous-texte : "Avant / après — sans données personnelles."
 * - CTA principal : "Partager"
 * - CTA secondaire discret : "Plus tard"
 */

export default function SharePromptV2() {
  const router = useRouter();
  const { t } = useTranslation();
  const [canShow, setCanShow] = useState(false);

  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  useEffect(() => {
    // Vérifier que le feedback était positif
    const feedback = sessionStorage.getItem("skane_feedback");
    
    if (feedback !== "better") {
      // Pas de share si feedback pas positif → retour home
      router.push("/");
      return;
    }
    
    setCanShow(true);
  }, [router]);

  const handleShare = () => {
    router.push("/skane/share-v2");
  };

  const handleLater = () => {
    // Transition douce vers home
    router.push("/");
  };

  if (!canShow) {
    return (
      <main className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center px-8">
      {/* Icône de partage stylisée */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="mb-10"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            border: "2px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          <span className="text-4xl">🔥</span>
        </div>
      </motion.div>

      {/* Question principale */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-semibold text-white text-center mb-4"
      >
        {getTranslation("share.shareYourReset", "Tu veux partager ton reset ?")}
      </motion.h1>

      {/* Sous-texte rassurant */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 text-center mb-12 max-w-xs"
      >
        {getTranslation(
          "share.beforeAfterNoPersonalData",
          "Avant / après — sans données personnelles."
        )}
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center gap-4"
      >
        {/* CTA Principal - Partager */}
        <motion.button
          onClick={handleShare}
          className="w-full py-5 rounded-2xl text-lg font-semibold text-white"
          style={{
            background: "#3B82F6",
            boxShadow: "0 4px 30px rgba(59, 130, 246, 0.4)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {getTranslation("share.share", "Partager")}
        </motion.button>

        {/* CTA Secondaire - Plus tard (discret) */}
        <motion.button
          onClick={handleLater}
          className="text-gray-500 text-sm py-2"
          whileTap={{ scale: 0.95 }}
        >
          {getTranslation("share.later", "Plus tard")}
        </motion.button>
      </motion.div>
    </main>
  );
}
