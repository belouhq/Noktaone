"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { getMicroActionDetails } from "@/lib/skane/selector";
import type { InternalState, MicroActionType } from "@/lib/skane/types";

interface SkaneShareCardProps {
  capturedImage: string;
  state: InternalState;
  skaneIndexBefore: number;
  skaneIndexAfter: number;
  microAction: MicroActionType;
  onShare?: (shareType: string) => void | Promise<void>;
}

const STATE_LABELS: Record<InternalState, { label: string; color: string }> = {
  HIGH_ACTIVATION: { label: "High Activation", color: "#EF4444" },
  LOW_ENERGY: { label: "Low Energy", color: "#F59E0B" },
  REGULATED: { label: "Regulated", color: "#10B981" },
};

export default function SkaneShareCard({
  capturedImage,
  state,
  skaneIndexBefore,
  skaneIndexAfter,
  microAction,
  onShare,
}: SkaneShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const microActionDetails = getMicroActionDetails(microAction);
  const stateInfo = STATE_LABELS[state];

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1920,
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `skane-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1920,
        quality: 1,
        pixelRatio: 2,
      });

      // Convert to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "skane.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My SKANE Index",
          text: "Check out my reset!",
          files: [file],
        });
        
        // Tracker le partage
        if (onShare) {
          await onShare('story'); // Détecter le type depuis navigator.share si possible
        }
      } else {
        // Fallback to download
        handleDownload();
        if (onShare) {
          await onShare('other');
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to download
      handleDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Share card */}
      <div
        ref={cardRef}
        className="relative"
        style={{
          width: "540px",
          height: "960px",
          background: "#000000",
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <h2 className="text-white font-bold text-xl">SKANE INDEX</h2>
        </div>

        {/* User photo */}
        <div
          className="absolute top-20 left-0 right-0 h-64"
          style={{
            backgroundImage: `url(${capturedImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Before/After indicators */}
        <div className="absolute top-80 left-0 right-0 px-6 space-y-6">
          {/* Before */}
          <div>
            <p className="text-white text-sm mb-2">BEFORE</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${skaneIndexBefore}%` }}
                  />
                </div>
              </div>
              <p className="text-white font-bold text-2xl">{skaneIndexBefore}%</p>
            </div>
          </div>

          {/* After */}
          <div>
            <p className="text-white text-sm mb-2">AFTER</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${skaneIndexAfter}%` }}
                  />
                </div>
              </div>
              <p className="text-white font-bold text-2xl">{skaneIndexAfter}%</p>
            </div>
          </div>
        </div>

        {/* Action info */}
        <div className="absolute bottom-32 left-0 right-0 px-6 text-center">
          <p className="text-white font-bold text-lg mb-2">SKANE COMPLETED</p>
          <p className="text-white text-sm mb-1">
            {microActionDetails.name} ({microActionDetails.duration}s)
          </p>
          <p className="text-gray-400 text-xs">Wellness signal — Not medical</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="px-6 py-3 rounded-xl text-nokta-one-white font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          {isGenerating ? "Generating..." : "Share to Stories"}
        </button>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-3 rounded-xl text-nokta-one-white font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          Download Image
        </button>
      </div>
    </div>
  );
}
