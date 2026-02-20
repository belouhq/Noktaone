"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// NOKTA ONE - ÉCRAN D'ACCUEIL / WELCOME
// ✅ Connecté à i18n pour toutes les langues
// ============================================

const HEADLINE_KEYS = ["headline0", "headline1", "headline2", "headline3", "headline4", "headline5", "headline6", "headline7", "headline8", "headline9", "headline10"] as const;

export const WelcomeScreen = ({
  onStart = () => {},
  onLogin = () => {},
}: {
  onStart?: () => void;
  onLogin?: () => void;
  locale?: string;
}) => {
  const { t } = useTranslation();
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [shownIndices, setShownIndices] = useState<number[]>([]);

  const headlines = useMemo(() => HEADLINE_KEYS.map((k) => t(`welcome.${k}`)), [t]);

  const getRandomUnseenIndex = (shown: number[], total: number) => {
    if (shown.length >= total) return Math.floor(Math.random() * total);
    const unseenIndices: number[] = [];
    for (let i = 0; i < total; i++) {
      if (!shown.includes(i)) unseenIndices.push(i);
    }
    return unseenIndices[Math.floor(Math.random() * unseenIndices.length)];
  };

  useEffect(() => {
    const initialIndex = Math.floor(Math.random() * headlines.length);
    setCurrentHeadlineIndex(initialIndex);
    setShownIndices([initialIndex]);
  }, [headlines.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setShownIndices((prev) => {
          const newShown = prev.length >= headlines.length ? [] : prev;
          const newIndex = getRandomUnseenIndex(newShown, headlines.length);
          setCurrentHeadlineIndex(newIndex);
          return [...newShown, newIndex];
        });
        setIsVisible(true);
      }, 250);
    }, 3500);
    return () => clearInterval(interval);
  }, [headlines.length]);

  return (
    <div style={styles.container}>
      <main style={styles.content}>
        <div style={styles.logoContainer}>
          <NoktaLogo />
        </div>
        <div style={styles.headlineContainer}>
          <p style={styles.headlineFixed}>
            {t("welcome.headlinePrefixUse")}
          </p>
          <p
            style={{
              ...styles.headlineDynamic,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(6px)",
            }}
          >
            {headlines[currentHeadlineIndex]}
          </p>
          <p style={styles.tagline}>{t("welcome.tagline")}</p>
        </div>
      </main>
      <footer style={styles.footer}>
        <div style={styles.featuresContainer}>
          <Feature icon={<ScanIcon />} label={t("welcome.featureScan")} />
          <div style={styles.separator} />
          <Feature icon={<TimerIcon />} label={t("welcome.featureAction")} />
          <div style={styles.separator} />
          <Feature icon={<CheckIcon />} label={t("welcome.featureResult")} />
        </div>
        <button
          type="button"
          style={styles.ctaButton}
          onClick={onStart}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {t("welcome.start")}
        </button>
        <button type="button" style={styles.textLink} onClick={onLogin}>
          {t("welcome.alreadyAccount")}
        </button>
        <p style={styles.legal}>{t("welcome.disclaimer")}</p>
      </footer>
    </div>
  );
};

const Feature = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div style={styles.feature}>
    {icon}
    <span style={styles.featureLabel}>{label}</span>
  </div>
);

const NoktaLogo = () => (
  <svg width="88" height="88" viewBox="0 0 100 100" fill="none">
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const offset = i * 2.2;
      const opacity = 1 - i * 0.05;
      return (
        <path
          key={i}
          d={`M 50 ${18 + offset} C ${18 + offset} ${18 + offset}, ${18 + offset} 50, 50 50 C ${18 + offset} 50, ${18 + offset} ${82 - offset}, 50 ${82 - offset} C ${82 - offset} ${82 - offset}, ${82 - offset} 50, 50 50 C ${82 - offset} 50, ${82 - offset} ${18 + offset}, 50 ${18 + offset} Z`}
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={opacity}
        />
      );
    })}
  </svg>
);

const ScanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3H5a2 2 0 00-2 2v2" />
    <path d="M17 3h2a2 2 0 012 2v2" />
    <path d="M7 21H5a2 2 0 01-2-2v-2" />
    <path d="M17 21h2a2 2 0 002-2v-2" />
    <circle cx="9" cy="9" r="1" fill="#8E8E93" />
    <circle cx="15" cy="9" r="1" fill="#8E8E93" />
    <path d="M9 15c.83.67 2 1 3 1s2.17-.33 3-1" />
  </svg>
);
const TimerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M9 2h6" />
    <path d="M12 2v2" />
  </svg>
);
const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    minHeight: "-webkit-fill-available",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
    maxWidth: "430px",
    margin: "0 auto",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 24px",
  },
  logoContainer: { marginBottom: "32px" },
  headlineContainer: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" },
  headlineFixed: { fontSize: "17px", fontWeight: 400, color: "#8E8E93", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.3 },
  headlineDynamic: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#0A84FF",
    margin: 0,
    marginTop: "6px",
    letterSpacing: "-0.02em",
    lineHeight: 1.3,
    transition: "opacity 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
    minHeight: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 16px",
  },
  tagline: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", color: "#636366", margin: 0, marginTop: "20px", textTransform: "uppercase" },
  footer: { padding: "24px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  featuresContainer: { display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginBottom: "8px" },
  feature: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  featureLabel: { fontSize: "11px", fontWeight: 500, color: "#636366", letterSpacing: "-0.01em" },
  separator: { width: "1px", height: "28px", backgroundColor: "#38383A" },
  ctaButton: {
    width: "100%",
    height: "50px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    color: "#000000",
    fontSize: "17px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    cursor: "pointer",
    transition: "transform 0.1s cubic-bezier(0.25, 0.1, 0.25, 1)",
    WebkitTapHighlightColor: "transparent",
  },
  textLink: { background: "none", border: "none", color: "#0A84FF", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.01em", cursor: "pointer", padding: "8px 16px", WebkitTapHighlightColor: "transparent" },
  legal: { fontSize: "11px", fontWeight: 400, color: "#48484A", margin: 0 },
};

export default WelcomeScreen;
