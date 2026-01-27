"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// ÉCRAN FAQ - NOKTA ONE
// Style Tesla épuré
// ============================================

const FAQ_ITEM_KEYS = [
  "whatIsNokta",
  "whenUseful",
  "whyOffButOk",
  "differentFromOthers",
  "analyzeEmotions",
  "replaceProfessional",
  "whyBodyNotMind",
  "howOften",
  "forAthletesOnly",
  "dontBelieveBreathing",
  "whySoShort",
  "dataPrivacy",
  "allLanguages",
  "whoIsItFor",
  "whyNow",
] as const;

export const FAQScreen = ({
  onBack = () => {},
  onContact = () => {},
  onHome = () => {},
  onSkane = () => {},
  onSettings = () => {},
  activeNav = "settings",
}: {
  onBack?: () => void;
  onContact?: () => void;
  onHome?: () => void;
  onSkane?: () => void;
  onSettings?: () => void;
  activeNav?: "home" | "skane" | "settings";
}) => {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button
          type="button"
          style={styles.backButton}
          onClick={onBack}
          aria-label={t("common.back")}
        >
          <BackIcon />
        </button>
        <h1 style={styles.headerTitle}>{t("faq.title")}</h1>
        <div style={{ width: 44 }} />
      </header>

      <main style={styles.content}>
        <div style={styles.heroSection}>
          <span style={styles.heroLabel}>{t("faq.subtitle").toUpperCase()}</span>
          <p style={styles.heroSubtitle}>{t("faq.subtitleDesc")}</p>
        </div>

        <div style={styles.faqList}>
          {FAQ_ITEM_KEYS.map((key, index) => (
            <div key={key} style={styles.faqItem}>
              <button
                type="button"
                style={styles.faqQuestion}
                onClick={() => toggleQuestion(index)}
                aria-expanded={expandedIndex === index}
              >
                <span style={styles.faqQuestionText}>
                  {t(`faq.${key}.question`)}
                </span>
                <div
                  style={{
                    ...styles.faqIcon,
                    transform:
                      expandedIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronIcon />
                </div>
              </button>
              <div
                style={{
                  ...styles.faqAnswer,
                  maxHeight: expandedIndex === index ? "500px" : "0px",
                  opacity: expandedIndex === index ? 1 : 0,
                  paddingTop: expandedIndex === index ? "16px" : "0px",
                  paddingBottom: expandedIndex === index ? "20px" : "0px",
                }}
              >
                <p style={styles.faqAnswerText}>{t(`faq.${key}.answer`)}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.contactSection}>
          <p style={styles.contactText}>{t("faq.moreQuestions")}</p>
          <button type="button" style={styles.contactButton} onClick={onContact}>
            <MessageIcon />
            <span>{t("faq.contactUs")}</span>
          </button>
        </div>
      </main>

      <nav style={styles.bottomNav}>
        <button
          type="button"
          style={{
            ...styles.navItem,
            opacity: activeNav === "home" ? 1 : 0.5,
          }}
          onClick={onHome}
        >
          <HomeIcon />
          <span style={styles.navLabel}>{t("nav.home")}</span>
        </button>
        <button
          type="button"
          style={{
            ...styles.navItem,
            opacity: activeNav === "skane" ? 1 : 0.5,
          }}
          onClick={onSkane}
        >
          <SkaneIcon />
          <span style={styles.navLabel}>{t("nav.skane")}</span>
        </button>
        <button
          type="button"
          style={{
            ...styles.navItem,
            opacity: activeNav === "settings" ? 1 : 0.5,
          }}
          onClick={onSettings}
        >
          <SettingsIcon />
          <span style={styles.navLabel}>{t("nav.settings")}</span>
        </button>
      </nav>
    </div>
  );
};

const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFFFFF"
    strokeWidth="2"
  >
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6E6E73"
    strokeWidth="2"
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const MessageIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const HomeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const SkaneIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M3 8V5a2 2 0 012-2h3" />
    <path d="M16 3h3a2 2 0 012 2v3" />
    <path d="M3 16v3a2 2 0 002 2h3" />
    <path d="M16 21h3a2 2 0 002-2v-3" />
    <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    <path d="M9 15c.83.67 2 1 3 1s2.17-.33 3-1" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
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
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    paddingTop: "60px",
    position: "sticky",
    top: 0,
    backgroundColor: "#000000",
    zIndex: 10,
  },
  backButton: {
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  headerTitle: {
    fontSize: "17px",
    fontWeight: 600,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  content: {
    flex: 1,
    padding: "0 20px",
    paddingBottom: "120px",
    overflowY: "auto",
  },
  heroSection: {
    paddingTop: "20px",
    paddingBottom: "32px",
  },
  heroLabel: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#6E6E73",
    display: "block",
    marginBottom: "8px",
  },
  heroSubtitle: {
    fontSize: "15px",
    color: "#8E8E93",
    margin: 0,
    lineHeight: 1.5,
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
  },
  faqItem: {
    borderBottom: "1px solid #1C1C1E",
  },
  faqQuestion: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "20px 0",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    gap: "16px",
  },
  faqQuestionText: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#FFFFFF",
    lineHeight: 1.4,
    flex: 1,
  },
  faqIcon: {
    flexShrink: 0,
    transition: "transform 0.3s ease",
  },
  faqAnswer: {
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  faqAnswerText: {
    fontSize: "15px",
    color: "#8E8E93",
    lineHeight: 1.6,
    margin: 0,
    paddingRight: "36px",
    whiteSpace: "pre-line",
  },
  contactSection: {
    marginTop: "40px",
    padding: "24px",
    backgroundColor: "#1C1C1E",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  contactText: {
    fontSize: "15px",
    color: "#8E8E93",
    margin: 0,
    textAlign: "center",
  },
  contactButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 24px",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 0 28px",
    backgroundColor: "#000000",
    borderTop: "1px solid #1C1C1E",
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#FFFFFF",
    padding: "8px 16px",
  },
  navLabel: {
    fontSize: "10px",
    fontWeight: 500,
  },
};

export default FAQScreen;
