"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const languages = [
  { code: "fr", flag: "🇫🇷" },
  { code: "en", flag: "🇺🇸" },
  { code: "es", flag: "🇪🇸" },
  { code: "de", flag: "🇩🇪" },
  { code: "it", flag: "🇮🇹" },
  { code: "pt", flag: "🇧🇷" },
  { code: "ar", flag: "🇸🇦" },
  { code: "hi", flag: "🇮🇳" },
  { code: "id", flag: "🇮🇩" },
  { code: "ja", flag: "🇯🇵" },
  { code: "ko", flag: "🇰🇷" },
  { code: "zh", flag: "🇨🇳" },
];

export default function LanguageModal({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
}: LanguageModalProps) {
  const { t, currentLanguage } = useTranslation();
  
  // Créer un mapping des noms de langues avec fallback
  const getLanguageName = (code: string): string => {
    const key = `languages.${code}`;
    const translated = t(key);
    // Si la traduction retourne la clé, utiliser un fallback
    if (translated === key) {
      const fallback: Record<string, string> = {
        fr: "Français",
        en: "English (US)",
        es: "Español",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ar: "العربية",
        hi: "हिन्दी",
        id: "Bahasa Indonesia",
        ja: "日本語",
        ko: "한국어",
        zh: "中文"
      };
      return fallback[code] || code;
    }
    return translated;
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

              {/* Titre */}
              <h2 className="text-lg font-semibold text-nokta-one-white mb-4">
                {t("languages.title")}
              </h2>

              {/* Liste des langues */}
              <div className="space-y-2">
                {languages.map((lang) => {
                  // Utiliser uniquement currentLanguage pour déterminer la sélection
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <motion.button
                      key={lang.code}
                      onClick={async () => {
                        await onSelectLanguage(lang.code);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-colors ${
                        isSelected
                          ? "bg-nokta-one-blue/20"
                          : "hover:bg-white/5"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-nokta-one-white flex-1">{getLanguageName(lang.code)}</span>
                      {isSelected && (
                        <span className="text-nokta-one-blue">✓</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
