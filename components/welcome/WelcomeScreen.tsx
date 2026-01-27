"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// ÉCRAN D'ACCUEIL / LANDING - NOKTA ONE
// Style Tesla épuré + Impact conversion
// ============================================

const WORD_KEYS = ["stress", "tension", "anxiety", "fatigue"] as const;

export const WelcomeScreen = ({
  onStart = () => {},
  onLogin = () => {},
}: {
  onStart?: () => void;
  onLogin?: () => void;
}) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeWord, setActiveWord] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % WORD_KEYS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGlow} />

      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <SkaneIcon />
          <span style={styles.logoText}>NOKTA ONE</span>
        </div>
      </header>

      <main style={styles.content}>
        <div
          style={{
            ...styles.headlineContainer,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h1 style={styles.headline}>
            {t("welcome.headlinePrefix")}{" "}
            <span style={styles.headlineHighlight}>
              {t(`welcome.words.${WORD_KEYS[activeWord]}`)}
            </span>
            <br />
            {t("welcome.headlineSuffix")}
          </h1>

          <p style={styles.subheadline}>{t("welcome.subheadline")}</p>
        </div>

        <div
          style={{
            ...styles.visualContainer,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transitionDelay: "0.2s",
          }}
        >
          <div style={styles.skanePreview}>
            <div style={styles.previewCircle}>
              <div style={styles.previewCircleInner}>
                <span style={styles.previewScore}>?</span>
              </div>
              <svg style={styles.previewRing} viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#1C1C1E"
                  strokeWidth="3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="289"
                  strokeDashoffset="72"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF453A" />
                    <stop offset="100%" stopColor="#30D158" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span style={styles.previewLabel}>{t("welcome.skaneIndex")}</span>
          </div>
        </div>

        <div
          style={{
            ...styles.features,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transitionDelay: "0.4s",
          }}
        >
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📷</span>
            <span style={styles.featureText}>{t("welcome.featureScan")}</span>
          </div>
          <div style={styles.featureDivider} />
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🧘</span>
            <span style={styles.featureText}>{t("welcome.featureAction")}</span>
          </div>
          <div style={styles.featureDivider} />
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📊</span>
            <span style={styles.featureText}>{t("welcome.featureResult")}</span>
          </div>
        </div>
      </main>

      <footer
        style={{
          ...styles.footer,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transitionDelay: "0.6s",
        }}
      >
        <button style={styles.ctaButton} onClick={onStart}>
          <span style={styles.ctaText}>{t("welcome.start")}</span>
          <ArrowIcon />
        </button>

        <button style={styles.loginButton} onClick={onLogin}>
          {t("welcome.alreadyAccount")}
        </button>

        <p style={styles.disclaimer}>{t("welcome.disclaimer")}</p>
      </footer>
    </div>
  );
};

const SkaneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 8V5a2 2 0 012-2h3" />
    <path d="M16 3h3a2 2 0 012 2v3" />
    <path d="M3 16v3a2 2 0 002 2h3" />
    <path d="M16 21h3a2 2 0 002-2v-3" />
    <circle cx="9" cy="10" r="1" fill="#FFFFFF" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="#FFFFFF" stroke="none" />
    <path d="M9 15c.83.67 2 1 3 1s2.17-.33 3-1" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    maxWidth: "430px",
    margin: "0 auto",
    position: "relative",
    overflow: "hidden",
  },
  backgroundGlow: {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(48,209,88,0.08) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  header: {
    padding: "20px",
    paddingTop: "60px",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoText: {
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    gap: "48px",
  },
  headlineContainer: {
    textAlign: "center",
    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  headline: {
    fontSize: "32px",
    fontWeight: 600,
    lineHeight: 1.2,
    margin: 0,
    marginBottom: "16px",
    letterSpacing: "-0.02em",
  },
  headlineHighlight: {
    color: "#30D158",
    transition: "opacity 0.3s ease",
  },
  subheadline: {
    fontSize: "17px",
    fontWeight: 400,
    color: "#8E8E93",
    margin: 0,
    lineHeight: 1.5,
  },
  visualContainer: {
    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  skanePreview: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  previewCircle: {
    position: "relative",
    width: "120px",
    height: "120px",
  },
  previewCircleInner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewScore: {
    fontSize: "36px",
    fontWeight: 600,
    color: "#6E6E73",
  },
  previewRing: {
    width: "100%",
    height: "100%",
  },
  previewLabel: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.1em",
    color: "#6E6E73",
  },
  features: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  feature: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  featureIcon: {
    fontSize: "20px",
  },
  featureText: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#6E6E73",
    whiteSpace: "nowrap",
  },
  featureDivider: {
    width: "1px",
    height: "32px",
    backgroundColor: "#2C2C2E",
  },
  footer: {
    padding: "20px",
    paddingBottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  ctaButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    padding: "18px",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "none",
    borderRadius: "14px",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s ease, opacity 0.2s ease",
  },
  ctaText: {
    letterSpacing: "-0.01em",
  },
  loginButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "16px",
    backgroundColor: "transparent",
    color: "#8E8E93",
    border: "none",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
  },
  disclaimer: {
    fontSize: "12px",
    color: "#48484A",
    textAlign: "center",
    margin: 0,
    marginTop: "8px",
  },
};

export default WelcomeScreen;
