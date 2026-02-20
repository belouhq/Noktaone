"use client";

import React, { useState, useRef } from "react";
import { BottomNav, type NavPageId } from "./BottomNav";

// ============================================
// SWIPE + LAYOUT - NOKTA ONE
// SwipeablePages & AppLayout utilisent le BottomNav smart
// ============================================

export type { NavPageId } from "./BottomNav";

// ============================================
// 1. SWIPEABLE CONTAINER
// ============================================

interface SwipeablePagesProps {
  currentPage?: NavPageId;
  onPageChange?: (pageId: NavPageId) => void;
  children: Partial<Record<NavPageId, React.ReactNode>>;
}

export const SwipeablePages = ({
  currentPage = "home",
  onPageChange = () => {},
  children,
}: SwipeablePagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const pages: NavPageId[] = ["home", "skane", "settings"];
  const currentIndex = pages.indexOf(currentPage);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart == null) return;

    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    const diff = currentTouch - touchStart;

    if (
      (currentIndex === 0 && diff > 0) ||
      (currentIndex === pages.length - 1 && diff < 0)
    ) {
      setDragOffset(diff * 0.3);
    } else {
      setDragOffset(diff * 0.5);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);

    if (touchStart == null || touchEnd == null) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < pages.length - 1) {
      if (navigator.vibrate) navigator.vibrate(10);
      onPageChange(pages[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      if (navigator.vibrate) navigator.vibrate(10);
      onPageChange(pages[currentIndex - 1]);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const getTranslateX = () => {
    const baseTranslate = -currentIndex * 100;
    const width = containerRef.current?.offsetWidth ?? 400;
    const dragPercent = (dragOffset / width) * 100;
    return baseTranslate + dragPercent;
  };

  return (
    <div style={styles.swipeContainer} ref={containerRef}>
      <div
        style={{
          ...styles.pagesWrapper,
          transform: `translateX(${getTranslateX()}%)`,
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {pages.map((pageId) => (
          <div key={pageId} style={styles.page}>
            {children[pageId]}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 2. APP LAYOUT COMPLET (Swipe + BottomNav smart)
// ============================================

interface AppLayoutProps {
  initialPage?: NavPageId;
  homeContent?: React.ReactNode;
  skaneContent?: React.ReactNode;
  settingsContent?: React.ReactNode;
}

export const AppLayout = ({
  initialPage = "home",
  homeContent,
  skaneContent,
  settingsContent,
}: AppLayoutProps) => {
  const [currentPage, setCurrentPage] = useState<NavPageId>(initialPage);

  const handleNavigate = (pageId: NavPageId) => {
    setCurrentPage(pageId);
  };

  return (
    <div style={styles.appContainer}>
      <SwipeablePages
        currentPage={currentPage}
        onPageChange={handleNavigate}
        children={{
          home: homeContent,
          skane: skaneContent,
          settings: settingsContent,
        }}
      />

      <BottomNav
        currentPage={currentPage}
        onNavigate={(key) => handleNavigate(key as NavPageId)}
      />
    </div>
  );
};

// ============================================
// STYLES (swipe + layout uniquement)
// ============================================

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#000000",
    maxWidth: "430px",
    margin: "0 auto",
    overflow: "hidden",
    position: "relative",
  },
  swipeContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  pagesWrapper: {
    display: "flex",
    height: "100%",
    width: "300%",
  },
  page: {
    width: "33.333%",
    height: "100%",
    overflow: "auto",
    flexShrink: 0,
  },
};

// Alias pour usage direct de la barre avec callback
export const BottomNavBar = BottomNav;

export default AppLayout;
