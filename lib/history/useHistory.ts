// ============================================
// HOOK - useHistory
// Gère le state de la page Historique
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { historyService } from './service';
import {
  HistorySkane,
  UserStats,
  HistoryGroup,
  HistoryState,
  groupSkanesByDate,
} from './types';

interface UseHistoryOptions {
  initialLimit?: number;
  autoLoad?: boolean;
}

interface UseHistoryReturn extends HistoryState {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  getSkaneById: (id: string) => HistorySkane | undefined;
}

export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { initialLimit = 20, autoLoad = true } = options;
  const { user } = useAuthContext();

  const [skanes, setSkanes] = useState<HistorySkane[]>([]);
  const [groups, setGroups] = useState<HistoryGroup[]>([]);
  const [stats, setStats] = useState<UserStats>({
    streakCurrent: 0,
    streakBest: 0,
    totalSkanes: 0,
    averageImprovement: 0,
    lastSkaneDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadInitial = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await historyService.getHistoryWithStats(user.id, initialLimit);

      setSkanes(result.skanes);
      setGroups(groupSkanesByDate(result.skanes));
      setStats(result.stats);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading history:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, initialLimit]);

  const loadMore = useCallback(async () => {
    if (!user?.id || !hasMore || isLoading) return;

    setIsLoading(true);

    try {
      const result = await historyService.loadMore(user.id, skanes.length);

      const newSkanes = [...skanes, ...result.skanes];
      setSkanes(newSkanes);
      setGroups(groupSkanesByDate(newSkanes));
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading more:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, skanes.length, hasMore, isLoading]);

  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  const getSkaneById = useCallback(
    (id: string): HistorySkane | undefined => skanes.find((s) => s.id === id),
    [skanes]
  );

  useEffect(() => {
    if (autoLoad) {
      loadInitial();
    }
  }, [autoLoad, loadInitial]);

  return {
    skanes,
    groups,
    stats,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    getSkaneById,
  };
}

// ============================================
// HOOK - useUserStats (version légère)
// ============================================

export function useUserStats() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    historyService
      .getStats(user.id)
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  return { stats, isLoading };
}

// ============================================
// HOOK - useStreakCheck
// ============================================

export function useStreakCheck() {
  const { user } = useAuthContext();
  const [streakBroken, setStreakBroken] = useState<{
    isBroken: boolean;
    previousStreak: number;
  } | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    historyService
      .checkStreak(user.id)
      .then(setStreakBroken)
      .catch(console.error);
  }, [user?.id]);

  const dismiss = useCallback(() => {
    setStreakBroken(null);
  }, []);

  return { streakBroken, dismiss };
}

export default useHistory;
