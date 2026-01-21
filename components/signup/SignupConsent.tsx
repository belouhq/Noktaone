"use client";

/**
 * SignupConsent - Checkboxes de consentement dans le flow d'inscription
 * 
 * Version simplifiée pour le signup
 */

import { useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export interface SignupConsentState {
  privacy: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface SignupConsentProps {
  consents: SignupConsentState;
  onConsentChange: (consents: SignupConsentState) => void;
}

export default function SignupConsent({
  consents,
  onConsentChange,
}: SignupConsentProps) {
  const { t } = useTranslation();

  const updateConsent = (key: keyof SignupConsentState, value: boolean) => {
    onConsentChange({
      ...consents,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Privacy - Obligatoire */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={consents.privacy}
            onChange={(e) => updateConsent("privacy", e.target.checked)}
            className="sr-only"
            required
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              consents.privacy
                ? "bg-blue-500 border-blue-500"
                : "border-gray-500"
            }`}
          >
            {consents.privacy && <Check size={14} className="text-white" />}
          </div>
        </div>
        <div className="flex-1">
          <span className="text-white text-sm">
            {t("consent.signup.privacy")} <span className="text-red-400">*</span>
          </span>
        </div>
      </label>

      {/* Analytics - Optionnel */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={consents.analytics}
            onChange={(e) => updateConsent("analytics", e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              consents.analytics
                ? "bg-blue-500 border-blue-500"
                : "border-gray-500"
            }`}
          >
            {consents.analytics && <Check size={14} className="text-white" />}
          </div>
        </div>
        <span className="text-gray-400 text-sm">
          {t("consent.signup.analytics")}
        </span>
      </label>

      {/* Marketing - Optionnel */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={consents.marketing}
            onChange={(e) => updateConsent("marketing", e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              consents.marketing
                ? "bg-blue-500 border-blue-500"
                : "border-gray-500"
            }`}
          >
            {consents.marketing && <Check size={14} className="text-white" />}
          </div>
        </div>
        <span className="text-gray-400 text-sm">
          {t("consent.signup.marketing")}
        </span>
      </label>

      <p className="text-xs text-gray-500 mt-4">
        {t("consent.signup.links")}
      </p>
    </div>
  );
}
