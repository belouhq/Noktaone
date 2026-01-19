"use client";

import { Check } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { LANGUAGES, getLanguageByCode } from "@/lib/i18n/languages";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

export default function LanguageModal({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
}: LanguageModalProps) {
  const { t, currentLanguage } = useTranslation();
  const selectedLang = getLanguageByCode(currentLanguage) || LANGUAGES[0];
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="relative w-full p-4 rounded-xl"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <select
        value={currentLanguage}
        onChange={async (e) => {
          const newLang = e.target.value;
          await onSelectLanguage(newLang);
          onClose();
        }}
        className="w-full text-nokta-one-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-nokta-one-blue pr-12 bg-transparent"
        style={{
          fontSize: "16px",
          border: "none",
        }}
        autoFocus
      >
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLanguage;
          return (
            <option
              key={lang.code}
              value={lang.code}
              style={{
                background: "#000000",
                color: "#FFFFFF",
                padding: "12px",
              }}
            >
              {isSelected ? "✓ " : "  "}{lang.flag} {lang.name}
            </option>
          );
        })}
      </select>
      
      {/* Icône chevron */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-nokta-one-white">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
