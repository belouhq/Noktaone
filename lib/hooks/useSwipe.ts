"use client";

import { useState, useRef, useEffect } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Distance minimale pour déclencher un swipe (px)
  velocityThreshold?: number; // Vitesse minimale (px/ms)
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
}: SwipeOptions = {}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd(null);
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    // Ne pas empêcher le scroll vertical par défaut
    // On laisse le navigateur gérer le scroll naturellement
    // Le swipe sera détecté uniquement si le mouvement est principalement horizontal
  };

  const onTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const endData = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setTouchEnd(endData);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: true });
    element.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", onTouchEnd);
    };
  }, [touchStart]);

  useEffect(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const time = touchEnd.time - touchStart.time;
    const velocity = distance / time;

    // Vérifier la distance minimale et la vitesse
    if (distance < minSwipeDistance || velocity < velocityThreshold) {
      return;
    }

    // Déterminer la direction principale
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (distanceX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (distanceX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      if (distanceY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (distanceY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchEnd, touchStart, minSwipeDistance, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return elementRef;
}
