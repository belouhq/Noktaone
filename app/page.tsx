"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useLastSkane } from "@/lib/hooks/useLastSkane";
import { BottomNav } from "@/components/ui/BottomNav";
import SkaneButton from "@/components/ui/SkaneButton";
import DotsPattern from "@/components/ui/DotsPattern";

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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Pattern de points en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none">
        <DotsPattern />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen px-6 pt-12 pb-24">
        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-light tracking-[0.3em] text-center mb-12"
        >
          NOKTA ONE
        </motion.h1>

        {/* Section Last Skane - Visually subordinate to CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
          style={{ opacity: 0.7 }} // Reduced opacity to not compete with CTA
        >
          <h2 
            className="text-sm font-medium mb-2"
            style={{ opacity: 0.65 }} // Smaller, quieter typography
          >
            {(() => {
              const translated = t("home.lastSkaneTitle");
              return translated !== "home.lastSkaneTitle" ? translated : "Last skane";
            })()}
          </h2>

          {isLoading ? (
            // Loading state (skeleton)
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
            </div>
          ) : (
            // Display based on state machine
            <div className="flex items-center gap-2">
              {lastSkane.emoji && (
                <span 
                  className="text-base"
                  style={{ fontSize: '0.8em' }} // Emoji subordinate to text
                >
                  {lastSkane.emoji}
                </span>
              )}
              <span 
                className="text-white/70 text-sm"
                style={{ opacity: 0.75 }}
              >
                {lastSkane.timeLabel}
              </span>
            </div>
          )}
        </motion.div>

        {/* Bouton Skane - Position neuro-ergonomique optimale */}
        {/* Position : X: 50%, Y: 68% (zone instinctive absolue) */}
        {/* Zone de respiration : 16mm minimum autour (aucun autre CTA concurrent) */}
        <div 
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: '68vh', // Zone instinctive absolue (55-75%, sweet spot 68%)
            // Zone de respiration : 16mm minimum autour (≈1rem)
            padding: '1rem',
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
