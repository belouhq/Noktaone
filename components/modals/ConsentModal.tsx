"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ isOpen, onAccept, onDecline }: ConsentModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - non-dismissible (user must choose) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            style={{ zIndex: 60 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 61 }}
          >
            <div
              className="relative w-full max-w-[400px] rounded-3xl p-8"
              style={{
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Contenu */}
              <div className="text-nokta-one-white" style={{ lineHeight: 1.6 }}>
                <h2 className="text-lg font-semibold text-nokta-one-white mb-4">
                  {t("consent.title")}
                </h2>
                <ul className="list-none space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("consent.point1")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("consent.point2")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("consent.point3")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("consent.point4")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("consent.point5")}</span>
                  </li>
                </ul>
                <p className="text-sm text-white/70 mb-6">
                  {t("consent.disclaimer")}
                </p>

                {/* Boutons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={onDecline}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {t("consent.decline")}
                  </motion.button>
                  <motion.button
                    onClick={onAccept}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium"
                    style={{
                      background: "#3B82F6",
                      border: "1px solid rgba(59, 130, 246, 0.5)",
                      color: "white",
                    }}
                  >
                    {t("consent.accept")}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
