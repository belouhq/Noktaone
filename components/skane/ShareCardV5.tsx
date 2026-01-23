"use client";

import { useRef, useEffect, useState } from "react";
import { toPng } from "html-to-image";
import { getMicroActionDetails } from "@/lib/skane/selector";
import type { MicroActionType } from "@/lib/skane/types";

interface ShareCardV5Props {
  selfieUrl: string;
  beforeScore: number;
  afterScore: number;
  microAction: MicroActionType;
  streak?: number;
  onShare?: (imageUrl: string) => void;
  onSave?: (imageUrl: string) => void;
}

export default function ShareCardV5({
  selfieUrl,
  beforeScore,
  afterScore,
  microAction,
  streak,
  onShare,
  onSave,
}: ShareCardV5Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const microActionDetails = getMicroActionDetails(microAction);
  
  const delta = Math.round(beforeScore - afterScore);
  const filledDots = Math.round((afterScore / 100) * 5);
  const totalDots = 5;

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

      if (onShare) {
        onShare(dataUrl);
      } else {
        // Fallback: use Web Share API
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], `nokta-share-${Date.now()}.png`, { type: 'image/png' });
        
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: "My Skane Result",
          });
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1920,
        quality: 1,
        pixelRatio: 2,
      });

      if (onSave) {
        onSave(dataUrl);
      } else {
        // Fallback: download
        const link = document.createElement("a");
        link.download = `nokta-share-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-[375px] mx-auto">
      {/* Phone Frame */}
      <div 
        className="relative w-full aspect-[9/16] bg-black rounded-[32px] overflow-hidden"
        style={{
          boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.8), 0 0 100px rgba(0, 255, 148, 0.1)",
        }}
      >
        {/* Share Card - The actual content */}
        <div ref={cardRef} className="absolute inset-0 overflow-hidden">
          {/* Layer 1: Selfie Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${selfieUrl})`,
            }}
          />

          {/* Layer 2: Gradients */}
          <div 
            className="absolute inset-0 top-0 h-[120px]"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
            }}
          />
          <div 
            className="absolute left-0 right-0 bottom-0"
            style={{
              height: "58%",
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 50%, transparent 100%)",
            }}
          />

          {/* Layer 3: Content */}
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 px-5 py-5 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              {/* Logo Nokta One (4 boucles pétales entrelacées) */}
              <svg 
                className="w-7 h-7 opacity-90" 
                viewBox="0 0 100 100" 
                fill="none"
              >
                <g stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M50 8 Q70 8, 70 30 Q70 45, 50 50 Q30 45, 30 30 Q30 8, 50 8"/>
                  <path d="M92 50 Q92 70, 70 70 Q55 70, 50 50 Q55 30, 70 30 Q92 30, 92 50"/>
                  <path d="M50 92 Q30 92, 30 70 Q30 55, 50 50 Q70 55, 70 70 Q70 92, 50 92"/>
                  <path d="M8 50 Q8 30, 30 30 Q45 30, 50 50 Q45 70, 30 70 Q8 70, 8 50"/>
                </g>
              </svg>
              <span 
                className="text-white text-[13px] font-semibold"
                style={{ letterSpacing: "0.08em" }}
              >
                NOKTA ONE
              </span>
            </div>
            <div 
              className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{
                background: "rgba(0, 255, 148, 0.12)",
                border: "1px solid rgba(0, 255, 148, 0.25)",
              }}
            >
              <span className="text-[#00FF94] text-[13px] font-bold">30s</span>
              <span className="text-[11px]">⚡</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-6 z-10">
            
            {/* Delta - THE STAR */}
            <div className="text-center mb-4">
              <div 
                className="text-[72px] font-black text-[#00FF94] leading-none"
                style={{
                  textShadow: "0 0 60px rgba(0, 255, 148, 0.5)",
                  letterSpacing: "-0.02em",
                }}
              >
                {delta > 0 ? `−${delta}` : `+${Math.abs(delta)}`}
              </div>
              <div 
                className="text-[11px] font-medium mt-1"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.15em",
                }}
              >
                STRESS REDUCTION
              </div>
            </div>

            {/* Score dots */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="flex gap-1">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: i < filledDots 
                        ? "#00FF94" 
                        : "rgba(255,255,255,0.15)",
                      boxShadow: i < filledDots 
                        ? "0 0 8px rgba(0, 255, 148, 0.5)" 
                        : "none",
                    }}
                  />
                ))}
              </div>
              <span 
                className="text-[10px] font-semibold"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  letterSpacing: "0.12em",
                }}
              >
                REGULATED
              </span>
            </div>

            {/* Before/After */}
            <div className="flex items-center justify-center gap-6 mb-5">
              <div className="text-center">
                <div 
                  className="text-[9px] font-medium mb-1"
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.12em",
                  }}
                >
                  BEFORE
                </div>
                <div 
                  className="text-[18px] font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {beforeScore}
                </div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>→</div>
              <div className="text-center">
                <div 
                  className="text-[9px] font-medium mb-1"
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.12em",
                  }}
                >
                  AFTER
                </div>
                <div 
                  className="text-[18px] font-semibold text-[#00FF94]"
                >
                  {afterScore}
                </div>
              </div>
            </div>

            {/* Micro Action */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-[18px]">🌬️</span>
              <span 
                className="text-[13px]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {microActionDetails.name}
              </span>
            </div>

            {/* Streak */}
            {streak && streak > 0 && (
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <span className="text-[14px]">🔥</span>
                <span 
                  className="text-[11px]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {streak}-day streak
                </span>
              </div>
            )}

            {/* Divider */}
            <div 
              className="w-full h-px mb-4"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span 
                className="text-[11px] font-medium"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.05em",
                }}
              >
                noktaone.com
              </span>
              <span 
                className="text-[9px]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Wellness signal — Not medical
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="flex-1 px-6 py-3.5 rounded-2xl border-none text-black text-sm font-semibold transition-all"
          style={{
            background: "#00FF94",
            boxShadow: "0 0 30px rgba(0, 255, 148, 0.25)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 0 40px rgba(0, 255, 148, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 255, 148, 0.25)";
          }}
        >
          {isGenerating ? "Generating..." : "Share to Stories"}
        </button>
        <button
          onClick={handleSave}
          disabled={isGenerating}
          className="px-5 py-3.5 rounded-2xl text-white text-sm font-medium transition-all"
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
