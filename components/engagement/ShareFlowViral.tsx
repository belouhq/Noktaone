"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { ShareFlowProps } from "@/lib/viral/types";
import {
  generateShareText,
  downloadImage,
} from "@/lib/viral/shareTemplates";

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  container: {
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "#1C1C1E",
    borderRadius: "20px 20px 0 0",
    padding: "24px 20px 40px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  closeButton: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    color: "#6E6E73",
    cursor: "pointer",
  },
  platforms: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  platformButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "20px",
    backgroundColor: "#2C2C2E",
    border: "none",
    borderRadius: "12px",
    color: "#FFFFFF",
    cursor: "pointer",
    position: "relative",
    fontSize: "15px",
    fontWeight: 500,
  },
  platformBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    fontSize: "10px",
    fontWeight: 600,
    color: "#FF2D55",
    backgroundColor: "rgba(255,45,85,0.15)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  guideContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  guideStep: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#FFFFFF",
  },
  guideIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#30D158",
    borderRadius: "50%",
    fontSize: "14px",
  },
  guideText: {
    fontSize: "15px",
    color: "#8E8E93",
    lineHeight: 1.4,
    marginTop: "8px",
  },
  tiktokButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "16px",
    marginTop: "16px",
    backgroundColor: "#000000",
    border: "1px solid #FFFFFF",
    borderRadius: "12px",
    color: "#FFFFFF",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
  },
  completeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "40px 0",
  },
  completeIcon: {
    width: "64px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#30D158",
    borderRadius: "50%",
    fontSize: "32px",
    color: "#FFFFFF",
  },
  completeText: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  doneButton: {
    padding: "12px 32px",
    backgroundColor: "#2C2C2E",
    border: "none",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
  },
};

type Step = "choose" | "tiktok_guide" | "complete";

export function ShareFlowViral({ shareData, onClose }: ShareFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("choose");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePlatformSelect = async (platform: string) => {
    setSelectedPlatform(platform);
    if (navigator.vibrate) navigator.vibrate(10);

    const textData = {
      beforeScore: shareData.beforeScore,
      afterScore: shareData.afterScore,
      duration: shareData.duration,
      delta: shareData.delta,
    };

    if (platform === "tiktok") {
      setStep("tiktok_guide");
      downloadImage(shareData.imageBlob, "nokta-reset.png");
      const text = generateShareText("tiktok", textData);
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } catch {
        setCopied(false);
      }
    } else if (platform === "download") {
      downloadImage(shareData.imageBlob, "nokta-reset.png");
      setStep("complete");
      setCopied(false);
    } else if (platform === "native" && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Mon reset Nokta",
          text: generateShareText(platform, textData),
          files: [
            new File([shareData.imageBlob], "nokta-reset.png", {
              type: "image/png",
            }),
          ],
        });
        setStep("complete");
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      const text = generateShareText(
        platform === "instagram" ? "instagram" : platform === "twitter" ? "twitter" : "whatsapp",
        textData
      );
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } catch {
        setCopied(false);
      }
      setStep("complete");
    }
  };

  const openTikTok = () => {
    if (typeof window !== "undefined") {
      window.open("https://www.tiktok.com/upload", "_blank");
    }
    setStep("complete");
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        {step === "choose" && (
          <>
            <div style={styles.header}>
              <span style={styles.title}>{t("engagement.shareTitle")}</span>
              <button
                type="button"
                style={styles.closeButton}
                onClick={onClose}
                aria-label={t("common.close")}
              >
                <CloseIcon />
              </button>
            </div>

            <div style={styles.platforms}>
              <button
                type="button"
                style={styles.platformButton}
                onClick={() => handlePlatformSelect("tiktok")}
              >
                <TikTokIcon />
                <span>TikTok</span>
                <span style={styles.platformBadge}>{t("engagement.shareViral")}</span>
              </button>

              <button
                type="button"
                style={styles.platformButton}
                onClick={() => handlePlatformSelect("instagram")}
              >
                <InstagramIcon />
                <span>Instagram</span>
              </button>

              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  type="button"
                  style={styles.platformButton}
                  onClick={() => handlePlatformSelect("native")}
                >
                  <ShareIcon />
                  <span>{t("engagement.shareOther")}</span>
                </button>
              )}

              <button
                type="button"
                style={styles.platformButton}
                onClick={() => handlePlatformSelect("download")}
              >
                <DownloadIcon />
                <span>{t("engagement.shareDownload")}</span>
              </button>
            </div>
          </>
        )}

        {step === "tiktok_guide" && (
          <>
            <div style={styles.header}>
              <span style={styles.title}>{t("engagement.shareTiktokTitle")}</span>
            </div>

            <div style={styles.guideContainer}>
              <div style={styles.guideStep}>
                <span style={styles.guideIcon}>✓</span>
                <span>{t("engagement.shareImageDownloaded")}</span>
              </div>
              <div style={styles.guideStep}>
                <span style={styles.guideIcon}>✓</span>
                <span>{t("engagement.shareTextCopied")}</span>
              </div>

              <p style={styles.guideText}>{t("engagement.shareTiktokInstructions")}</p>

              <button
                type="button"
                style={styles.tiktokButton}
                onClick={openTikTok}
              >
                <TikTokIcon />
                <span>{t("engagement.shareOpenTiktok")}</span>
              </button>
            </div>
          </>
        )}

        {step === "complete" && (
          <div style={styles.completeContainer}>
            <span style={styles.completeIcon}>✓</span>
            <span style={styles.completeText}>
              {copied ? t("engagement.shareTextCopiedDone") : t("engagement.shareDone")}
            </span>
            <button type="button" style={styles.doneButton} onClick={onClose}>
              {t("engagement.shareComplete")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
