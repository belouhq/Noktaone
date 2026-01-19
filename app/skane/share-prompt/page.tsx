"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkaneIndexResult, { type FeedbackType } from "@/components/skane/SkaneIndexResult";
import { getMicroActionDetails } from "@/lib/skane/selector";
import type { MicroActionType } from "@/lib/skane/types";

const FEEDBACK_TO_TYPE: Record<string, FeedbackType> = {
  worse: "still_high",
  same: "reduced",
  better: "clear",
};

export default function SharePromptPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [props, setProps] = useState<{
    selfieUrl: string;
    feedback: FeedbackType;
    microActionName: string;
    microActionDuration: number;
    isGuestMode: boolean;
    previousRanges: { before: [number, number]; after: [number, number] } | null;
  } | null>(null);

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

      setProps({
        selfieUrl: `data:image/jpeg;base64,${image}`,
        feedback,
        microActionName: details.name,
        microActionDuration: details.duration,
        isGuestMode: localStorage.getItem("guestMode") === "true",
        previousRanges,
      });
    } catch (e) {
      console.error("SharePrompt parse error", e);
      router.push("/skane");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready || !props) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <p className="text-nokta-one-white">Loading...</p>
      </main>
    );
  }

  return (
    <SkaneIndexResult
      selfieUrl={props.selfieUrl}
      feedback={props.feedback}
      microActionName={props.microActionName}
      microActionDuration={props.microActionDuration}
      isGuestMode={props.isGuestMode}
      previousRanges={props.previousRanges}
      onClose={() => router.push("/")}
      onShare={(d) => {
        sessionStorage.setItem("skane_share_payload", JSON.stringify({ beforeRange: d.beforeRange, afterRange: d.afterRange }));
        sessionStorage.setItem("skane_previous_ranges", JSON.stringify({ before: d.beforeRange, after: d.afterRange }));
        router.push("/skane/share");
      }}
    />
  );
}
