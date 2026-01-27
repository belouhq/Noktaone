// Hook pour gérer le cooldown SKANE

'use client';

import { useState, useEffect } from 'react';
import { SkaneFeedback } from '@/config/skane-cooldown';
import { getNextSkaneTime, formatTimeRemaining } from '@/config/skane-cooldown';

interface CooldownState {
  isOnCooldown: boolean;
  nextAvailableTime: Date | null;
  timeRemaining: string;
}

export function useSkaneCooldown(userId: string = 'default'): CooldownState & {
  setCooldown: (feedback: SkaneFeedback) => void;
  clearCooldown: () => void;
} {
  const STORAGE_KEY = `skane_cooldown_${userId}`;
  
  const [cooldownState, setCooldownState] = useState<CooldownState>({
    isOnCooldown: false,
    nextAvailableTime: null,
    timeRemaining: ''
  });

  // Charger le cooldown depuis localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const nextTime = new Date(stored);
        if (nextTime > new Date()) {
          setCooldownState({
            isOnCooldown: true,
            nextAvailableTime: nextTime,
            timeRemaining: formatTimeRemaining(nextTime)
          });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [STORAGE_KEY]);

  // Mettre à jour le temps restant chaque seconde
  useEffect(() => {
    if (!cooldownState.nextAvailableTime) return;

    // Mise à jour immédiate
    const updateRemaining = () => {
      const remaining = formatTimeRemaining(cooldownState.nextAvailableTime!);
      if (remaining === "Disponible") {
        setCooldownState({
          isOnCooldown: false,
          nextAvailableTime: null,
          timeRemaining: ''
        });
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setCooldownState(prev => ({ ...prev, timeRemaining: remaining }));
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000); // Toutes les secondes

    return () => clearInterval(interval);
  }, [cooldownState.nextAvailableTime, STORAGE_KEY]);

  const setCooldown = (feedback: SkaneFeedback) => {
    if (typeof window === 'undefined') return;
    
    const nextTime = getNextSkaneTime(feedback);
    if (nextTime) {
      localStorage.setItem(STORAGE_KEY, nextTime.toISOString());
      setCooldownState({
        isOnCooldown: true,
        nextAvailableTime: nextTime,
        timeRemaining: formatTimeRemaining(nextTime)
      });
    }
  };

  const clearCooldown = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEY);
    setCooldownState({
      isOnCooldown: false,
      nextAvailableTime: null,
      timeRemaining: ''
    });
  };

  return { ...cooldownState, setCooldown, clearCooldown };
}
