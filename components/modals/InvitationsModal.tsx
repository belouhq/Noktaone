"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Ticket, Info } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface InvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationsCount: number;
  referralCode: string;
}

export default function InvitationsModal({
  isOpen,
  onClose,
  invitationsCount,
  referralCode,
}: InvitationsModalProps) {
  const { t } = useTranslation();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyInviteLink = async () => {
    const inviteLink = `https://noktaone.app/invite?code=${referralCode}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-[400px] rounded-3xl p-6"
              style={{
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-nokta-one-white" />
              </button>

              {/* Contenu */}
              <div className="text-nokta-one-white">
                {/* Titre */}
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus size={20} className="text-nokta-one-white" />
                  <h2 className="text-lg font-semibold text-nokta-one-white">
                    {t("settings.invitations")}
                  </h2>
                </div>

                {/* Nombre d'invitations */}
                <div className="flex items-center gap-2 mb-4">
                  <Ticket size={24} className="text-nokta-one-blue" />
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "#3B82F6" }}
                  >
                    {invitationsCount} {t("settings.invitations")}
                  </span>
                </div>

                {/* Texte explicatif */}
                <p className="text-sm text-gray-400 mb-4">
                  {t("settings.inviteDescription")}
                </p>

                {/* Bouton Copier le lien */}
                <motion.button
                  onClick={handleCopyInviteLink}
                  className="w-full py-3 rounded-xl text-nokta-one-white font-medium mb-4"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {linkCopied ? t("settings.linkCopied") : t("settings.copyInviteLink")}
                </motion.button>

                {/* Info bulle */}
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-gray-500" />
                  <p className="text-xs text-gray-500">
                    {t("settings.earnInvitation")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
