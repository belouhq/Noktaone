"use client";

/**
 * AppProvider - Provider avec gestion des consentements
 * 
 * Affiche le ConsentModal au premier lancement si pas de consentement
 */

import { useState, useEffect } from "react";
import { useConsent, ConsentState, CONSENT_VERSION } from "@/lib/hooks/useConsent";
import ConsentModal from "@/components/modals/ConsentModal";
import { useAuthContext } from "./AuthProvider";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const { consents, updateConsents } = useConsent(user?.id);
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    // Vérifier si consentement nécessaire
    const hasConsent = consents && consents.version === CONSENT_VERSION;
    const hasSeenModal = localStorage.getItem("nokta_consent_modal_seen") === "true";

    if (!hasConsent && !hasSeenModal) {
      setShowConsentModal(true);
    }
  }, [consents]);

  const handleAccept = async (newConsents: ConsentState) => {
    await updateConsents(newConsents);
    localStorage.setItem("nokta_consent_modal_seen", "true");
    setShowConsentModal(false);
  };

  const handleAcceptAll = async (newConsents: ConsentState) => {
    await updateConsents(newConsents);
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
