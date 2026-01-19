"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkaneShareCardV2 from "@/components/skane/SkaneShareCardV2";
import { getStoredSkanes } from "@/lib/skane/storage";
import type { InternalState, MicroActionType } from "@/lib/skane/types";
import { 
  createShareEvent, 
  getOrCreateGuestId, 
  getUserId 
} from "@/lib/skane/supabase-tracker";
import { useShareTracking, getShareUrl } from "@/lib/hooks/useShareTracking";

interface AnalysisResult {
  state: InternalState;
  skaneIndex: number;
  microAction: MicroActionType;
  sessionId?: string;
  afterScore?: number;
}

export default function SharePageV2() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [skaneIndexAfter, setSkaneIndexAfter] = useState<number | null>(null);
  
  const { shareId, createShareId, trackShare } = useShareTracking();

  useEffect(() => {
    const stored = sessionStorage.getItem("skane_analysis_result");
    const image = sessionStorage.getItem("skane_captured_image");

    if (!stored || !image) {
      router.push("/skane");
      return;
    }

    try {
      const parsed: AnalysisResult = JSON.parse(stored);
      setResult(parsed);
      setCapturedImage(image);

      // Récupérer le afterScore
      if (parsed.afterScore !== undefined) {
        setSkaneIndexAfter(parsed.afterScore);
      } else {
        const skanes = getStoredSkanes();
        const lastSkane = skanes[skanes.length - 1];
        if (lastSkane?.skaneIndexAfter) {
          setSkaneIndexAfter(lastSkane.skaneIndexAfter);
        } else {
          // Fallback calculé
          setSkaneIndexAfter(Math.max(10, parsed.skaneIndex - 40));
        }
      }

      // Créer l'ID de partage dès que les données sont prêtes
      const initShareId = async () => {
        const isGuestMode = localStorage.getItem("guestMode") === "true";
        const userId = getUserId();
        const guestId = isGuestMode ? getOrCreateGuestId() : null;
        
        await createShareId({
          user_id: userId,
          guest_id: guestId,
          session_id: parsed.sessionId,
          share_type: "other", // Sera mis à jour lors du partage réel
          skane_before: parsed.skaneIndex,
          skane_after: parsed.afterScore || Math.max(10, parsed.skaneIndex - 40),
        });
      };
      
      initShareId();
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
  }, [router, createShareId]);

  const handleShare = async (shareType: string) => {
    if (!result) return;
    
    // Tracker dans share_events existant
    const isGuestMode = localStorage.getItem("guestMode") === "true";
    const userId = getUserId();
    const guestId = isGuestMode ? getOrCreateGuestId() : null;
    
    if (result.sessionId) {
      await createShareEvent({
        user_id: userId,
        guest_id: guestId,
        session_id: result.sessionId,
        share_type: shareType as any,
      });
    }
    
    // Mettre à jour le type de partage
    if (shareId) {
      await trackShare(shareId, shareType as any);
    }
  };

  if (!result || !capturedImage || skaneIndexAfter === null) {
    return (
      <main className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Préparation du partage...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-black flex flex-col items-center justify-center px-4 overflow-y-auto py-8">
      
      {/* Nouvelle carte de partage */}
      <SkaneShareCardV2
        capturedImage={capturedImage}
        state={result.state}
        skaneIndexBefore={result.skaneIndex}
        skaneIndexAfter={skaneIndexAfter}
        microAction={result.microAction}
        shareId={shareId || undefined}
        onShare={handleShare}
      />

      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="mt-8 px-6 py-3 rounded-xl text-white/60 font-medium hover:text-white transition-colors"
      >
        Retour à l'accueil
      </button>
      
      {/* Indicateur de partage ID (debug - à supprimer en prod) */}
      {process.env.NODE_ENV === "development" && shareId && (
        <p className="text-white/20 text-xs mt-4">
          Share ID: {shareId} • URL: {getShareUrl(shareId)}
        </p>
      )}
    </main>
  );
}
