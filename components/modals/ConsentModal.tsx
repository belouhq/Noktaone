"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronDown, ChevronUp, ExternalLink, Check } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { CONSENT_VERSION } from "@/lib/hooks/useConsent";

export interface ConsentState {
  privacy: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: (consents: ConsentState) => void;
  onAcceptAll: (consents: ConsentState) => void;
}

export default function ConsentModal({ isOpen, onAccept, onAcceptAll }: ConsentModalProps) {
  const { t } = useTranslation();
  
  const [consents, setConsents] = useState<ConsentState>({
    privacy: false,
    analytics: true,    // Pré-coché par défaut (opt-out)
    marketing: false,   // Non coché par défaut (opt-in)
    version: CONSENT_VERSION,
    timestamp: "",
  });
  
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrivacyToggle = () => {
    setConsents(prev => ({ ...prev, privacy: !prev.privacy }));
    setError(null);
  };

  const handleAnalyticsToggle = () => {
    setConsents(prev => ({ ...prev, analytics: !prev.analytics }));
  };

  const handleMarketingToggle = () => {
    setConsents(prev => ({ ...prev, marketing: !prev.marketing }));
  };

  const handleAcceptAll = () => {
    const finalConsents: ConsentState = {
      privacy: true,
      analytics: true,
      marketing: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    onAcceptAll(finalConsents);
  };

  const handleAcceptSelected = () => {
    if (!consents.privacy) {
      setError(t("consent.privacyRequired") || "Privacy consent is required");
      return;
    }
    
    const finalConsents: ConsentState = {
      ...consents,
      timestamp: new Date().toISOString(),
    };
    onAccept(finalConsents);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - pas de fermeture au clic (obligatoire) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            style={{ zIndex: 100 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 101 }}
          >
            <div
              className="relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-3xl p-6"
              style={{
                background: "linear-gradient(145deg, rgba(20, 20, 25, 0.98), rgba(10, 10, 15, 0.99))",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              }}
            >
              {/* Header avec icône */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <Shield size={32} className="text-blue-500" />
                </motion.div>
                
                <h2 className="text-xl font-semibold text-white text-center">
                  {t("consent.modal.title") || t("consent.title")}
                </h2>
                <p className="text-sm text-gray-400 text-center mt-2">
                  {t("consent.modal.description") || t("consent.subtitle")}
                </p>
              </div>

              {/* Consentement Privacy (Obligatoire) */}
              <div
                className="p-4 rounded-xl mb-3"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: error ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={handlePrivacyToggle}
                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      consents.privacy 
                        ? "bg-blue-500" 
                        : "bg-transparent border-2 border-gray-500"
                    }`}
                  >
                    {consents.privacy && <Check size={14} className="text-white" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {t("consent.modal.privacy.title") || t("consent.privacyTitle")}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        {t("consent.required") || "*"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t("consent.modal.privacy.description") || t("consent.privacyDescription")}
                    </p>
                    <a
                      href="/privacy"
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 mt-2 hover:underline"
                    >
                      {t("consent.readPolicy") || t("consent.modal.privacyLink")}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                {error && (
                  <p className="text-xs text-red-400 mt-2 ml-9">{error}</p>
                )}
              </div>

              {/* Toggle pour voir les options détaillées */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-3 rounded-xl mb-3 transition-colors hover:bg-white/5"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <span className="text-sm text-gray-300">
                  {t("consent.managePreferences") || t("consent.modal.managePreferences")}
                </span>
                {showDetails ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>

              {/* Options détaillées */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {/* Analytics */}
                    <div
                      className="p-4 rounded-xl mb-3"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={handleAnalyticsToggle}
                          className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            consents.analytics 
                              ? "bg-blue-500" 
                              : "bg-transparent border-2 border-gray-500"
                          }`}
                        >
                          {consents.analytics && <Check size={14} className="text-white" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              {t("consent.modal.analytics.title") || t("consent.analyticsTitle")}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                              {t("consent.optional") || "Optional"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {t("consent.modal.analytics.description") || t("consent.analyticsDescription")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Marketing */}
                    <div
                      className="p-4 rounded-xl mb-3"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={handleMarketingToggle}
                          className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            consents.marketing 
                              ? "bg-blue-500" 
                              : "bg-transparent border-2 border-gray-500"
                          }`}
                        >
                          {consents.marketing && <Check size={14} className="text-white" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              {t("consent.modal.marketing.title") || t("consent.marketingTitle")}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                              {t("consent.optional") || "Optional"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {t("consent.modal.marketing.description") || t("consent.marketingDescription")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mention CCPA pour les US */}
              <p className="text-xs text-gray-500 text-center mb-4">
                {t("consent.modal.ccpa") || t("consent.ccpaNotice")}
              </p>

              {/* Boutons */}
              <div className="space-y-3">
                <motion.button
                  onClick={handleAcceptAll}
                  className="w-full py-3.5 rounded-xl text-white font-medium"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("consent.modal.acceptAll") || t("consent.acceptAll")}
                </motion.button>

                <motion.button
                  onClick={handleAcceptSelected}
                  className="w-full py-3.5 rounded-xl text-white font-medium"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("consent.modal.accept") || t("consent.acceptSelected")}
                </motion.button>
              </div>

              {/* Footer légal */}
              <p className="text-xs text-gray-500 text-center mt-4">
                {t("consent.footerNotice") || t("consent.modal.footerNotice")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
