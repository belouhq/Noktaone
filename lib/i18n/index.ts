import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  it: { translation: it },
  zh: { translation: zh },
  ar: { translation: ar },
  pt: { translation: pt },
  hi: { translation: hi },
  id: { translation: id },
  ja: { translation: ja },
  ko: { translation: ko }
};

// Initialiser i18n
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'fr',
      lng: 'fr', // Sera mis à jour côté client
      defaultNS: 'translation',
      ns: 'translation',
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage']
      },
      react: {
        useSuspense: false
      }
    });
}

export default i18n;
