"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkaneShareCard from "@/components/skane/SkaneShareCard";
import { getStoredSkanes } from "@/lib/skane/storage";
import type { InternalState, MicroActionType } from "@/lib/skane/types";
import { 
  createShareEvent, 
  getOrCreateGuestId, 
  getUserId 
} from "@/lib/skane/supabase-tracker";

interface AnalysisResult {
  state: InternalState;
  skaneIndex: number;
  microAction: MicroActionType;
}

export default function SharePage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [skaneIndexAfter, setSkaneIndexAfter] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("skane_analysis_result");
    const image = sessionStorage.getItem("skane_captured_image");

    if (!stored || !image) {
      router.push("/skane");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setResult(parsed);
      setCapturedImage(image);

      // Récupérer le afterScore depuis sessionStorage (mis à jour dans feedback)
      if (parsed.afterScore !== undefined) {
        setSkaneIndexAfter(parsed.afterScore);
      } else {
        // Fallback : récupérer depuis localStorage
        const skanes = getStoredSkanes();
        const lastSkane = skanes[skanes.length - 1];
        if (lastSkane && lastSkane.skaneIndexAfter) {
          setSkaneIndexAfter(lastSkane.skaneIndexAfter);
        } else {
          // Fallback : calculer approximativement
          setSkaneIndexAfter(Math.max(10, parsed.skaneIndex - 40));
        }
      }
    } catch (error) {
      console.error("Error parsing result:", error);
      router.push("/skane");
    }
  }, [router]);

  if (!result || !capturedImage || skaneIndexAfter === null) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <p className="text-nokta-one-white">Loading...</p>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-4 overflow-y-auto py-8">
      <SkaneShareCard
        capturedImage={capturedImage}
        state={result.state}
        skaneIndexBefore={result.skaneIndex}
        skaneIndexAfter={skaneIndexAfter}
        microAction={result.microAction}
        onShare={async (shareType: string) => {
          // Tracker le partage
          const isGuestMode = localStorage.getItem("guestMode") === "true";
          const userId = getUserId();
          const guestId = isGuestMode ? getOrCreateGuestId() : null;
          const sessionId = (result as any).sessionId;
          
          if (sessionId) {
            await createShareEvent({
              user_id: userId,
              guest_id: guestId,
              session_id: sessionId,
              share_type: shareType as any,
            });
          }
        }}
      />

      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="mt-6 px-6 py-3 rounded-xl text-nokta-one-white font-medium"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        Back to Home
      </button>
    </main>
  );
}
