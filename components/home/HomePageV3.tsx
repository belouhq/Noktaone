"use client";

import React from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// NOKTA ONE - PAGES FINALES V5
// ============================================
// ✅ Logo "NOKTA ONE" en haut à gauche (police High Cruiser)
// ✅ Bouton (?) aide en haut à droite
// ✅ Bouton Skane EN BAS (zone du pouce)
// ✅ Navigation 3 onglets : Accueil | Skane | Paramètres
// ✅ Couleur BLEUE CYAN quand actif (#0A84FF)
// ✅ Icône Skane avec yeux en points remplis
// ✅ PAS DE SCORES sur l'accueil
// ============================================

// Couleur bleue Nokta One (iOS system blue)
const NOKTA_BLUE = "#0A84FF";
const INACTIVE_COLOR = "#6E6E73";

// ============================================
// ICÔNES SVG
// ============================================

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SkaneIconLarge = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? NOKTA_BLUE : INACTIVE_COLOR}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const SkaneIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? NOKTA_BLUE : INACTIVE_COLOR}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 8V6a2 2 0 012-2h2" />
    <path d="M16 4h2a2 2 0 012 2v2" />
    <path d="M4 16v2a2 2 0 002 2h2" />
    <path d="M16 20h2a2 2 0 002-2v-2" />
    <circle cx="9" cy="10" r="1.5" fill={active ? NOKTA_BLUE : INACTIVE_COLOR} stroke="none" />
    <circle cx="15" cy="10" r="1.5" fill={active ? NOKTA_BLUE : INACTIVE_COLOR} stroke="none" />
    <path d="M9 15c1 1 2.5 1.5 3 1.5s2-.5 3-1.5" />
  </svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? NOKTA_BLUE : INACTIVE_COLOR}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

// ============================================
// ANIMATIONS CSS
// ============================================

const animations = `
  @keyframes glowPulse {
    0%, 100% {
      box-shadow: 0 0 15px rgba(10, 132, 255, 0.3), 0 0 30px rgba(10, 132, 255, 0.15);
    }
    50% {
      box-shadow: 0 0 25px rgba(10, 132, 255, 0.5), 0 0 50px rgba(10, 132, 255, 0.25);
    }
  }
`;

// ============================================
// BOTTOM NAVIGATION
// ============================================

const NAV_PATHS: Record<string, string> = {
  home: "/home",
  skane: "/home?tab=skane",
  settings: "/settings",
};

export const BottomNav = ({
  currentPage = "home",
  onNavigate = () => {},
}: {
  currentPage?: string;
  onNavigate?: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const navItems = [
    { id: "home", label: t("nav.home"), Icon: HomeIcon },
    { id: "skane", label: t("nav.skaneboard"), Icon: SkaneIcon },
    { id: "settings", label: t("nav.settings"), Icon: SettingsIcon },
  ];

  return (
    <nav style={styles.bottomNav}>
      {navItems.map(({ id, label, Icon }) => {
        const isActive = currentPage === id;
        return (
          <button
            key={id}
            style={styles.navItem}
            data-nav-button
            data-nav-path={NAV_PATHS[id] ?? "/"}
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(5);
              onNavigate(id);
            }}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon active={isActive} />
            <span style={{ ...styles.navLabel, color: isActive ? NOKTA_BLUE : INACTIVE_COLOR }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

// ============================================
// PAGE HOME - ULTRA MINIMALISTE
// ============================================

export interface HomePageV3Props {
  onStartSkane?: () => void;
  onNavigate?: (key: string) => void;
  onHelp?: () => void;
}

export const HomePage = ({
  onStartSkane = () => {},
  onNavigate = () => {},
  onHelp = () => {},
}: HomePageV3Props) => {
  const { t } = useTranslation();
  const handleStartSkane = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([10, 30, 10]);
    onStartSkane();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.logo}>NOKTA ONE</span>
        <button style={styles.helpButton} onClick={onHelp} aria-label={t("home.helpAria")}>
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
            <span style={styles.skaneButtonText}>Skane</span>
          </button>
        </div>
      </main>

      <BottomNav currentPage="home" onNavigate={onNavigate} />
      <style>{animations}</style>
    </div>
  );
};

// ============================================
// PAGE SKANE - HISTORIQUE DES SKANES
// ============================================

export interface RecentSkaneItemV5 {
  id: number;
  date: string;
  time: string;
  emoji: string;
}

export interface SkanePageV3Props {
  recentSkanes?: RecentSkaneItemV5[];
  streak?: number;
  totalSkanes?: number;
  onStartSkane?: () => void;
  onNavigate?: (key: string) => void;
}

export const SkanePage = ({
  recentSkanes = [
    { id: 1, date: "Aujourd'hui", time: "14:34", emoji: "😌" },
    { id: 2, date: "Hier", time: "09:15", emoji: "😐" },
    { id: 3, date: "Il y a 2 jours", time: "20:30", emoji: "😌" },
  ],
  streak = 3,
  totalSkanes = 47,
  onStartSkane = () => {},
  onNavigate = () => {},
}: SkanePageV3Props) => {
  const { t } = useTranslation();
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.pageTitle}>Skane</span>
        <div style={{ width: 40 }} />
      </header>

      <main style={styles.contentSkane}>
        <section style={styles.historySection}>
          <h2 style={styles.sectionTitle}>{t("home.recentHistory")}</h2>
          <div style={styles.historyList}>
            {recentSkanes.map((skane) => (
              <div key={skane.id} style={styles.historyItem}>
                <div style={styles.historyLeft}>
                  <span style={styles.historyEmoji}>{skane.emoji}</span>
                  <div style={styles.historyInfo}>
                    <span style={styles.historyDate}>{skane.date}</span>
                    <span style={styles.historyTime}>{skane.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.statsSection}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{streak}</span>
            <span style={styles.statLabel}>{t("home.streakDays")}</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>{totalSkanes}</span>
            <span style={styles.statLabel}>{t("home.totalSkanes")}</span>
          </div>
        </section>

        <div style={styles.buttonWrapperSkane}>
          <button
            style={styles.skaneButtonSmall}
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([10, 30, 10]);
              onStartSkane();
            }}
            aria-label={t("home.newSkane")}
          >
            <SkaneIcon active={false} />
            <span style={styles.skaneButtonTextSmall}>{t("home.newSkane")}</span>
          </button>
        </div>
      </main>

      <BottomNav currentPage="skane" onNavigate={onNavigate} />
    </div>
  );
};

// ============================================
// STYLES
// ============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    flexDirection: "column",
    maxWidth: "430px",
    margin: "0 auto",
    position: "relative",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    paddingTop: "env(safe-area-inset-top, 16px)",
  },
  logo: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "#FFFFFF",
    fontFamily: "'High Cruiser', -apple-system, sans-serif",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  helpButton: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "1px solid #2C2C2E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#6E6E73",
    transition: "all 0.2s ease",
  },
  contentHome: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "0 20px",
    paddingBottom: "100px",
  },
  emptySpace: { flex: 1 },
  buttonWrapper: {
    display: "flex",
    justifyContent: "center",
    paddingBottom: "40px",
  },
  contentSkane: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "0 20px",
    paddingBottom: "100px",
    gap: "24px",
  },
  historySection: { marginTop: "8px" },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6E6E73",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "16px",
  },
  historyList: { display: "flex", flexDirection: "column" },
  historyItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid #1C1C1E",
  },
  historyLeft: { display: "flex", alignItems: "center", gap: "14px" },
  historyEmoji: { fontSize: "24px" },
  historyInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  historyDate: { fontSize: "15px", fontWeight: "500", color: "#FFFFFF" },
  historyTime: { fontSize: "13px", color: "#6E6E73" },
  statsSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "32px",
    padding: "24px",
    backgroundColor: "#1C1C1E",
    borderRadius: "16px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  statValue: { fontSize: "28px", fontWeight: "700", color: "#FFFFFF" },
  statLabel: { fontSize: "13px", color: "#6E6E73" },
  statDivider: {
    width: "1px",
    height: "40px",
    backgroundColor: "#2C2C2E",
  },
  skaneButton: {
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: `2px solid ${NOKTA_BLUE}`,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    animation: "glowPulse 2.5s ease-in-out infinite",
  },
  skaneButtonInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  skaneButtonText: {
    fontSize: "24px",
    fontWeight: "600",
    color: NOKTA_BLUE,
    letterSpacing: "0.05em",
  },
  buttonWrapperSkane: {
    display: "flex",
    justifyContent: "center",
    marginTop: "auto",
    paddingBottom: "20px",
  },
  skaneButtonSmall: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 32px",
    backgroundColor: "#1C1C1E",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    color: "#FFFFFF",
    transition: "all 0.2s ease",
  },
  skaneButtonTextSmall: { fontSize: "16px", fontWeight: "600", color: "#FFFFFF" },
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
    padding: "8px 0",
    paddingBottom: "max(28px, env(safe-area-inset-bottom))",
    backgroundColor: "transparent",
    zIndex: 100,
    pointerEvents: "auto",
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px 24px",
    position: "relative",
    transition: "all 0.2s ease",
    touchAction: "manipulation",
    pointerEvents: "auto",
  },
  navLabel: { fontSize: "10px", fontWeight: "500" },
};

// Compatibilité avec les imports existants
export const HomePageV3 = HomePage;
export const SkanePageV3 = SkanePage;

export default HomePage;
