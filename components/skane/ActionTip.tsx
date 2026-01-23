"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface ActionTipProps {
  tip: string;
  tipKey?: string;
  onSkip: () => void;
  onContinue: () => void;
}

/**
 * Composant pour afficher un tip d'usage optionnel avant une micro-action
 * 
 * Règles strictes :
 * - Optionnel (skippable)
 * - 1 tip maximum par micro-action
 * - Actionnable immédiatement, sans expliquer "pourquoi"
 * - Jamais bloquant
 */
export default function ActionTip({
  tip,
  tipKey,
  onSkip,
  onContinue,
}: ActionTipProps) {
  const { t } = useTranslation();
  const displayTip = tipKey ? t(tipKey) || tip : tip;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onSkip} // Cliquer en dehors = skip
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="w-full max-w-md rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(180deg, rgba(20, 20, 25, 0.98) 0%, rgba(10, 10, 15, 0.99) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => e.stopPropagation()} // Empêcher la propagation du clic
        >
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            aria-label={t("common.close") || "Fermer"}
          >
            <X size={18} className="text-gray-400" />
          </button>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                }}
              >
                <Lightbulb size={24} className="text-yellow-400" />
              </div>
            </div>

            {/* Label */}
            <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider">
              {t("actions.tipLabel") || "Astuce (optionnelle)"}
            </p>

            {/* Tip text */}
            <p className="text-white text-center text-lg font-medium mb-6 leading-relaxed">
              {displayTip}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={onSkip}
                className="flex-1 py-3 rounded-xl text-white font-medium text-sm"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("actions.skipTip") || "Passer"}
              </motion.button>
              <motion.button
                onClick={onContinue}
                className="flex-1 py-3 rounded-xl text-white font-medium text-sm"
                style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("actions.continue") || "Continuer"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
