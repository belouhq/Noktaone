"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

interface SkaneShareCardV2Props {
  capturedImage: string;
  skaneIndexBefore: number;
  skaneIndexAfter: number;
  microActionName: string;
  microActionIcon?: string;
  streakDays?: number;
  onShare?: (shareType: string) => void | Promise<void>;
}

// Score visual dots - 5 points scale
const ScoreDots = ({ score }: { score: number }) => {
  const filledDots = Math.round(score / 20); // Sur 5 maintenant
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            i < filledDots
              ? "bg-[#00FF94] shadow-[0_0_8px_rgba(0,255,148,0.5)]"
              : "bg-white/20"
          }`}
        />
      ))}
    </div>
  );
};

// Get state label based on score
const getStateLabel = (score: number): string => {
  if (score >= 70) return "REGULATED";
  if (score >= 40) return "ADJUSTING";
  return "HIGH ACTIVATION";
};

export default function SkaneShareCardV2({
  capturedImage,
  skaneIndexBefore,
  skaneIndexAfter,
  microActionName,
  microActionIcon = "🌬️",
  streakDays,
  onShare,
}: SkaneShareCardV2Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const delta = skaneIndexBefore - skaneIndexAfter;
  const stateLabel = getStateLabel(100 - skaneIndexAfter);

  const generateImage = async () => {
    if (!cardRef.current) return null;

    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1920,
        quality: 1,
        pixelRatio: 2,
      });
      return dataUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    const dataUrl = await generateImage();
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `nokta-reset-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    const dataUrl = await generateImage();
    
    if (dataUrl) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], "nokta-reset.png", { type: "image/png" });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "My Nokta Reset",
            text: `Just reset my nervous system in 30 seconds. -${delta} stress points.`,
            files: [file],
          });
          if (onShare) await onShare("native");
        } else {
          handleDownload();
          if (onShare) await onShare("download");
        }
      } catch (error) {
        console.error("Error sharing:", error);
        handleDownload();
      }
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full px-4">
      {/* 
        Card Container - Fixed 9:16 aspect ratio (phone format)
        Scales responsively but maintains ratio
      */}
      <div
        className="relative w-full max-w-[400px] mx-auto"
        style={{ aspectRatio: "9 / 16" }}
      >
        {/* Actual card content - this gets exported */}
        <div
          ref={cardRef}
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: "24px",
            background: "#000",
          }}
        >
          {/* ============================================
              LAYER 1: SELFIE FULLSCREEN BACKGROUND
              ============================================ */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${capturedImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />

          {/* ============================================
              LAYER 2: GRADIENT OVERLAYS
              ============================================ */}
          {/* Top gradient - subtle for header */}
          <div
            className="absolute inset-x-0 top-0 h-32"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
            }}
          />

          {/* Bottom gradient - stronger for data */}
          <div
            className="absolute inset-x-0 bottom-0 h-[55%]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, transparent 100%)",
            }}
          />

          {/* ============================================
              LAYER 3: CONTENT OVERLAY
              ============================================ */}
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              {/* Logo Nokta One (4 boucles pétales entrelacées) */}
              <svg viewBox="0 0 100 100" width="28" height="28" fill="none" className="opacity-90">
                <g stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M50 8 Q70 8, 70 30 Q70 45, 50 50 Q30 45, 30 30 Q30 8, 50 8"/>
                  <path d="M92 50 Q92 70, 70 70 Q55 70, 50 50 Q55 30, 70 30 Q92 30, 92 50"/>
                  <path d="M50 92 Q30 92, 30 70 Q30 55, 50 50 Q70 55, 70 70 Q70 92, 50 92"/>
                  <path d="M8 50 Q8 30, 30 30 Q45 30, 50 50 Q45 70, 30 70 Q8 70, 8 50"/>
                </g>
              </svg>
              <span
                className="text-white font-semibold tracking-wider text-sm"
                style={{ fontFamily: "'SF Pro Display', system-ui, sans-serif" }}
              >
                NOKTA ONE
              </span>
            </div>
            
            {/* 30s badge */}
            <div
              className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{
                background: "rgba(0, 255, 148, 0.15)",
                border: "1px solid rgba(0, 255, 148, 0.3)",
              }}
            >
              <span className="text-[#00FF94] font-bold text-sm">30s</span>
              <span className="text-[#00FF94] text-xs">⚡</span>
            </div>
          </div>

          {/* Main data section - bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            
            {/* Delta - THE MAIN WOW ELEMENT */}
            <div className="text-center mb-4">
              <div
                className="inline-block"
                style={{
                  fontFamily: "'SF Pro Display', system-ui, sans-serif",
                }}
              >
                <span
                  className="text-[#00FF94] font-black"
                  style={{
                    fontSize: "clamp(48px, 15vw, 80px)",
                    lineHeight: 1,
                    textShadow: "0 0 40px rgba(0, 255, 148, 0.5)",
                  }}
                >
                  −{delta}
                </span>
              </div>
              <p
                className="text-white/70 text-sm tracking-widest mt-1"
                style={{ fontFamily: "'SF Pro Display', system-ui, sans-serif" }}
              >
                STRESS REDUCTION
              </p>
            </div>

            {/* Score visualization */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <ScoreDots score={100 - skaneIndexAfter} />
              <span
                className="text-white/90 text-xs font-medium tracking-wider"
                style={{ fontFamily: "'SF Pro Display', system-ui, sans-serif" }}
              >
                {stateLabel}
              </span>
            </div>

            {/* Before → After mini display */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="text-center">
                <p className="text-white/40 text-xs tracking-wider mb-1">BEFORE</p>
                <p className="text-white/60 font-semibold text-lg">{skaneIndexBefore}</p>
              </div>
              <div className="text-white/30">→</div>
              <div className="text-center">
                <p className="text-white/40 text-xs tracking-wider mb-1">AFTER</p>
                <p className="text-[#00FF94] font-semibold text-lg">{skaneIndexAfter}</p>
              </div>
            </div>

            {/* Micro-action tag */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-lg">{microActionIcon}</span>
              <span
                className="text-white/80 text-sm"
                style={{ fontFamily: "'SF Pro Display', system-ui, sans-serif" }}
              >
                {microActionName}
              </span>
            </div>

            {/* Streak (if applicable) */}
            {streakDays && streakDays > 1 && (
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <span className="text-orange-400">🔥</span>
                <span className="text-white/60 text-xs">
                  {streakDays}-day streak
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="w-full h-px bg-white/10 mb-4" />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span
                className="text-white/40 text-xs tracking-wider"
                style={{ fontFamily: "'SF Pro Display', system-ui, sans-serif" }}
              >
                noktaone.com
              </span>
              <span
                className="text-white/30 text-[10px]"
                style={{ fontFamily: "'SF Pro Display', system-ui, sans-serif" }}
              >
                Wellness signal — Not medical
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - outside the card */}
      <div className="flex gap-3 w-full max-w-[400px]">
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="flex-1 py-3.5 rounded-2xl text-black font-semibold text-sm transition-all active:scale-[0.98]"
          style={{
            background: "#00FF94",
            boxShadow: "0 0 20px rgba(0, 255, 148, 0.3)",
          }}
        >
          {isGenerating ? "Generating..." : "Share to Stories"}
        </button>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-5 py-3.5 rounded-2xl text-white font-medium text-sm transition-all active:scale-[0.98]"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
