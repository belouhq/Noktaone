'use client';

import { useEffect, useState } from 'react';
import i18n from '@/lib/i18n';
import { I18nextProvider } from 'react-i18next';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    // Attendre que i18n soit initialisé
    const initI18n = async () => {
      // Charger la langue sauvegardée (uniquement côté client)
      if (typeof window !== 'undefined') {
        // S'assurer que i18n est initialisé
        if (!i18n.isInitialized) {
          await i18n.init();
        }
        
        const savedLanguage = localStorage.getItem('language');
        const targetLanguage = savedLanguage || 'fr';
        
        if (i18n.language !== targetLanguage) {
          await i18n.changeLanguage(targetLanguage);
          setLanguage(targetLanguage);
        } else {
          setLanguage(i18n.language);
        }
        
        // Mettre à jour la direction du document pour RTL (arabe)
        updateDocumentDirection(i18n.language);
      }
      
      // Attendre que les ressources soient chargées
      await i18n.loadNamespaces('translation');
      setIsReady(true);
    };
    
    initI18n();
    
    // Écouter les changements de langue pour mettre à jour la direction et forcer le re-render
    const handleLanguageChange = (lng: string) => {
      updateDocumentDirection(lng);
      setLanguage(lng); // Force le re-render
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  // Fonction pour mettre à jour la direction du document
  const updateDocumentDirection = (language: string) => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      // Langues RTL: arabe, hébreu (pas encore ajouté)
      const isRTL = ['ar', 'he'].includes(language);
      html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      html.setAttribute('lang', language);
    }
  };

  // Toujours rendre les enfants, même si pas encore prêt
  // i18n est déjà initialisé avec une langue par défaut
  // Utiliser une clé basée sur la langue pour forcer le re-render
  return (
    <I18nextProvider i18n={i18n} key={`i18n-${language}`}>
      {children}
    </I18nextProvider>
  );
}
