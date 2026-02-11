"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkaneResultPage from "@/components/skane/SkaneResultPage";
import { getMicroActionDetails } from "@/lib/skane/selector";
import type { MicroActionType } from "@/lib/skane/types";

type FeedbackUi = "better" | "same" | "worse";
type FeedbackType = "clear" | "reduced" | "still_high";

const FEEDBACK_TO_TYPE: Record<FeedbackUi, FeedbackType> = {
  worse: "still_high",
  same: "reduced",
  better: "clear",
};

interface StoredResult {
  skaneIndex?: number;
  skane_index?: number;
  afterScore?: number;
  microAction?: MicroActionType;
  micro_action?: { id?: string; duration_seconds?: number; category?: string };
  selectedFeedback?: FeedbackUi;
}

export default function ResultPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [props, setProps] = useState<{
    scoreBefore: number;
    scoreAfter: number;
    microAction: string;
    duration: number;
    feedback: FeedbackType;
  } | null>(null);

  useEffect(() => {
    let stored = sessionStorage.getItem("skane_analysis_result");
    if (!stored) {
      stored = sessionStorage.getItem("skane_result");
    }
    if (!stored) {
      router.push("/skane");
      return;
    }

    try {
      const parsed: StoredResult = JSON.parse(stored);

      const before =
        typeof parsed.skaneIndex === "number"
          ? parsed.skaneIndex
          : typeof parsed.skane_index === "number"
          ? parsed.skane_index
          : 60;

      const after =
        typeof parsed.afterScore === "number"
          ? parsed.afterScore
          : Math.max(Math.round(before * 0.6), 5);

      const actionId = (parsed.microAction ||
        parsed.micro_action?.id ||
        "box_breathing") as MicroActionType;

      const details = getMicroActionDetails(actionId) || {
        name: "Skane",
        duration: parsed.micro_action?.duration_seconds ?? 30,
      };

      const feedbackUi = parsed.selectedFeedback || "same";
      const feedback: FeedbackType =
        FEEDBACK_TO_TYPE[feedbackUi as FeedbackUi] ?? "reduced";

      setProps({
        scoreBefore: before,
        scoreAfter: after,
        microAction: details.name,
        duration: details.duration,
        feedback,
      });
      setReady(true);
    } catch (e) {
      console.error("Result parse error", e);
      router.push("/skane");
    }
  }, [router]);

  if (!ready || !props) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SkaneResultPage
      scoreBefore={props.scoreBefore}
      scoreAfter={props.scoreAfter}
      microAction={props.microAction}
      duration={props.duration}
      feedback={props.feedback}
      onRetry={() => router.push("/skane")}
      onHome={() => router.push("/")}
      appDownloadLink="https://nokta.app/download"
    />
  );
}
