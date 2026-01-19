"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import Logo from "@/components/Logo";

/**
 * WELCOME SCREEN - Étape 2 du Flow V1 Définitif
 * 
 * - Texte : "Découvre l'état de ton corps en quelques secondes."
 * - CTA principal : "Commencer"
 * - CTA secondaire discret : "Déjà un compte"
 * - Aucun autre élément
 */
export default function WelcomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleStart = () => {
    // Marquer comme première utilisation
    sessionStorage.setItem("first_skane_flow", "true");
    router.push("/skane");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-between px-8 py-16">
      {/* Espace haut - Logo discret */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-8"
      >
        <Logo variant="icon" className="h-8 w-auto opacity-60" />
      </motion.div>

      {/* Centre - Message principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center"
      >
        <h2 
          className="text-2xl font-medium text-nokta-one-white leading-relaxed"
          style={{ maxWidth: "300px" }}
        >
          {t("welcome.message")}
        </h2>
      </motion.div>

      {/* Bas - CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center gap-4"
      >
        {/* CTA Principal - Plein écran, bas */}
        <motion.button
          onClick={handleStart}
          className="glass-button-primary w-full py-5 text-lg font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("welcome.start")}
        </motion.button>

        {/* CTA Secondaire - Discret */}
        <motion.button
          onClick={handleLogin}
          className="text-sm text-gray-500 py-2"
          whileTap={{ scale: 0.95 }}
        >
          {t("welcome.alreadyAccount")}
        </motion.button>
      </motion.div>
    </main>
  );
}
