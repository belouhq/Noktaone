"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// FAQ PAGE - NOKTA ONE
// Style aligné sur la page Paramètres
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

const ChevronRightIcon = ({ rotate }: { rotate?: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#636366"
    strokeWidth="2"
    style={{
      transform: rotate ? "rotate(90deg)" : "rotate(0)",
      transition: "transform 0.2s ease",
      flexShrink: 0,
    }}
  >
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="2">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    maxWidth: "430px",
    margin: "0 auto",
    paddingBottom: "100px",
  },
  subPageHeader: {
    padding: "60px 24px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    color: "#0A84FF",
    fontSize: "17px",
    cursor: "pointer",
    padding: 0,
  },
  subPageTitle: { fontSize: "28px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" },
  content: { padding: "0 24px" },
  section: { marginBottom: "32px" },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "12px",
    paddingLeft: "4px",
  },
  settingsGroup: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  faqItem: {
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  faqItemLast: {
    borderBottom: "none",
  },
  faqQuestion: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    gap: "12px",
    fontFamily: "inherit",
  },
  faqQuestionText: {
    flex: 1,
    lineHeight: 1.4,
  },
  faqAnswer: {
    overflow: "hidden",
    transition: "max-height 0.3s ease",
  },
  faqAnswerInner: {
    padding: "0 20px 20px",
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: "15px",
    color: "#8E8E93",
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: "pre-line",
  },
  contactSection: {
    marginTop: "24px",
    padding: "24px",
    backgroundColor: "rgba(255,255,255,0.05)",
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
    backgroundColor: "#0A84FF",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  isLast,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div style={{ ...styles.faqItem, ...(isLast ? styles.faqItemLast : {}) }}>
      <button
        type="button"
        style={styles.faqQuestion}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span style={styles.faqQuestionText}>{question}</span>
        <ChevronRightIcon rotate={isOpen} />
      </button>
      <div
        style={{
          ...styles.faqAnswer,
          maxHeight: isOpen ? "800px" : "0px",
        }}
      >
        <div style={styles.faqAnswerInner}>
          <p style={styles.faqAnswerText}>{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaContainer currentPage="settings">
      <div style={styles.container}>
        <header style={styles.subPageHeader}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => router.back()}
            aria-label={t("common.back")}
          >
            <ChevronLeftIcon />
            <span>{t("common.back")}</span>
          </button>
          <h1 style={styles.subPageTitle}>{t("faq.title")}</h1>
        </header>

        <div style={styles.content}>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{t("faq.subtitle").toUpperCase()}</h2>
            <div style={styles.settingsGroup}>
              {FAQ_ITEM_KEYS.map((key, index) => (
                <FAQItem
                  key={key}
                  question={t(`faq.${key}.question`)}
                  answer={t(`faq.${key}.answer`)}
                  isOpen={expandedIndex === index}
                  onToggle={() => toggleQuestion(index)}
                  isLast={index === FAQ_ITEM_KEYS.length - 1}
                />
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.contactSection}>
              <p style={styles.contactText}>{t("faq.moreQuestions")}</p>
              <button
                type="button"
                style={styles.contactButton}
                onClick={() => router.push("/settings")}
              >
                <MessageIcon />
                <span>{t("faq.contactUs")}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </SafeAreaContainer>
  );
}
