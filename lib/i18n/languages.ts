/**
 * Centralized language list for NOKTA ONE
 * Used by LanguageModal, EditProfileModal, and other components
 */

export interface Language {
  code: string;
  flag: string;
  name: string;
}

export const LANGUAGES: Language[] = [
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "en", flag: "🇺🇸", name: "English (US)" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
  { code: "pt", flag: "🇧🇷", name: "Português" },
  { code: "ar", flag: "🇸🇦", name: "العربية" },
  { code: "hi", flag: "🇮🇳", name: "हिन्दी" },
  { code: "id", flag: "🇮🇩", name: "Bahasa Indonesia" },
  { code: "ja", flag: "🇯🇵", name: "日本語" },
  { code: "ko", flag: "🇰🇷", name: "한국어" },
  { code: "zh", flag: "🇨🇳", name: "中文" },
];

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

export function getLanguageName(code: string, fallback?: string): string {
  const lang = getLanguageByCode(code);
  return lang?.name || fallback || code;
}
