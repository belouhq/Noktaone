/**
 * useConsent Hook
 * 
 * Gère le consentement utilisateur côté client
 * - Vérifie si le consentement a été donné
 * - Sauvegarde les préférences (localStorage + Supabase)
 * - Expose les méthodes pour mettre à jour les consentements
 */

import { useState, useEffect, useCallback } from "react";
import { ConsentState } from "@/components/modals/ConsentModal";

const CONSENT_STORAGE_KEY = "nokta_consent";
export const CONSENT_VERSION = "1.0.0";

interface UseConsentReturn {
  hasConsented: boolean;
  consents: ConsentState | null;
  isLoading: boolean;
  saveConsent: (consent: ConsentState) => Promise<void>;
  updateConsent: (updates: Partial<ConsentState>) => Promise<void>;
  revokeConsent: () => Promise<void>;
  needsConsentUpdate: boolean;
}

export function useConsent(userId?: string): UseConsentReturn {
  const [consents, setConsents] = useState<ConsentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsConsentUpdate, setNeedsConsentUpdate] = useState(false);

  // Charger le consentement au mount
  useEffect(() => {
    loadConsent();
  }, [userId]);

  const loadConsent = async () => {
    setIsLoading(true);
    try {
      // D'abord, vérifier localStorage (pour les guests)
      const localConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
      
      if (localConsent) {
        const parsed = JSON.parse(localConsent) as ConsentState;
        
        // Vérifier si la version du consentement est à jour
        if (parsed.version !== CONSENT_VERSION) {
          setNeedsConsentUpdate(true);
        }
        
        setConsents(parsed);
      }
      
      // Si userId, synchroniser avec Supabase
      if (userId) {
        const serverConsent = await fetchConsentFromServer(userId);
        if (serverConsent) {
          setConsents(serverConsent);
          // Mettre à jour localStorage avec la version serveur
          localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(serverConsent));
        }
      }
    } catch (error) {
      console.error("Failed to load consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConsent = useCallback(async (consent: ConsentState) => {
    try {
      // Sauvegarder en local
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
      setConsents(consent);
      
      // Si utilisateur connecté, sauvegarder sur le serveur
      if (userId) {
        await saveConsentToServer(userId, consent);
      }
      
      // Activer/désactiver les analytics selon le consentement
      updateAnalyticsConsent(consent.analytics);
      
    } catch (error) {
      console.error("Failed to save consent:", error);
      throw error;
    }
  }, [userId]);

  const updateConsent = useCallback(async (updates: Partial<ConsentState>) => {
    if (!consents) return;
    
    const updatedConsent: ConsentState = {
      ...consents,
      ...updates,
      timestamp: new Date().toISOString(),
    };
    
    await saveConsent(updatedConsent);
  }, [consents, saveConsent]);

  const revokeConsent = useCallback(async () => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      setConsents(null);
      
      if (userId) {
        await revokeConsentOnServer(userId);
      }
      
      // Désactiver tous les trackings
      updateAnalyticsConsent(false);
      
    } catch (error) {
      console.error("Failed to revoke consent:", error);
      throw error;
    }
  }, [userId]);

  const hasConsented = consents?.privacy === true;

  return {
    hasConsented,
    consents,
    isLoading,
    saveConsent,
    updateConsent,
    revokeConsent,
    needsConsentUpdate,
  };
}

// === Helper Functions ===

async function fetchConsentFromServer(userId: string): Promise<ConsentState | null> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("consent_version, consent_at, marketing_opt_in")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Si le profil existe, on considère que privacy est accepté
    if (profile.consent_version) {
      return {
        privacy: true,
        analytics: true, // Par défaut si profil existe
        marketing: profile.marketing_opt_in ?? false,
        version: profile.consent_version || CONSENT_VERSION,
        timestamp: profile.consent_at || new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching consent from server:", error);
    return null;
  }
}

async function saveConsentToServer(userId: string, consent: ConsentState): Promise<void> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Insert dans consent_log
    await supabase.from("consent_log").insert([
      {
        user_id: userId,
        consent_version: consent.version,
        consent_type: "privacy",
        granted: consent.privacy,
        consent_at: consent.timestamp,
      },
      {
        user_id: userId,
        consent_version: consent.version,
        consent_type: "analytics",
        granted: consent.analytics,
        consent_at: consent.timestamp,
      },
      {
        user_id: userId,
        consent_version: consent.version,
        consent_type: "marketing",
        granted: consent.marketing,
        consent_at: consent.timestamp,
      },
    ]);

    // Mettre à jour profiles
    await supabase
      .from("profiles")
      .update({
        consent_version: consent.version,
        consent_at: consent.timestamp,
        marketing_opt_in: consent.marketing,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } catch (error) {
    console.error("Error saving consent to server:", error);
    throw error;
  }
}

async function revokeConsentOnServer(userId: string): Promise<void> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Logger la révocation
    await supabase.from("consent_log").insert({
      user_id: userId,
      consent_type: "privacy",
      granted: false,
      consent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error revoking consent on server:", error);
    throw error;
  }
}

function updateAnalyticsConsent(enabled: boolean): void {
  if (typeof window === "undefined") return;
  
  // Mixpanel
  if ((window as any).mixpanel) {
    if (enabled) {
      (window as any).mixpanel.opt_in_tracking();
    } else {
      (window as any).mixpanel.opt_out_tracking();
    }
  }
  
  // PostHog
  if ((window as any).posthog) {
    if (enabled) {
      (window as any).posthog.opt_in_capturing();
    } else {
      (window as any).posthog.opt_out_capturing();
    }
  }
  
  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: enabled ? "granted" : "denied",
    });
  }
}

// === Export data helper ===

export async function exportUserData(userId: string): Promise<Blob> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Récupérer toutes les données de l'utilisateur
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: sessions } = await supabase
      .from("skane_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: events } = await supabase
      .from("micro_action_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: consents } = await supabase
      .from("consent_log")
      .select("*")
      .eq("user_id", userId)
      .order("consent_at", { ascending: false });

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      profile: profile || {},
      sessions: sessions || [],
      events: events || [],
      consents: consents || [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    return blob;
  } catch (error) {
    console.error("Error exporting user data:", error);
    throw error;
  }
}

// === Delete account helper ===

export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Logger la demande de suppression
    await adminClient.from("consent_log").insert({
      user_id: userId,
      consent_type: "deletion",
      granted: false,
      consent_at: new Date().toISOString(),
    });

    // 2. Anonymiser les données (RGPD permet de garder les données anonymisées)
    await adminClient
      .from("profiles")
      .update({
        email: null,
        phone: null,
        username: `deleted_${userId.substring(0, 8)}`,
        account_status: "deleted",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // 3. Supprimer l'auth
    await adminClient.auth.admin.deleteUser(userId);

    // 4. Nettoyer localStorage
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    localStorage.removeItem("user");
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
}
