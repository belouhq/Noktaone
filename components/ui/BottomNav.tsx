'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/hooks/useTranslation';

// ============================================
// BOTTOM NAV - TRANSPARENT & ADAPTIVE
// Fond transparent, s'adapte au fond de la page. Router ou onNavigate.
// ============================================

const NOKTA_BLUE = '#0A84FF';

export type NavPageId = 'home' | 'skane' | 'settings';

const PATHS: Record<NavPageId, string> = {
  home: '/',
  skane: '/skane',
  settings: '/settings',
};

/** "tesla" = point actif + couleurs. "simple" = opacity 0.5/1. "v4" = barre 430px, point -4px. */
export type BottomNavVariant = 'tesla' | 'simple' | 'v4';

interface BottomNavProps {
  /** Page courante (ou déduite du pathname si absent) */
  currentPage?: NavPageId;
  /** Si fourni : navigation par callback. Sinon : router.push(path) — Paramètres → /settings */
  onNavigate?: (pageId: NavPageId) => void;
  /** "dark" = fond noir, "light" = fond blanc (ex. pendant Skane) */
  theme?: 'dark' | 'light';
  /** Masquer l’onglet Skane sur home/skane */
  hideSkaneOnHomeAndSkane?: boolean;
  variant?: BottomNavVariant;
}

export function BottomNav({
  currentPage: currentPageProp,
  onNavigate,
  theme = 'dark',
  hideSkaneOnHomeAndSkane,
  variant = 'tesla',
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const isCallbackMode = typeof onNavigate === 'function';
  const isSimple = variant === 'simple';
  const isV4 = variant === 'v4';
  const useBar430 = isSimple || isV4;
  const inactiveColor = theme === 'light' ? '#000000' : '#6E6E73';

  const currentPage: NavPageId = isCallbackMode
    ? (currentPageProp ?? 'home')
    : currentPageProp ?? (pathname === '/' ? 'home' : pathname.startsWith('/skane') ? 'skane' : pathname.startsWith('/settings') ? 'settings' : 'home');

  const shouldHideSkane =
    hideSkaneOnHomeAndSkane !== false && !isCallbackMode && (pathname === '/' || pathname.startsWith('/skane'));

  const items: Array<{ id: NavPageId; labelKey: 'nav.home' | 'nav.skane' | 'nav.settings'; path: string }> = [
    { id: 'home', labelKey: 'nav.home', path: PATHS.home },
    { id: 'skane', labelKey: 'nav.skane', path: PATHS.skane },
    { id: 'settings', labelKey: 'nav.settings', path: PATHS.settings },
  ].filter((item) => !(item.id === 'skane' && shouldHideSkane));

  const handleClick = (id: NavPageId, path: string) => {
    if (navigator.vibrate) navigator.vibrate(5);
    if (isCallbackMode && onNavigate) {
      onNavigate(id);
    } else {
      router.push(path);
    }
  };

  const wrapperStyle: React.CSSProperties | undefined = useBar430
    ? {
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        paddingBottom: 'var(--safe-area-bottom, 0px)',
        backgroundColor: '#000000',
        borderTop: '1px solid #1C1C1E',
        zIndex: 50,
        pointerEvents: 'auto',
      }
    : undefined;

  const navBarStyle = isSimple
    ? { ...styles.navBar, padding: '12px 0 28px' as const }
    : isV4
      ? { ...styles.navBar, padding: '8px 0 28px' as const }
      : styles.navBar;

  const navItemStyle = isV4
    ? { ...styles.navItem, padding: '8px 28px' as const }
    : styles.navItem;

  return (
    <div className={useBar430 ? undefined : 'bottom-nav-container'} style={wrapperStyle ?? undefined}>
      <nav
        role="navigation"
        aria-label="Navigation principale"
        style={navBarStyle}
      >
        {items.map(({ id, labelKey, path }) => {
          const isActive = currentPage === id;
          const itemOpacity = isSimple ? (isActive ? 1 : 0.5) : undefined;
          const itemColor = isActive ? NOKTA_BLUE : inactiveColor;
          return (
            <button
              key={id}
              type="button"
              data-nav-button={id}
              data-nav-path={path}
              style={{
                ...navItemStyle,
                ...(itemOpacity !== undefined && { opacity: itemOpacity }),
                transition: 'opacity 0.2s ease',
              }}
              onClick={() => handleClick(id, path)}
              aria-label={t(labelKey)}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && isV4 && <div style={styles.activeIndicatorV4} />}
              <div
                style={{
                  ...styles.iconWrapper,
                  color: itemColor,
                }}
              >
                {id === 'home' && <HomeIcon filled={isActive} />}
                {id === 'skane' && <SkaneIcon filled={isActive} />}
                {id === 'settings' && <SettingsIcon filled={isActive} />}
              </div>
              <span
                style={{
                  ...styles.navLabel,
                  color: itemColor,
                }}
              >
                {t(labelKey)}
              </span>
              {isActive && variant === 'tesla' && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Icônes Tesla (inline, style BottomNavBar)
function HomeIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={filled ? 2 : 1.5}
    >
      {filled ? (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="currentColor" stroke="currentColor" />
          <path d="M9 22V12h6v10" stroke="#000000" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </>
      )}
    </svg>
  );
}

function SkaneIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={filled ? 2 : 1.5}
      strokeLinecap="round"
    >
      <path d="M3 8V5a2 2 0 012-2h3" />
      <path d="M16 3h3a2 2 0 012 2v3" />
      <path d="M3 16v3a2 2 0 002 2h3" />
      <path d="M16 21h3a2 2 0 002-2v-3" />
      <circle cx="9" cy="10" r={filled ? 1.5 : 1} fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r={filled ? 1.5 : 1} fill="currentColor" stroke="none" />
      <path d="M9 15c.83.67 2 1 3 1s2.17-.33 3-1" strokeWidth={filled ? 2 : 1.5} />
    </svg>
  );
}

function SettingsIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={filled ? 2 : 1.5}
    >
      {filled ? (
        <>
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </>
      )}
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  navBar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 0 28px',
    backgroundColor: '#000000',
    borderTop: '1px solid #1C1C1E',
    width: '100%',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 24px',
    position: 'relative',
    transition: 'transform 0.2s ease',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: 500,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    transition: 'color 0.2s ease',
  },
  activeIndicator: {
    position: 'absolute',
    top: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: NOKTA_BLUE,
  },
  activeIndicatorV4: {
    position: 'absolute' as const,
    top: '-4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: NOKTA_BLUE,
  },
};

export default BottomNav;
