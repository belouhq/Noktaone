"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * SPLASH SCREEN - Étape 1 du Flow V1 Définitif
 * 
 * - Logo Nokta
 * - Message unique : "Quand ton corps est off, skane."
 * - Auto-transition (aucun bouton)
 * - Durée : 2.5 secondes
 */
export default function SplashPage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Auto-transition après 2.5 secondes
    const timer = setTimeout(() => {
      router.push("/welcome");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-8">
      {/* Logo NOKTA */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-light tracking-[0.4em] text-nokta-one-white mb-16"
      >
        NOKTA
      </motion.h1>

      {/* Message central - LE réflexe à ancrer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-xl text-center text-nokta-one-white font-light italic"
        style={{
          maxWidth: "280px",
          lineHeight: 1.6,
        }}
      >
        {t("splash.tagline") || "Quand ton corps est off, skane."}
      </motion.p>

      {/* Indicateur de chargement subtil */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-12 flex gap-1"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </main>
  );
}
