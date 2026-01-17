"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { t } = useTranslation();
  // État pour le nombre d'invitations (mock à 3 pour l'instant)
  // Plus tard : fetch depuis la DB ou localStorage
  const [invitationsCount] = useState(3);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 50 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-[400px] rounded-3xl p-8"
              style={{
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                zIndex: 51,
              }}
            >
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-nokta-one-white" />
              </button>

              {/* Contenu */}
              <div className="text-nokta-one-white" style={{ lineHeight: 1.6 }}>
                {/* Section 1 - QU'EST-CE QU'UN SKANE ? */}
                <h2 className="text-lg font-semibold text-nokta-one-white mb-4">
                  {t("info.whatIsSkane")}
                </h2>
                <p className="mb-2">
                  {t("info.skaneDescription")}
                </p>
                <ul className="list-none space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("info.skanePoint1")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("info.skanePoint2")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("info.skanePoint3")}</span>
                  </li>
                </ul>
                <p className="mb-8">
                  {t("info.noDiagnosis")}
                </p>

                {/* Séparateur */}
                <div
                  className="w-full h-px mb-8"
                  style={{ background: "rgba(255, 255, 255, 0.1)" }}
                />

                {/* Section 2 - MODE INVITÉ */}
                <h2 className="text-lg font-semibold text-nokta-one-white mb-4">
                  {t("info.guestMode")}
                </h2>
                <p className="mb-2">
                  {t("info.guestDescription")}
                </p>
                <ul className="list-none space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("info.guestPoint1")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("info.guestPoint2")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("info.guestPoint3")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-nokta-one-blue mr-2">•</span>
                    <span>{t("info.guestPoint4")}</span>
                  </li>
                </ul>
                <p className="mb-4">
                  {t("info.blueIconMeansGuest")}
                </p>
                <p
                  className="text-base font-semibold"
                  style={{ color: "#3B82F6" }}
                >
                  {t("info.invitationsAvailable")} : {invitationsCount}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
