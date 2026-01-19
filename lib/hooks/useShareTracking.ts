import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

/**
 * Hook: useShareTracking
 * 
 * Gère la création d'un identifiant de partage unique
 * et le tracking des conversions.
 * 
 * Usage:
 * const { shareId, createShareId, trackShare } = useShareTracking();
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ShareData {
  user_id?: string | null;
  guest_id?: string | null;
  session_id?: string;
  share_type: "story" | "tiktok" | "instagram" | "twitter" | "download" | "other";
  skane_before?: number;
  skane_after?: number;
}

export function useShareTracking() {
  const [shareId, setShareId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  /**
   * Crée un nouvel identifiant de partage unique
   * et l'enregistre en base
   */
  const createShareId = useCallback(async (data: ShareData): Promise<string> => {
    setIsTracking(true);
    
    // Générer un ID court et mémorable (8 caractères)
    const id = uuidv4().slice(0, 8).toUpperCase();
    
    try {
      const { error } = await supabase.from("share_events").insert({
        asset_id: id,
        user_id: data.user_id,
        guest_id: data.guest_id,
        session_id: data.session_id,
        share_type: data.share_type,
        clicked_count: 0,
        install_count: 0,
        signup_count: 0,
        // Stocker les scores pour analytics
        asset_url: JSON.stringify({
          before: data.skane_before,
          after: data.skane_after,
        }),
      });

      if (error) {
        console.error("Error creating share:", error);
        // Fallback: retourner l'ID quand même pour ne pas bloquer l'UX
      }
      
      setShareId(id);
      return id;
    } catch (error) {
      console.error("Error in createShareId:", error);
      return id; // Toujours retourner un ID
    } finally {
      setIsTracking(false);
    }
  }, []);

  /**
   * Met à jour le type de partage effectué
   */
  const trackShare = useCallback(async (
    shareIdToTrack: string, 
    shareType: ShareData["share_type"]
  ) => {
    try {
      await supabase
        .from("share_events")
        .update({ share_type: shareType })
        .eq("asset_id", shareIdToTrack);
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  }, []);

  /**
   * Récupère les stats d'un partage (pour dashboard futur)
   */
  const getShareStats = useCallback(async (shareIdToCheck: string) => {
    try {
      const { data, error } = await supabase
        .from("share_events")
        .select("clicked_count, install_count, signup_count")
        .eq("asset_id", shareIdToCheck)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error("Error getting share stats:", error);
      return null;
    }
  }, []);

  return {
    shareId,
    isTracking,
    createShareId,
    trackShare,
    getShareStats,
  };
}

/**
 * Utilitaire: Générer l'URL de partage complète
 */
export function getShareUrl(shareId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://noktaone.app";
  return `${baseUrl}/try?ref=${shareId}`;
}

/**
 * Utilitaire: Extraire le referral depuis l'URL actuelle
 */
export function getReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

/**
 * Utilitaire: Vérifier si l'utilisateur vient d'un partage
 */
export function isFromShare(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("nokta_from_share") === "true";
}
