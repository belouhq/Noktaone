'use client';

import { useEffect, useState } from 'react';
import i18n from '@/lib/i18n';
import { I18nextProvider } from 'react-i18next';
import { ReactNode } from 'react';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // ⚠️ IMPORTANT: Attendre que l'hydratation soit complète avant de changer la langue
    // Cela évite les erreurs d'hydratation
    
    // Écouter les changements de langue pour mettre à jour la direction
    const handleLanguageChange = (lng: string) => {
      updateDocumentDirection(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
    const rafId = requestAnimationFrame(() => {
      // Côté client uniquement : charger la langue sauvegardée
      const savedLanguage = localStorage.getItem('language');
      
      if (savedLanguage && savedLanguage !== i18n.language) {
        // Changer la langue APRÈS l'hydratation
        // Utiliser setTimeout pour différer le changement après le premier render
        setTimeout(() => {
          i18n.changeLanguage(savedLanguage).catch(console.error);
        }, 0);
      }
      
      // Mettre à jour la direction du document pour RTL (arabe)
      updateDocumentDirection(i18n.language);
      
      // Marquer comme hydraté après un tick
      // Cela permet d'éviter les erreurs d'hydratation
      setIsHydrated(true);
    });
    
    return () => {
      cancelAnimationFrame(rafId);
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

  // ⚠️ IMPORTANT: Pendant l'hydratation, rendre le même contenu que le serveur
  // Cela évite le mismatch d'hydratation
  // i18n est déjà initialisé avec 'fr' côté serveur, donc le contenu sera cohérent
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
