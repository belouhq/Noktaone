"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SkaneIndexResult, { type FeedbackType, type ShareData } from "@/components/skane/SkaneIndexResult";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Placeholder selfie (dark gradient) pour la démo, sans dépendance réseau
const DEMO_SELFIE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%231a1a2e"/><stop offset="100%" style="stop-color:%2316226e"/></linearGradient></defs><rect width="400" height="600" fill="url(%23g)"/><circle cx="200" cy="220" r="80" fill="%23333" opacity="0.6"/><ellipse cx="200" cy="420" rx="120" ry="40" fill="%23333" opacity="0.5"/></svg>'
  );

const FEEDBACK_OPTIONS: { value: FeedbackType; labelKey: string; emoji: string }[] = [
  { value: "clear", labelKey: "skaneIndex.demo.feedbackClear", emoji: "🟢" },
  { value: "reduced", labelKey: "skaneIndex.demo.feedbackReduced", emoji: "🟠" },
  { value: "still_high", labelKey: "skaneIndex.demo.feedbackStillHigh", emoji: "🔴" },
];

export default function SkaneIndexDemo() {
  const { t } = useTranslation();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackType>("clear");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [previousRanges, setPreviousRanges] = useState<{ before: [number, number]; after: [number, number] } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleClose = () => {
    setShowResult(false);
  };

  const handleShare = (data: ShareData) => {
    setPreviousRanges({ before: data.beforeRange, after: data.afterRange });
    setShowResult(false);
    // En démo : on pourrait logger ou ouvrir un modal
    if (typeof window !== "undefined") {
      console.log("[SkaneIndexDemo] onShare", data);
    }
  };

  if (showResult) {
    return (
      <SkaneIndexResult
        selfieUrl={DEMO_SELFIE}
        feedback={feedback}
        microActionName="Physiological Sigh"
        microActionDuration={24}
        isGuestMode={isGuestMode}
        previousRanges={previousRanges}
        onClose={handleClose}
        onShare={handleShare}
      />
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-xl font-semibold tracking-wider uppercase mb-8">{t("skaneIndex.demo.title")}</h1>

      <div className="w-full max-w-sm space-y-6">
        {/* Feedback */}
        <div>
          <p className="text-sm text-white/60 mb-2">{t("skaneIndex.demo.feedback")}</p>
          <div className="flex gap-3">
            {FEEDBACK_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setFeedback(o.value)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  feedback === o.value ? "bg-white/20 border border-white/40" : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                {o.emoji} {t(o.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Guest mode */}
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-white/60">{t("skaneIndex.demo.guestMode")}</p>
          <button
            onClick={() => setIsGuestMode((v) => !v)}
            className={`relative w-12 h-7 rounded-full transition-colors ${isGuestMode ? "bg-green-500/80" : "bg-white/20"}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${isGuestMode ? "left-6" : "left-1"}`} />
          </button>
        </div>

        {/* Launch */}
        <button
          onClick={() => setShowResult(true)}
          className="w-full py-4 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 font-medium uppercase tracking-wider"
        >
          {t("skaneIndex.demo.launch")}
        </button>

        {/* Back */}
        <button onClick={() => router.push("/")} className="w-full py-3 text-white/60 text-sm hover:text-white">
          {t("common.back")}
        </button>
      </div>
    </main>
  );
}
