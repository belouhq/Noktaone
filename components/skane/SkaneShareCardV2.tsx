"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { getMicroActionDetails } from "@/lib/skane/selector";
import type { InternalState, MicroActionType } from "@/lib/skane/types";
import { QRCodeSVG } from "qrcode.react";

interface SkaneShareCardProps {
  capturedImage: string;
  state: InternalState;
  skaneIndexBefore: number;
  skaneIndexAfter: number;
  microAction: MicroActionType;
  shareId?: string; // ID unique pour tracking
  onShare?: (shareType: string) => void | Promise<void>;
}

const STATE_LABELS: Record<InternalState, { label: string; color: string }> = {
  HIGH_ACTIVATION: { label: "High Activation", color: "#EF4444" },
  LOW_ENERGY: { label: "Low Energy", color: "#F59E0B" },
  REGULATED: { label: "Regulated", color: "#10B981" },
};

export default function SkaneShareCardV2({
  capturedImage,
  state,
  skaneIndexBefore,
  skaneIndexAfter,
  microAction,
  shareId,
  onShare,
}: SkaneShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const microActionDetails = getMicroActionDetails(microAction);
  const stateInfo = STATE_LABELS[state];
  
  // Calcul du delta (amélioration)
  const delta = skaneIndexBefore - skaneIndexAfter;
  const deltaPercent = Math.round((delta / skaneIndexBefore) * 100);
  const isImprovement = delta > 0;
  
  // URL de partage avec tracking
  const shareUrl = shareId 
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://noktaone.app'}/try?ref=${shareId}`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'https://noktaone.app'}/try`;

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
      link.download = `nokta-reset-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      if (onShare) {
        await onShare('download');
      }
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

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "nokta-reset.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My NOKTA Reset",
          text: `${isImprovement ? `-${deltaPercent}%` : ''} stress en 30 sec 🎯 Essaie toi aussi`,
          url: shareUrl,
          files: [file],
        });
        
        if (onShare) {
          await onShare('story');
        }
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      handleDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Share card - Format Story 9:16 */}
      <div
        ref={cardRef}
        className="relative"
        style={{
          width: "540px",
          height: "960px",
          background: "linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)",
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >
        {/* Header minimal */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        </div>

        {/* User photo avec overlay gradient */}
        <div
          className="absolute top-16 left-0 right-0 h-72"
          style={{
            backgroundImage: `url(${capturedImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.8) 100%)",
            }}
          />
        </div>

        {/* DELTA HERO - Le chiffre qui parle tout seul */}
        <div className="absolute top-64 left-0 right-0 flex flex-col items-center z-10">
          {isImprovement ? (
            <>
              <div className="flex items-baseline gap-1">
                <span 
                  className="text-8xl font-black"
                  style={{ 
                    color: "#10B981",
                    textShadow: "0 0 60px rgba(16, 185, 129, 0.5)"
                  }}
                >
                  -{deltaPercent}%
                </span>
              </div>
              <p className="text-white/80 text-lg mt-2 tracking-wider">
                STRESS EN 30 SEC
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-white">
                  RESET
                </span>
              </div>
              <p className="text-white/80 text-lg mt-2 tracking-wider">
                COMPLETED
              </p>
            </>
          )}
        </div>

        {/* Before/After compact */}
        <div className="absolute top-[420px] left-0 right-0 px-8">
          <div className="flex justify-between items-center gap-4">
            {/* Before */}
            <div className="flex-1">
              <p className="text-white/40 text-xs mb-2 tracking-wider">AVANT</p>
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{ 
                    width: `${skaneIndexBefore}%`,
                    background: "linear-gradient(90deg, #EF4444 0%, #F59E0B 100%)"
                  }}
                />
              </div>
              <p className="text-white font-bold text-2xl mt-2">{skaneIndexBefore}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center px-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M5 12H19M19 12L12 5M19 12L12 19" 
                  stroke={isImprovement ? "#10B981" : "#FFFFFF"} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* After */}
            <div className="flex-1">
              <p className="text-white/40 text-xs mb-2 tracking-wider">APRÈS</p>
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{ 
                    width: `${skaneIndexAfter}%`,
                    background: "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                  }}
                />
              </div>
              <p className="text-white font-bold text-2xl mt-2">{skaneIndexAfter}</p>
            </div>
          </div>
        </div>

        {/* Action info */}
        <div className="absolute top-[540px] left-0 right-0 px-8">
          <div 
            className="p-4 rounded-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <p className="text-white/40 text-xs tracking-wider mb-1">MICRO-ACTION</p>
            <p className="text-white font-medium text-lg">
              {microActionDetails.name}
            </p>
            <p className="text-white/60 text-sm">
              {microActionDetails.duration} secondes
            </p>
          </div>
        </div>

        {/* CTA Section - Le point critique */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div 
            className="p-6 rounded-3xl flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.3)"
            }}
          >
            <div className="flex-1">
              <p className="text-white font-bold text-lg mb-1">
                Essaie toi aussi
              </p>
              <p className="text-white/60 text-sm">
                1 scan gratuit • 30 sec
              </p>
            </div>
            
            {/* QR Code pour accès direct */}
            <div 
              className="p-2 rounded-xl bg-white"
              style={{ width: "80px", height: "80px" }}
            >
              <QRCodeSVG
                value={shareUrl}
                size={64}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
          </div>
          
          {/* Disclaimer */}
          <p className="text-white/30 text-xs text-center mt-4">
            Signal de bien-être • Non médical
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="px-8 py-4 rounded-2xl text-white font-semibold flex items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)"
          }}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">⏳</span>
              Génération...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Partager
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-4 rounded-2xl text-white font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
