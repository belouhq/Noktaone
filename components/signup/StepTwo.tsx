"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface StepTwoProps {
  email: string;
  country: string;
  language: string;
  occupation: string;
  onEmailChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onOccupationChange: (value: string) => void;
  onNext: () => void;
}

const countries = [
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export default function StepTwo({
  email,
  country,
  language,
  occupation,
  onEmailChange,
  onCountryChange,
  onLanguageChange,
  onOccupationChange,
  onNext,
}: StepTwoProps) {
  const { t } = useTranslation();
  const [emailError, setEmailError] = useState<string>("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    onEmailChange(value);
    if (value && !validateEmail(value)) {
      setEmailError("Format d'email invalide");
    } else {
      setEmailError("");
    }
  };

  const isFormValid =
    email.trim() !== "" &&
    validateEmail(email) &&
    country !== "" &&
    language !== "";

  return (
    <div className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-nokta-one-blue focus:outline-none text-nokta-one-white transition-colors"
          placeholder="votre@email.com"
          required
        />
        {emailError && (
          <p className="text-xs text-red-500 mt-1">{emailError}</p>
        )}
      </div>

      {/* Pays */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Pays</label>
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-nokta-one-blue focus:outline-none text-nokta-one-white transition-colors"
          required
        >
          <option value="" className="bg-black">
            Sélectionnez un pays
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code} className="bg-black">
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Langue */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Langue</label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-nokta-one-blue focus:outline-none text-nokta-one-white transition-colors"
          required
        >
          <option value="" className="bg-black">
            Sélectionnez une langue
          </option>
          {languages.map((l) => (
            <option key={l.code} value={l.code} className="bg-black">
              {l.flag} {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Occupation */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          {t("signup.occupationOptional") || "Occupation (optionnel)"}
        </label>
        <input
          type="text"
          value={occupation}
          onChange={(e) => onOccupationChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-nokta-one-blue focus:outline-none text-nokta-one-white transition-colors"
          placeholder={t("signup.occupationPlaceholder") || "Entrepreneur, Étudiant, Cadre..."}
        />
      </div>

      {/* Bouton Next */}
      <motion.button
        onClick={onNext}
        disabled={!isFormValid}
        className="w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isFormValid ? "#3B82F6" : "rgba(59, 130, 246, 0.5)",
        }}
        whileHover={isFormValid ? { scale: 1.05 } : {}}
        whileTap={isFormValid ? { scale: 0.95 } : {}}
      >
        Next
      </motion.button>
    </div>
  );
}
