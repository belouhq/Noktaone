"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface SignupConsentProps {
  onConsentChange: (consents: SignupConsentState) => void;
  consents: SignupConsentState;
}

export interface SignupConsentState {
  termsAccepted: boolean;
  marketingOptIn: boolean;
}

/**
 * Composant de consentement à intégrer dans StepThree.tsx (ou la dernière étape du signup)
 * AVANT le bouton "Create Account"
 */
export default function SignupConsent({ onConsentChange, consents }: SignupConsentProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleTermsToggle = () => {
    onConsentChange({
      ...consents,
      termsAccepted: !consents.termsAccepted,
    });
    setError(null);
  };

  const handleMarketingToggle = () => {
    onConsentChange({
      ...consents,
      marketingOptIn: !consents.marketingOptIn,
    });
  };

  return (
    <div className="space-y-3 mt-6 mb-4">
      {/* Consentement CGU/Privacy (Obligatoire) */}
      <motion.div
        className="p-4 rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: error 
            ? "1px solid rgba(239, 68, 68, 0.5)" 
            : "1px solid rgba(255, 255, 255, 0.08)",
        }}
        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleTermsToggle}
            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              consents.termsAccepted
                ? "bg-blue-500"
                : "bg-transparent border-2 border-gray-500 hover:border-gray-400"
            }`}
          >
            {consents.termsAccepted && <Check size={12} className="text-white" />}
          </button>
          <div className="flex-1">
            <p className="text-sm text-white">
              {t("signup.acceptTerms") || "I accept the"}{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                {t("signup.termsOfService") || "Terms of Service"}
                <ExternalLink size={12} />
              </a>
              {" "}{t("signup.and") || "and"}{" "}
              <a
                href="/privacy"
                target="_blank"
                className="text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                {t("signup.privacyPolicy") || "Privacy Policy"}
                <ExternalLink size={12} />
              </a>
              <span className="text-red-400 ml-1">*</span>
            </p>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-2 ml-8">{error}</p>
        )}
      </motion.div>

      {/* Opt-in Marketing (Optionnel) */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleMarketingToggle}
            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              consents.marketingOptIn
                ? "bg-blue-500"
                : "bg-transparent border-2 border-gray-500 hover:border-gray-400"
            }`}
          >
            {consents.marketingOptIn && <Check size={12} className="text-white" />}
          </button>
          <div className="flex-1">
            <p className="text-sm text-gray-300">
              {t("signup.marketingOptIn") || "Keep me updated with tips and offers"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t("signup.marketingOptInDescription") || "Occasional emails about wellness tips, new features, and exclusive offers. Unsubscribe anytime."}
            </p>
          </div>
        </div>
      </div>

      {/* Mention légale */}
      <p className="text-xs text-gray-500 text-center px-4">
        {t("signup.dataUsageNotice") || "Your facial scans are processed locally. Only wellness metrics are stored securely."}
      </p>
    </div>
  );
}
