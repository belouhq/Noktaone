"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useLastSkane } from "@/lib/hooks/useLastSkane";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { BottomNav } from "@/components/ui/BottomNav";
import SkaneButton from "@/components/ui/SkaneButton";
import DotsPattern from "@/components/ui/DotsPattern";
import Logo from "@/components/Logo";

function getAdaptationDay(): number {
  if (typeof window === 'undefined') return 0;
  const startDateStr = localStorage.getItem("adaptation_start_date");
  if (!startDateStr) return 0;
  
  const startDate = new Date(startDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.min(diffDays, 7);
}

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lastSkane, isLoading } = useLastSkane();

  // Rediriger vers home-adaptation si en mode adaptation (jours 1-7)
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (onboardingCompleted) {
      const day = getAdaptationDay();
      if (day > 0 && day <= 7) {
        router.push("/home-adaptation");
        return;
      }
    }
  }, [router]);

  const handlePressSkane = () => {
    router.push("/skane");
  };

  // Swipe gestures pour naviguer entre les pages
  const swipeRef = useSwipe({
    onSwipeLeft: () => {
      // Swipe vers la gauche = aller vers Skane
      router.push("/skane");
    },
    onSwipeRight: () => {
      // Swipe vers la droite = aller vers Settings
      router.push("/settings");
    },
    threshold: 50, // Distance minimale de 50px
    velocityThreshold: 0.3, // Vitesse minimale
  });

  return (
    <div 
      ref={swipeRef}
      className="min-h-screen bg-black text-white relative overflow-hidden"
    >
      {/* Pattern de points en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none">
        <DotsPattern />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen px-6 pt-4 pb-24">
        {/* Logo - Réduit de 80% et remonté */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <Logo 
            variant="text" 
            width={40} 
            height={8}
            className="w-auto h-auto"
            style={{ maxWidth: '40px', maxHeight: '8px' }}
          />
        </motion.div>

        {/* Section Last Skane - Informations complètes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center mb-12"
        >
          <h2 
            className="text-sm font-medium mb-3 text-white/80"
          >
            {(() => {
              const translated = t("home.lastSkaneTitle");
              return translated !== "home.lastSkaneTitle" ? translated : "Dernier skane";
            })()}
          </h2>

          {isLoading ? (
            // Loading state (skeleton)
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          ) : (
            // Display based on state machine - Informations complètes
            <div className="flex flex-col items-center gap-2">
              {lastSkane.emoji && (
                <span 
                  className="text-2xl"
                  role="img"
                  aria-label="Feedback emoji"
                >
                  {lastSkane.emoji}
                </span>
              )}
              <span 
                className="text-white/90 text-base font-medium"
              >
                {lastSkane.timeLabel}
              </span>
            </div>
          )}
        </motion.div>

        {/* Bouton Skane - En bas, centré, à la hauteur d'un pouce (≈120px) */}
        <div 
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: '120px', // Hauteur d'un pouce depuis le bas
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <SkaneButton onClick={handlePressSkane} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="home" />
    </div>
  );
}
