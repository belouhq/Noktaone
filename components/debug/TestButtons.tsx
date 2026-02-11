"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Home, UserX, Settings, X, ChevronDown } from "lucide-react";

/**
 * Composant de test/debug pour réinitialiser l'état utilisateur
 * Visible uniquement en mode développement ou avec un flag spécial
 */
const TEST_PANEL_Z = 9999;

export default function TestButtons() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Afficher seulement en développement ou si un flag est activé (après montage client)
  const shouldShow = mounted && (
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && localStorage.getItem("debug_mode") === "true")
  );

  if (!shouldShow) return null;

  const handleResetOnboarding = () => {
    localStorage.removeItem("onboarding_completed");
    localStorage.removeItem("adaptation_start_date");
    localStorage.removeItem("adaptation_day");
    sessionStorage.removeItem("onboarding_skipped");
    sessionStorage.removeItem("adaptation_exited");
    sessionStorage.removeItem("first_skane_flow");
    router.push("/");
  };

  const handleResetAdaptation = () => {
    localStorage.removeItem("adaptation_start_date");
    localStorage.removeItem("adaptation_day");
    sessionStorage.removeItem("adaptation_exited");
    router.push("/");
  };

  const handleResetAll = () => {
    // Réinitialiser tout l'état utilisateur
    localStorage.removeItem("onboarding_completed");
    localStorage.removeItem("adaptation_start_date");
    localStorage.removeItem("adaptation_day");
    localStorage.removeItem("user");
    localStorage.removeItem("guestMode");
    localStorage.removeItem("notificationsEnabled");
    localStorage.removeItem("selectedLanguage");
    localStorage.removeItem("nokta_user_id");
    localStorage.removeItem("nokta_referral_source");
    localStorage.removeItem("nokta_referral_timestamp");
    
    sessionStorage.clear();
    
    router.push("/");
  };

  /** Page d'accueil (landing) : WelcomeScreen avec "Mesure ton stress..." */
  const handleGoLanding = () => {
    sessionStorage.setItem("adaptation_exited", "true");
    router.push("/");
  };

  /** Accueil app : page Accueil V4 avec bouton Skane (après connexion / nav) */
  const handleGoHomeApp = () => {
    sessionStorage.setItem("adaptation_exited", "true");
    router.push("/home");
  };

  const handleToggleDebug = () => {
    const current = localStorage.getItem('debug_mode') === 'true';
    localStorage.setItem('debug_mode', (!current).toString());
    if (!current) {
      setIsOpen(true);
      setIsExpanded(true);
    }
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir/fermer */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          zIndex: TEST_PANEL_Z,
          background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
          boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Ouvrir les boutons de test"
      >
        {isOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <Settings size={20} className="text-white" />
        )}
      </motion.button>

      {/* Panel de boutons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 right-6 w-64 rounded-2xl p-4"
            style={{
              zIndex: TEST_PANEL_Z,
              background: "rgba(0, 0, 0, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold">🧪 Mode Test</h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronDown
                  size={16}
                  className="text-white/60 transition-transform"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
            </div>

            {/* Boutons principaux (toujours visibles) */}
            <div className="flex flex-col gap-2">
              <motion.button
                onClick={handleGoLanding}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium transition-colors"
                style={{
                  background: "rgba(59, 130, 246, 0.2)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
                whileHover={{ background: "rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Home size={18} />
                <span>Page d&apos;accueil (landing)</span>
              </motion.button>
              <motion.button
                onClick={handleGoHomeApp}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium transition-colors"
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
                whileHover={{ background: "rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Home size={18} />
                <span>Accueil app (Skane / nav)</span>
              </motion.button>

              {/* Boutons avancés (expandables) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-2"
                  >
                    <motion.button
                      onClick={handleResetOnboarding}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium transition-colors"
                      style={{
                        background: "rgba(139, 92, 246, 0.2)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                      }}
                      whileHover={{ background: "rgba(139, 92, 246, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RotateCcw size={18} />
                      <span>Reset Onboarding</span>
                    </motion.button>

                    <motion.button
                      onClick={handleResetAdaptation}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium transition-colors"
                      style={{
                        background: "rgba(16, 185, 129, 0.2)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                      whileHover={{ background: "rgba(16, 185, 129, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RotateCcw size={18} />
                      <span>Reset Adaptation</span>
                    </motion.button>

                    <motion.button
                      onClick={handleResetAll}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium transition-colors"
                      style={{
                        background: "rgba(239, 68, 68, 0.2)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                      whileHover={{ background: "rgba(239, 68, 68, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <UserX size={18} />
                      <span>Reset Tout (Nouvel User)</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info */}
            <p className="text-white/40 text-xs mt-3 text-center">
              Mode développement
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
