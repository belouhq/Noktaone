"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useSkanes } from "@/lib/hooks/useSkanes";
import { BottomNav } from "@/components/ui/BottomNav";
import SkaneButton from "@/components/ui/SkaneButton";
import DotsPattern from "@/components/ui/DotsPattern";

// Emoji selon l'état
const STATE_EMOJI: Record<string, string> = {
  HIGH_ACTIVATION: "😰",
  LOW_ENERGY: "😴",
  REGULATED: "😊",
};

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuthContext();
  const {
    recentSkanes,
    loading: skanesLoading,
    canReset,
    hoursUntilReset,
  } = useSkanes();

  const handlePressSkane = () => {
    if (canReset) {
      router.push("/skane");
    }
  };

  const isLoading = authLoading || skanesLoading;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Pattern de points en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none">
        <DotsPattern />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-12 pb-24">
        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-light tracking-[0.3em] text-center mb-12"
        >
          NOKTA ONE
        </motion.h1>

        {/* Section Skanes récents */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">
            {t("home.recentSkane") || "Recente Skane"} :
          </h2>

          {isLoading ? (
            // Loading state
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentSkanes.length === 0 ? (
            // Pas de skanes
            <p className="text-gray-500 text-sm">
              {t("home.noSkaneYet") || "Aucun skane effectué pour le moment"}
            </p>
          ) : (
            // Liste des skanes récents
            <ul className="space-y-3">
              {recentSkanes.map((skane, index) => (
                <motion.li
                  key={skane.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">
                    {STATE_EMOJI[skane.internal_state] || "😊"}
                  </span>
                  <span className="text-white/80">{skane.timeLabel}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Message de cooldown ou statut */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-auto"
        >
          {!canReset && hoursUntilReset > 0 ? (
            <p className="text-gray-500 text-sm">
              {t("home.noResetAvailable", { hours: hoursUntilReset }) ||
                `No reset today for ${hoursUntilReset} hours`}
            </p>
          ) : recentSkanes.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {t("home.readyForFirstSkane") || "Ready for your first Skane!"}
            </p>
          ) : null}
        </motion.div>

        {/* Bouton Skane centré */}
        <div className="flex justify-center items-center py-12">
          <SkaneButton onClick={handlePressSkane} disabled={!canReset} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="home" />
    </div>
  );
}
