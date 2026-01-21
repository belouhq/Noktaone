"use client";

/**
 * AppProvider - Provider avec gestion des consentements
 * 
 * Affiche le ConsentModal au premier lancement si pas de consentement
 */

import { useState, useEffect } from "react";
import { useConsent } from "@/lib/hooks/useConsent";
import ConsentModal from "@/components/modals/ConsentModal";
import { ConsentState } from "@/components/modals/ConsentModal";
import { useAuthContext } from "./AuthProvider";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const { hasConsented, isLoading, saveConsent, needsConsentUpdate } = useConsent(user?.id);
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (isLoading) return;

    // Afficher le modal si :
    // 1. Pas de consentement OU
    // 2. La version du consentement est obsolète
    const hasSeenModal = localStorage.getItem("nokta_consent_modal_seen") === "true";

    if ((!hasConsented || needsConsentUpdate) && !hasSeenModal) {
      setShowConsentModal(true);
    } else {
      setShowConsentModal(false);
    }
  }, [hasConsented, isLoading, needsConsentUpdate]);

  const handleAccept = async (newConsents: ConsentState) => {
    await saveConsent(newConsents);
    localStorage.setItem("nokta_consent_modal_seen", "true");
    setShowConsentModal(false);
  };

  const handleAcceptAll = async (newConsents: ConsentState) => {
    await saveConsent(newConsents);
    localStorage.setItem("nokta_consent_modal_seen", "true");
    setShowConsentModal(false);
  };

  return (
    <>
      {children}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleAccept}
        onAcceptAll={handleAcceptAll}
      />
    </>
  );
}
