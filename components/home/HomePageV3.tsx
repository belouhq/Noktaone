"use client";

import React from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { BottomNav, type NavPageId } from "@/components/ui/BottomNav";

// ============================================
// NOKTA ONE - PAGES FINALES V4
// Logo "NOKTA ONE" en haut à gauche | (?) aide en haut à droite
// Bouton Skane EN BAS (zone du pouce) | Nav 3 onglets + point actif
// ============================================

export interface HomePageV3Props {
  onStartSkane?: () => void;
  onNavigate?: (pageId: NavPageId) => void;
  onHelp?: () => void;
}

export function HomePageV3({
  onStartSkane = () => {},
  onNavigate = () => {},
  onHelp = () => {},
}: HomePageV3Props) {
  const { t } = useTranslation();

  const handleStartSkane = () => {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    onStartSkane();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.logo}>{t("home.title")}</span>
        <button
          style={styles.helpButton}
          onClick={onHelp}
          aria-label={t("home.helpAria")}
        >
          <HelpIcon />
        </button>
      </header>

      <main style={styles.contentHome}>
        <div style={styles.emptySpace} />
        <div style={styles.buttonWrapper}>
          <button
            style={styles.skaneButton}
            onClick={handleStartSkane}
            aria-label={t("home.startSkaneAria")}
          >
            <div style={styles.pulseRing} />
            <div style={{ ...styles.pulseRing, animationDelay: "1s" }} />
            <div style={styles.skaneButtonInner}>
              <SkaneIconLarge />
              <span style={styles.skaneButtonText}>{t("nav.skane")}</span>
            </div>
          </button>
        </div>
      </main>

      <BottomNav variant="v4" currentPage="home" onNavigate={onNavigate} />

      <style>{pulseKeyframes}</style>
    </div>
  );
}

// ============================================
// PAGE SKANE - HISTORIQUE + STATS + BOUTON
// ============================================

export interface RecentSkaneItem {
  date: string;
  time: string;
  emoji: string;
}

export interface SkanePageV3Props {
  recentSkanes?: RecentSkaneItem[];
  streak?: number;
  totalSkanes?: number;
  onStartSkane?: () => void;
  onNavigate?: (pageId: NavPageId) => void;
}

export function SkanePageV3({
  recentSkanes = [
    { date: "Aujourd'hui", time: "14:34", emoji: "😌" },
    { date: "Hier", time: "09:15", emoji: "😐" },
    { date: "Il y a 2 jours", time: "20:30", emoji: "😌" },
  ],
  streak = 3,
  totalSkanes = 47,
  onStartSkane = () => {},
  onNavigate = () => {},
}: SkanePageV3Props) {
  const { t } = useTranslation();

  const handleStartSkane = () => {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    onStartSkane();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.pageTitle}>{t("nav.skane")}</span>
        <div style={{ width: 40 }} />
      </header>

      <main style={styles.contentSkane}>
        {recentSkanes && recentSkanes.length > 0 && (
          <section style={styles.section}>
            <span style={styles.sectionTitle}>
              {t("skane.recentActivity")}
            </span>
            <div style={styles.recentList}>
              {recentSkanes.slice(0, 3).map((skane, index) => (
                <div key={index} style={styles.recentItem}>
                  <span style={styles.recentEmoji}>{skane.emoji}</span>
                  <div style={styles.recentInfo}>
                    <span style={styles.recentDate}>{skane.date}</span>
                    <span style={styles.recentTime}>{skane.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={styles.statsCard}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{streak}</span>
            <span style={styles.statLabel}>{t("skane.streakDays")}</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>{totalSkanes}</span>
            <span style={styles.statLabel}>{t("skane.totalSkanes")}</span>
          </div>
        </section>

        <div style={{ flex: 1 }} />

        <div style={styles.buttonWrapper}>
          <button
            style={styles.skaneButton}
            onClick={handleStartSkane}
            aria-label={t("home.startSkaneAria")}
          >
            <div style={styles.pulseRing} />
            <div style={{ ...styles.pulseRing, animationDelay: "1s" }} />
            <div style={styles.skaneButtonInner}>
              <SkaneIconLarge />
              <span style={styles.skaneButtonText}>{t("nav.skane")}</span>
            </div>
          </button>
        </div>
      </main>

      <BottomNav variant="v4" currentPage="skane" onNavigate={onNavigate} />

      <style>{pulseKeyframes}</style>
    </div>
  );
}

// ============================================
// ICÔNES
// ============================================

function HelpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6E6E73"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SkaneIconLarge() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M3 8V5a2 2 0 012-2h3" />
      <path d="M16 3h3a2 2 0 012 2v3" />
      <path d="M3 16v3a2 2 0 002 2h3" />
      <path d="M16 21h3a2 2 0 002-2v-3" />
      <circle cx="9" cy="10" r="1.5" fill="#FFFFFF" stroke="none" />
      <circle cx="15" cy="10" r="1.5" fill="#FFFFFF" stroke="none" />
      <path d="M9 15c.83.67 2 1 3 1s2.17-.33 3-1" strokeWidth="2" />
    </svg>
  );
}

// ============================================
// ANIMATION V4 (opacity 0.2)
// ============================================

const pulseKeyframes = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.2;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
`;

// ============================================
// STYLES V4
// ============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    maxHeight: "100vh",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    maxWidth: "430px",
    margin: "0 auto",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    paddingTop: "60px",
    flexShrink: 0,
  },
  logo: {
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#FFFFFF",
    fontFamily: "'High Cruiser', -apple-system, sans-serif",
  },
  pageTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  helpButton: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "1px solid #2C2C2E",
    borderRadius: "50%",
    cursor: "pointer",
  },
  contentHome: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "0 20px",
    paddingBottom: "100px",
  },
  emptySpace: {
    flex: 1,
  },
  contentSkane: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "0 20px",
    paddingBottom: "100px",
    overflowY: "auto",
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "center",
    paddingBottom: "20px",
  },
  skaneButton: {
    position: "relative",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "2px solid #3C3C3E",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  skaneButtonInner: {
    width: "156px",
    height: "156px",
    borderRadius: "50%",
    backgroundColor: "#1C1C1E",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  skaneButtonText: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#FFFFFF",
    letterSpacing: "0.02em",
  },
  pulseRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.12)",
    animation: "pulse 2.5s ease-out infinite",
    pointerEvents: "none",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#6E6E73",
    marginBottom: "12px",
    display: "block",
  },
  recentList: {
    display: "flex",
    flexDirection: "column",
  },
  recentItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 0",
    borderBottom: "1px solid #1C1C1E",
  },
  recentEmoji: {
    fontSize: "24px",
  },
  recentInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  recentDate: {
    fontSize: "15px",
    fontWeight: 500,
    color: "#FFFFFF",
  },
  recentTime: {
    fontSize: "13px",
    color: "#6E6E73",
  },
  statsCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "32px",
    padding: "20px",
    backgroundColor: "#1C1C1E",
    borderRadius: "16px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6E6E73",
  },
  statDivider: {
    width: "1px",
    height: "40px",
    backgroundColor: "#2C2C2E",
  },
};

// Alias pour compatibilité
export { HomePageV3 as HomePage, SkanePageV3 as SkanePage };
export default { HomePageV3, SkanePageV3, HomePage: HomePageV3, SkanePage: SkanePageV3 };
