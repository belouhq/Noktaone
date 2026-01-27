'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import i18n from '../i18n';

export function useTranslation() {
  const { t: tOriginal, i18n: i18nInstance } = useI18nTranslation();
  // ⚠️ IMPORTANT: Toujours initialiser avec 'fr' pour éviter les erreurs d'hydratation
  // La langue sera mise à jour après l'hydratation dans I18nProvider
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isClient, setIsClient] = useState(false);

  // Détecter si on est côté client et synchroniser la langue
  useEffect(() => {
    setIsClient(true);
    // Synchroniser avec la langue actuelle d'i18n après l'hydratation
    setCurrentLanguage(i18nInstance.language || 'fr');
  }, [i18nInstance]);

  // Wrapper pour t avec fallback automatique
  const t = (key: string, options?: any): string => {
    const translated = tOriginal(key, options);
    const translatedStr = typeof translated === 'string' ? translated : String(translated);
    
    // Si la traduction retourne la clé elle-même, c'est qu'elle n'a pas été trouvée
    if (translatedStr === key && i18nInstance.isInitialized) {
      // Fallbacks par clé ; certaines ont une valeur par langue
      const fallbacksRaw: Record<string, string | Record<string, string>> = {
        'settings.settingsSection': 'Settings',
        'settings.contactUs': { fr: 'Contactez-nous', en: 'Contact us' },
        'settings.privacyAndData': { fr: 'Confidentialité & Données', en: 'Privacy & Data' },
        'support.contactUs': 'Contact Us',
        'home.lastSkaneTitle': 'Last skane',
        'home.lastSkaneEmpty': '—',
        'home.justNow': 'Just now',
        'home.pressToSkane': 'Press to\nskane',
        'time.minutesAgo': '{{count}} min ago',
        'time.hoursAgo': '{{count}} hours ago',
        'time.daysAgo': '{{count}} days ago',
        'time.todayAt': 'Today – {{time}}',
        'time.yesterday': 'Yesterday',
      };
      const raw = fallbacksRaw[key];
      const lang = (i18nInstance.language || 'fr').split('-')[0];
      const fallback = typeof raw === 'object' && raw !== null
        ? (raw[lang as keyof typeof raw] || raw['en'] || raw['fr'])
        : raw;
      const fallbackStr = typeof fallback === 'string' ? fallback : undefined;
      if (fallbackStr && options) {
        // Replace placeholders in fallback
        return fallbackStr.replace(/\{\{(\w+)\}\}/g, (_, name) => {
          return options[name]?.toString() || '';
        });
      }
      return fallbackStr || key;
    }
    return translatedStr;
  };

  // Écouter les changements de langue
  useEffect(() => {
    const handleChange = (lng: string) => {
      setCurrentLanguage(lng);
    };
    
    i18nInstance.on('languageChanged', handleChange);
    return () => {
      i18nInstance.off('languageChanged', handleChange);
    };
  }, [i18nInstance]);

  const changeLanguage = useCallback(async (lang: string) => {
    try {
      await i18nInstance.changeLanguage(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang);
      }
      setCurrentLanguage(lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18nInstance]);

  return {
    t,
    changeLanguage,
    currentLanguage: i18nInstance.language || 'fr',
    isClient, // ← Utile pour conditionner l'affichage
    languages: ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'hi', 'id', 'ja', 'ko', 'zh'] as const
  };
}

export { i18n };
