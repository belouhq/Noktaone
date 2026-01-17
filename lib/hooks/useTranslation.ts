'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '../i18n';

export function useTranslation() {
  const { t, i18n: i18nInstance } = useI18nTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language);

  // Écouter les changements de langue pour forcer le re-render
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18nInstance.on('languageChanged', handleLanguageChanged);

    return () => {
      i18nInstance.off('languageChanged', handleLanguageChanged);
    };
  }, [i18nInstance]);

  const changeLanguage = async (lang: string) => {
    await i18nInstance.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setCurrentLanguage(lang);
  };

  return {
    t,
    changeLanguage,
    currentLanguage,
    languages: ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'hi', 'id', 'ja', 'ko', 'zh'] as const
  };
}

export { i18n };
