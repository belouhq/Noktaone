'use client';

import { useState, useEffect } from 'react';

interface UseCountdownReturn {
  timeRemaining: string;
  isExpired: boolean;
  secondsRemaining: number;
}

/**
 * Hook pour gérer un compte à rebours
 * @param targetDate Date cible pour le compte à rebours
 * @returns Objet avec timeRemaining (format HH:MM:SS), isExpired, et secondsRemaining
 */
export function useCountdown(targetDate: Date): UseCountdownReturn {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeRemaining('00:00:00');
        setSecondsRemaining(0);
        return;
      }

      setIsExpired(false);
      setSecondsRemaining(Math.floor(difference / 1000));

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeRemaining(formatted);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return { timeRemaining, isExpired, secondsRemaining };
}
