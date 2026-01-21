/**
 * Hook: useConsent
 * 
 * Gère les consentements RGPD (privacy, analytics, marketing)
 * + Export et suppression de données
 */

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Version du consentement (incrémenter si CGU changent)
export const CONSENT_VERSION = "1.0.0";

export interface ConsentState {
  privacy: boolean; // Obligatoire
  analytics: boolean; // Optionnel
  marketing: boolean; // Optionnel
  version: string;
  timestamp: string;
}

// Note: useConsent is client-side, so we use anon key
// For server-side operations (export/delete), use service role key

/**
 * Charger les consentements depuis localStorage ou Supabase
 */
export function useConsent(userId?: string) {
  const [consents, setConsents] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsents(userId).then((loaded) => {
      setConsents(loaded);
      setLoading(false);
    });
  }, [userId]);

  const updateConsents = async (newConsents: Partial<ConsentState>) => {
    const updated: ConsentState = {
      privacy: newConsents.privacy ?? consents?.privacy ?? false,
      analytics: newConsents.analytics ?? consents?.analytics ?? false,
      marketing: newConsents.marketing ?? consents?.marketing ?? false,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };

    // Sauvegarder localement
    localStorage.setItem("nokta_consents", JSON.stringify(updated));
    setConsents(updated);

    // Sauvegarder sur le serveur si userId
    if (userId) {
      await saveConsentToServer(userId, updated);
    }
  };

  return { consents, loading, updateConsents };
}

/**
 * Charger les consentements
 */
async function loadConsents(userId?: string): Promise<ConsentState | null> {
  // 1. Essayer localStorage (guest ou non connecté)
  const local = localStorage.getItem("nokta_consents");
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed.version === CONSENT_VERSION) {
        return parsed;
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  // 2. Si userId, charger depuis Supabase
  if (userId) {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data } = await client
      .from("profiles")
      .select("consent_version, consent_at, marketing_opt_in")
      .eq("id", userId)
      .single();

    if (data) {
      return {
        privacy: true, // Si profil existe, privacy était accepté
        analytics: true, // Par défaut si profil existe
        marketing: data.marketing_opt_in ?? false,
        version: data.consent_version || CONSENT_VERSION,
        timestamp: data.consent_at || new Date().toISOString(),
      };
    }
  }

  return null;
}

/**
 * Sauvegarder les consentements sur le serveur
 */
async function saveConsentToServer(userId: string, consent: ConsentState) {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Insert dans consent_log
  await client.from("consent_log").insert([
    {
      user_id: userId,
      consent_type: "privacy",
      granted: consent.privacy,
      consent_version: consent.version,
      consent_at: consent.timestamp,
    },
    {
      user_id: userId,
      consent_type: "analytics",
      granted: consent.analytics,
      consent_version: consent.version,
      consent_at: consent.timestamp,
    },
    {
      user_id: userId,
      consent_type: "marketing",
      granted: consent.marketing,
      consent_version: consent.version,
      consent_at: consent.timestamp,
    },
  ]);

  // Update profiles
  await client
    .from("profiles")
    .update({
      consent_version: consent.version,
      consent_at: consent.timestamp,
      marketing_opt_in: consent.marketing,
    })
    .eq("id", userId);
}

/**
 * Exporter toutes les données utilisateur (Article 20 RGPD)
 */
export async function exportUserData(userId: string): Promise<Blob> {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const { data: sessions } = await client
    .from("skane_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: consents } = await client
    .from("consent_log")
    .select("*")
    .eq("user_id", userId)
    .order("consent_at", { ascending: false });

  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile,
    sessions: sessions || [],
    consent_history: consents || [],
  };

  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
}

/**
 * Supprimer le compte utilisateur (Article 17 RGPD)
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const { createClient } = await import("@supabase/supabase-js");
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Anonymiser les données (pas de hard delete pour audit)
  await adminClient
    .from("profiles")
    .update({
      account_status: "deleted",
      email: null,
      phone: null,
      username: `deleted_${Date.now()}`,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // Supprimer l'utilisateur Auth
  await adminClient.auth.admin.deleteUser(userId);

  // Nettoyer localStorage
  localStorage.removeItem("nokta_consents");
  localStorage.clear();
  sessionStorage.clear();
}
