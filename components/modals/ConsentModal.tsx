"use client";

/**
 * ConsentModal - Modal RGPD au premier lancement
 * 
 * Affiche les consentements obligatoires et optionnels
 * Conforme RGPD Article 6 & 7
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ConsentState, CONSENT_VERSION, useConsent } from "@/lib/hooks/useConsent";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: (consents: ConsentState) => void;
  onAcceptAll: (consents: ConsentState) => void;
}

export default function ConsentModal({
  isOpen,
  onAccept,
  onAcceptAll,
}: ConsentModalProps) {
  const { t } = useTranslation();
  const { consents } = useConsent();

  const [privacy, setPrivacy] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [showDetails, setShowDetails] = useState({
    analytics: false,
    marketing: false,
  });

  // Si consents existent déjà, ne pas afficher
  useEffect(() => {
    if (consents) {
      setPrivacy(consents.privacy);
      setAnalytics(consents.analytics);
      setMarketing(consents.marketing);
    }
  }, [consents]);

  if (!isOpen || consents) return null;

  const handleAcceptAll = () => {
    const allConsents: ConsentState = {
      privacy: true,
      analytics: true,
      marketing: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    onAcceptAll(allConsents);
  };

  const handleAccept = () => {
    if (!privacy) return; // Privacy obligatoire

    const selectedConsents: ConsentState = {
      privacy,
      analytics,
      marketing,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    onAccept(selectedConsents);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-[#0A0A0F] rounded-3xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            {t("consent.modal.title")}
          </h2>

          <p className="text-gray-400 text-sm mb-6">
            {t("consent.modal.description")}
          </p>

          {/* Privacy - Obligatoire */}
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="sr-only"
                required
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  privacy
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-500"
                }`}
              >
                {privacy && <Check size={14} className="text-white" />}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-white text-sm font-medium">
                {t("consent.modal.privacy.title")} <span className="text-red-400">*</span>
              </span>
              <p className="text-gray-400 text-xs mt-1">
                {t("consent.modal.privacy.description")}
              </p>
            </div>
          </label>

          {/* Analytics - Optionnel */}
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    analytics
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-500"
                  }`}
                >
                  {analytics && <Check size={14} className="text-white" />}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">
                    {t("consent.modal.analytics.title")}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setShowDetails({ ...showDetails, analytics: !showDetails.analytics })
                    }
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        showDetails.analytics ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
                {showDetails.analytics && (
                  <p className="text-gray-400 text-xs mt-1">
                    {t("consent.modal.analytics.description")}
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Marketing - Optionnel */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    marketing
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-500"
                  }`}
                >
                  {marketing && <Check size={14} className="text-white" />}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">
                    {t("consent.modal.marketing.title")}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setShowDetails({ ...showDetails, marketing: !showDetails.marketing })
                    }
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        showDetails.marketing ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
                {showDetails.marketing && (
                  <p className="text-gray-400 text-xs mt-1">
                    {t("consent.modal.marketing.description")}
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* CCPA Notice (US) */}
          <p className="text-xs text-gray-500 mb-6 text-center">
            {t("consent.modal.ccpa")}
          </p>

          {/* Links */}
          <div className="flex gap-4 text-xs text-gray-400 mb-6 justify-center">
            <a href="/privacy" className="hover:text-white underline">
              {t("consent.modal.privacyLink")}
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-white underline">
              {t("consent.modal.termsLink")}
            </a>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={!privacy}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              {t("consent.modal.accept")}
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors"
            >
              {t("consent.modal.acceptAll")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
