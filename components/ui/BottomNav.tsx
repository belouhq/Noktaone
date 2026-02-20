"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// BOTTOM NAVIGATION - TRANSPARENT & ADAPTIVE
// Fond transparent, s'adapte au fond de la page
// ============================================

const NOKTA_BLUE = "#0A84FF";

const PATHS: Record<string, string> = {
  home: "/home",
  skane: "/home?tab=skane", // Skaneboard = page Historique récent
  settings: "/settings",
  history: "/history",
};

export type NavPageId = "home" | "skane" | "settings" | "history";

export const BottomNav = ({
  currentPage = "home",
  onNavigate,
  theme = "dark", // "dark" (fond noir) ou "light" (fond blanc pendant Skane)
  variant, // ignoré, pour compat BottomNavBar / HomePageV3
}: {
  currentPage?: NavPageId;
  onNavigate?: (key: string) => void;
  theme?: "dark" | "light";
  variant?: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const handleNavigate = onNavigate ?? ((key: string) => router.push(PATHS[key] ?? "/"));
  const tabs = [
    { key: "home", label: t("nav.home"), icon: HomeIcon },
    { key: "skane", label: t("nav.skaneboard"), icon: SkaneIcon },
    { key: "settings", label: t("nav.settings"), icon: SettingsIcon },
  ];

  // Couleurs selon le thème
  const inactiveColor = theme === "light" ? "#000000" : "#6E6E73";

  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => {
        const isActive = currentPage === tab.key;
        const Icon = tab.icon;

        return (
          <button
            type="button"
            key={tab.key}
            style={styles.tab}
            data-nav-button
            data-nav-path={PATHS[tab.key] ?? "/"}
            onClick={(e) => {
              e.preventDefault();
              if (typeof navigator !== "undefined" && (navigator as any).vibrate) {
                (navigator as any).vibrate(5);
              }
              handleNavigate(tab.key);
            }}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Icône */}
            <div style={styles.iconWrapper}>
              <Icon active={isActive} inactiveColor={inactiveColor} />
            </div>

            {/* Label */}
            <span
              style={{
                ...styles.label,
                color: isActive ? NOKTA_BLUE : inactiveColor,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

// ============================================
// ICÔNES - Uniquement les traits en bleu
// ============================================

const HomeIcon = ({ active, inactiveColor = "#6E6E73" }: { active: boolean; inactiveColor?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? NOKTA_BLUE : inactiveColor}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const SkaneIcon = ({ active, inactiveColor = "#6E6E73" }: { active: boolean; inactiveColor?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? NOKTA_BLUE : inactiveColor}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 8V6a2 2 0 012-2h2" />
    <path d="M16 4h2a2 2 0 012 2v2" />
    <path d="M4 16v2a2 2 0 002 2h2" />
    <path d="M16 20h2a2 2 0 002-2v-2" />
    <circle cx="9" cy="10" r="1.5" fill={active ? NOKTA_BLUE : inactiveColor} stroke="none" />
    <circle cx="15" cy="10" r="1.5" fill={active ? NOKTA_BLUE : inactiveColor} stroke="none" />
    <path d="M9 15c1 1 2.5 1.5 3 1.5s2-.5 3-1.5" />
  </svg>
);

const SettingsIcon = ({ active, inactiveColor = "#6E6E73" }: { active: boolean; inactiveColor?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? NOKTA_BLUE : inactiveColor}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

// ============================================
// STYLES
// ============================================

const styles: Record<string, React.CSSProperties> = {
  nav: {
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
    paddingBottom: "28px", // Safe area iOS
    backgroundColor: "transparent", // Pas de fond
    zIndex: 100,
    pointerEvents: "auto",
  },
  tab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "8px 24px",
    background: "none",
    border: "none",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    pointerEvents: "auto",
  },
  iconWrapper: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: "10px",
    fontWeight: "500",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    transition: "color 0.2s ease",
  },
};

export default BottomNav;
