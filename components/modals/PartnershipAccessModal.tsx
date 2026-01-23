"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, AlertCircle, Check } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PartnershipAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PartnershipAccessModal({
  isOpen,
  onClose,
  onSuccess,
}: PartnershipAccessModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError("Code requis");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/affiliate/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Stocker l'accès validé dans sessionStorage
        sessionStorage.setItem("partnership_access_granted", "true");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setError(data.error || "Code incorrect");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isVerifying) {
      handleVerify();
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-3xl overflow-hidden relative"
              style={{
                background: "linear-gradient(180deg, rgba(20, 20, 25, 0.98) 0%, rgba(10, 10, 15, 0.99) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X size={18} className="text-gray-400" />
              </button>

              {/* Content */}
              <div className="p-6 pt-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    <Lock size={28} className="text-purple-400" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-white text-center mb-2">
                  {t("partnership.accessTitle") || "Accès Partenariats"}
                </h2>
                <p className="text-sm text-gray-400 text-center mb-6">
                  {t("partnership.accessDescription") || "Entrez votre code d'accès pour accéder au panneau de gestion des partenariats."}
                </p>

                {/* Success state */}
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check size={24} className="text-green-400" />
                    </div>
                    <p className="text-white font-medium">
                      {t("partnership.accessGranted") || "Accès autorisé"}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Code input */}
                    <div className="mb-4">
                      <label className="block text-xs text-gray-400 mb-2">
                        {t("partnership.codeLabel") || "Code d'accès"}
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setError(null);
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder={t("partnership.codePlaceholder") || "Entrez le code"}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-white text-center font-mono tracking-widest"
                        autoFocus
                        disabled={isVerifying}
                      />
                    </div>

                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl mb-4"
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        <AlertCircle size={16} className="text-red-400" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </motion.div>
                    )}

                    {/* Verify button */}
                    <motion.button
                      onClick={handleVerify}
                      disabled={isVerifying || !code.trim()}
                      className="w-full py-4 rounded-2xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: isVerifying || !code.trim()
                          ? "rgba(139, 92, 246, 0.3)"
                          : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                        boxShadow: isVerifying || !code.trim()
                          ? "none"
                          : "0 4px 20px rgba(139, 92, 246, 0.3)",
                      }}
                      whileHover={!isVerifying && code.trim() ? { scale: 1.02 } : {}}
                      whileTap={!isVerifying && code.trim() ? { scale: 0.98 } : {}}
                    >
                      {isVerifying ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t("partnership.verifying") || "Vérification..."}
                        </span>
                      ) : (
                        t("partnership.verify") || "Vérifier"
                      )}
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
