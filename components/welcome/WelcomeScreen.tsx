"use client";

import React, { useState, useEffect } from "react";

// ============================================
// NOKTA ONE - ÉCRAN D'ACCUEIL / WELCOME
// ✅ AUDIT UI APPLE-LIKE (dernier code reçu pour la page d'accueil)
// ============================================

const DYNAMIC_HEADLINES = [
  "un message te crispe.",
  "une réponse te bloque.",
  "une décision te paralyse.",
  "tu entres en réunion.",
  "un call t'a vidé.",
  "tu dois prendre la parole.",
  "tu scrolles sans t'en rendre compte.",
  "ton cerveau sature.",
  "tu switch d'un écran à l'autre.",
  "tu es au lit mais pas prêt à dormir.",
  "ton corps est fatigué mais pas ton mental.",
];

const DYNAMIC_HEADLINES_US = [
  "a message throws you off.",
  "you freeze on a decision.",
  "something triggers you.",
  "you walk into a meeting.",
  "a call drains you.",
  "you need to speak up.",
  "you catch yourself doom-scrolling.",
  "your brain feels overloaded.",
  "you're switching tabs nonstop.",
  "your body's tired but your mind won't stop.",
  "you're in bed but can't shut off.",
];

export const WelcomeScreen = ({
  onStart = () => {},
  onLogin = () => {},
  locale = "fr",
}: {
  onStart?: () => void;
  onLogin?: () => void;
  locale?: "fr" | "en";
}) => {
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [shownIndices, setShownIndices] = useState<number[]>([]);

  const headlines = locale === "en" ? DYNAMIC_HEADLINES_US : DYNAMIC_HEADLINES;

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
            {locale === "en" ? "Use Nokta One when" : "Utilise Nokta One quand"}
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
          <p style={styles.tagline}>Body Reset System</p>
        </div>
      </main>
      <footer style={styles.footer}>
        <div style={styles.featuresContainer}>
          <Feature icon={<ScanIcon />} label={locale === "en" ? "Face scan" : "Scan facial"} />
          <div style={styles.separator} />
          <Feature icon={<TimerIcon />} label={locale === "en" ? "30s action" : "Action 30s"} />
          <div style={styles.separator} />
          <Feature icon={<CheckIcon />} label={locale === "en" ? "Instant result" : "Résultat instantané"} />
        </div>
        <button
          type="button"
          style={styles.ctaButton}
          onClick={onStart}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {locale === "en" ? "Get Started" : "Commencer"}
        </button>
        <button type="button" style={styles.textLink} onClick={onLogin}>
          {locale === "en" ? "Already have an account?" : "Déjà un compte ?"}
        </button>
        <p style={styles.legal}>Wellness signal · Not medical advice</p>
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
