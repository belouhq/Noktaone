"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import SkaneIndexResult, { type FeedbackType } from "@/components/skane/SkaneIndexResult";
import { ShareCardViral, ShareFlowViral } from "@/components/engagement";
import type { ShareFlowData } from "@/lib/viral/types";
import { getMicroActionDetails } from "@/lib/skane/selector";
import type { MicroActionType } from "@/lib/skane/types";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { getOrCreateGuestId, getUserId } from "@/lib/skane/supabase-tracker";

const FEEDBACK_TO_TYPE: Record<string, FeedbackType> = {
  worse: "still_high",
  same: "reduced",
  better: "clear",
};

type ShareIntent = {
  beforeRange: [number, number];
  afterRange: [number, number];
  microActionName: string;
  selfieUrl: string;
  username: string;
  filename: string;
};

export default function SharePromptPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [props, setProps] = useState<{
    selfieUrl: string;
    feedback: FeedbackType;
    microActionName: string;
    microActionDuration: number;
    username: string;
    isGuestMode: boolean;
    previousRanges: { before: [number, number]; after: [number, number] } | null;
    skaneIndexBefore?: number;
    afterScore?: number;
  } | null>(null);
  const [shareIntent, setShareIntent] = useState<ShareIntent | null>(null);
  const [shareFlowData, setShareFlowData] = useState<ShareFlowData | null>(null);
  const [showShareFlow, setShowShareFlow] = useState(false);
  const [isGeneratingBlob, setIsGeneratingBlob] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("skane_analysis_result");
    const image = sessionStorage.getItem("skane_captured_image");

    if (!stored || !image) {
      router.push("/skane");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const actionId = (parsed.microAction || parsed.micro_action?.id || "box_breathing") as MicroActionType;
      const details = getMicroActionDetails(actionId) || { name: "Skane", duration: 30 };
      const feedbackUi = parsed.selectedFeedback || "same";
      const feedback: FeedbackType = FEEDBACK_TO_TYPE[feedbackUi] ?? "reduced";

      let previousRanges: { before: [number, number]; after: [number, number] } | null = null;
      const pr = sessionStorage.getItem("skane_previous_ranges");
      if (pr) {
        try {
          previousRanges = JSON.parse(pr);
        } catch {
          /* ignore */
        }
      }

      // Récupérer le username
      const isGuestMode = localStorage.getItem("guestMode") === "true";
      let username: string;
      if (isGuestMode) {
        const guestId = getOrCreateGuestId();
        // Extraire la partie aléatoire de l'ID (les caractères après le dernier underscore)
        const randomPart = guestId.split('_').pop() || guestId;
        username = `guest-${randomPart.slice(0, 6)}`; // Prendre les 6 premiers caractères de la partie aléatoire
      } else if (user?.user_metadata?.username) {
        username = user.user_metadata.username;
      } else if (user?.email) {
        username = user.email.split('@')[0];
      } else {
        username = 'guest';
      }

      const skaneIndexBefore = parsed.skaneIndex ?? parsed.skane_index;
      const afterScoreFromSmiley = parsed.afterScore;

      setProps({
        selfieUrl: `data:image/jpeg;base64,${image}`,
        feedback,
        microActionName: details.name,
        microActionDuration: details.duration,
        username,
        isGuestMode,
        previousRanges,
        skaneIndexBefore: typeof skaneIndexBefore === 'number' ? skaneIndexBefore : undefined,
        afterScore: typeof afterScoreFromSmiley === 'number' ? afterScoreFromSmiley : undefined,
      });
    } catch (e) {
      console.error("SharePrompt parse error", e);
      router.push("/skane");
      return;
    }
    setReady(true);
  }, [router]);

  // Générer le blob à partir de ShareCardViral quand l'utilisateur clique Partager (flux viral)
  useEffect(() => {
    if (!shareIntent || !props || !shareCardRef.current) return;
    let cancelled = false;
    setIsGeneratingBlob(true);
    const t = setTimeout(() => {
      const node = shareCardRef.current;
      if (!node || cancelled) {
        setIsGeneratingBlob(false);
        return;
      }
      toPng(node, {
        width: 375,
        height: 375 * (16 / 9),
        pixelRatio: 2,
        cacheBust: true,
      })
        .then((dataUrl) => fetch(dataUrl).then((r) => r.blob()))
        .then((blob) => {
          if (cancelled) return;
          const beforeMid = (shareIntent.beforeRange[0] + shareIntent.beforeRange[1]) / 2;
          const afterMid = (shareIntent.afterRange[0] + shareIntent.afterRange[1]) / 2;
          setShareFlowData({
            imageBlob: blob,
            beforeScore: `${shareIntent.beforeRange[0]}-${shareIntent.beforeRange[1]}`,
            afterScore: `${shareIntent.afterRange[0]}-${shareIntent.afterRange[1]}`,
            duration: props.microActionDuration,
            delta: Math.round(beforeMid - afterMid),
            microAction: shareIntent.microActionName,
          });
          setShowShareFlow(true);
        })
        .catch((err) => {
          console.error("ShareCard blob generation failed:", err);
        })
        .finally(() => {
          if (!cancelled) setIsGeneratingBlob(false);
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [shareIntent, props]);

  const handleCloseShareFlow = useCallback(() => {
    setShowShareFlow(false);
    setShareFlowData(null);
    setShareIntent(null);
  }, []);

  if (!ready || !props) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <p className="text-nokta-one-white">Loading...</p>
      </main>
    );
  }

  // Récupérer l'action actuelle depuis le résultat
  const stored = sessionStorage.getItem("skane_analysis_result");
  const actionId = stored 
    ? (JSON.parse(stored).microAction || JSON.parse(stored).micro_action?.id || "box_breathing") as MicroActionType
    : "box_breathing" as MicroActionType;
  
  // Toujours fournir un identifiant (user ou guest) pour le tracking / cooldown
  const userId = getUserId() ?? getOrCreateGuestId();

  // Fonction pour retry avec une autre action (still_high)
  const handleRetryWithDifferentAction = () => {
    sessionStorage.setItem("skane_retry_different_action", "true");
    router.push("/skane");
  };

  // Fonction pour retry simple (clear/reduced)
  const handleRetry = () => {
    // Vérifier si le cooldown est terminé
    const cooldownKey = `skane_cooldown_${userId}`;
    const stored = localStorage.getItem(cooldownKey);
    if (stored) {
      const nextTime = new Date(stored);
      if (nextTime > new Date()) {
        // Cooldown encore actif, ne pas permettre le retry
        return;
      }
    }
    // Rediriger vers le scan
    router.push("/skane");
  };

  return (
    <>
      <SkaneIndexResult
        selfieUrl={props.selfieUrl}
        feedback={props.feedback}
        microActionName={props.microActionName}
        microActionDuration={props.microActionDuration}
        username={props.username}
        userId={userId}
        currentMicroAction={actionId}
        isGuestMode={props.isGuestMode}
        previousRanges={props.previousRanges}
        skaneIndexBefore={props.skaneIndexBefore}
        afterScore={props.afterScore}
        useViralShareFlow
        onClose={() => router.push("/")}
        onRetryWithDifferentAction={handleRetryWithDifferentAction}
        onRetry={handleRetry}
        onShare={(d) => {
          sessionStorage.setItem("skane_previous_ranges", JSON.stringify({ before: d.beforeRange, after: d.afterRange }));
          setShareIntent({
            beforeRange: d.beforeRange,
            afterRange: d.afterRange,
            microActionName: d.microActionName,
            selfieUrl: d.selfieUrl,
            username: d.username,
            filename: d.filename,
          });
        }}
      />

      {/* ShareCardViral hors écran pour générer le blob du flux viral */}
      {shareIntent && (
        <div
          ref={shareCardRef}
          style={{ position: "fixed", left: -9999, top: 0, width: 375 }}
          aria-hidden
        >
          <ShareCardViral
            beforeScore={{ min: shareIntent.beforeRange[0], max: shareIntent.beforeRange[1] }}
            afterScore={{ min: shareIntent.afterRange[0], max: shareIntent.afterRange[1] }}
            microAction={shareIntent.microActionName}
            duration={props.microActionDuration}
            userPhoto={shareIntent.selfieUrl}
          />
        </div>
      )}
      {showShareFlow && shareFlowData && (
        <ShareFlowViral shareData={shareFlowData} onClose={handleCloseShareFlow} />
      )}
    </>
  );
}
