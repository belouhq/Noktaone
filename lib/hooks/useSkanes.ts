'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { getRecentSkanes, getTodaySkanes, getNextResetTime } from '@/lib/supabase/skanes';
import { RecentSkane, Skane } from '@/lib/supabase/types';

interface UseSkanes {
  recentSkanes: RecentSkane[];
  todaySkanes: Skane[];
  loading: boolean;
  canReset: boolean;
  hoursUntilReset: number;
  refetch: () => Promise<void>;
}

export function useSkanes(): UseSkanes {
  const { user } = useAuthContext();
  const [recentSkanes, setRecentSkanes] = useState<RecentSkane[]>([]);
  const [todaySkanes, setTodaySkanes] = useState<Skane[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReset, setCanReset] = useState(true);
  const [hoursUntilReset, setHoursUntilReset] = useState(0);

  const fetchSkanes = useCallback(async () => {
    // Si pas d'utilisateur, utiliser le mode guest (localStorage)
    if (!user?.id) {
      // Fallback sur localStorage pour le mode guest
      setLoading(false);
      setCanReset(true);
      setHoursUntilReset(0);
      setRecentSkanes([]);
      setTodaySkanes([]);
      return;
    }

    setLoading(true);
    try {
      const [recent, today] = await Promise.all([
        getRecentSkanes(user.id, 5),
        getTodaySkanes(user.id),
      ]);

      setRecentSkanes(recent);
      setTodaySkanes(today);

      // Calculer le cooldown
      const lastSkane = today[0];
      if (lastSkane) {
        const { available, hoursRemaining } = getNextResetTime(new Date(lastSkane.created_at));
        setCanReset(available);
        setHoursUntilReset(hoursRemaining);
      } else {
        setCanReset(true);
        setHoursUntilReset(0);
      }
    } catch (error) {
      console.error('Error fetching skanes:', error);
      // En cas d'erreur, permettre le reset
      setCanReset(true);
      setHoursUntilReset(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSkanes();
  }, [fetchSkanes]);

  return {
    recentSkanes,
    todaySkanes,
    loading,
    canReset,
    hoursUntilReset,
    refetch: fetchSkanes,
  };
}
