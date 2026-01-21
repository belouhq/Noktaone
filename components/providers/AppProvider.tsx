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

  // Afficher le modal si pas de consentement ou si mise à jour nécessaire
  useEffect(() => {
    if (isLoading) return;

    const hasSeenModal = localStorage.getItem("nokta_consent_modal_seen") === "true";

    if ((!hasConsented || needsConsentUpdate) && !hasSeenModal) {
      setShowConsentModal(true);
    } else {
      setShowConsentModal(false);
    }
  }, [hasConsented, isLoading, needsConsentUpdate]);

  const handleAcceptConsent = async (consents: ConsentState) => {
    try {
      await saveConsent(consents);
      localStorage.setItem("nokta_consent_modal_seen", "true");
      setShowConsentModal(false);
    } catch (error) {
      console.error("Failed to save consent:", error);
    }
  };

  const handleAcceptAll = async (consents: ConsentState) => {
    try {
      await saveConsent(consents);
      localStorage.setItem("nokta_consent_modal_seen", "true");
      setShowConsentModal(false);
    } catch (error) {
      console.error("Failed to save consent:", error);
    }
  };

  // Optionnel : Afficher un loader pendant le chargement
  // (Décommenter si tu veux bloquer l'affichage de l'app)
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-black flex items-center justify-center">
  //       <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   );
  // }

  return (
    <>
      {children}
      
      {/* Consent Modal - S'affiche par-dessus tout */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleAcceptConsent}
        onAcceptAll={handleAcceptAll}
      />
    </>
  );
}
