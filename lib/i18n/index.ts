import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// ⚠️ IMPORTANT: Ne pas utiliser LanguageDetector ici
// La détection se fait côté client dans I18nProvider pour éviter les erreurs d'hydratation

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

// ⚠️ IMPORTANT: Ne pas utiliser LanguageDetector ici
// La détection se fait côté client dans I18nProvider
// Toujours démarrer avec 'fr' côté serveur pour éviter les erreurs d'hydratation
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'fr', // ← Toujours démarrer avec fr côté serveur
      fallbackLng: 'fr',
      defaultNS: 'translation',
      ns: 'translation',
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false // ← IMPORTANT pour éviter les erreurs d'hydratation
      }
    });
}

export default i18n;
