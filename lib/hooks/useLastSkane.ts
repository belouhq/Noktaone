/**
 * Hook for "Last skane" display with strict state machine
 * STATE 0: no skane ever → "—"
 * STATE 1: at least one skane (guest) → emoji + relative time
 * STATE 2: signed user → backend history (fallback to local)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { getStoredSkanes } from '@/lib/skane/storage';
import type { SkaneResult } from '@/lib/skane/types';
import { getRecentSkanes } from '@/lib/supabase/skanes';
import { getGuestSkaneHistory, getFeedbackEmoji, type GuestSkaneItem } from '@/lib/skane/guest-cache';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import { useTranslation, i18n } from './useTranslation';

export interface LastSkaneDisplay {
  state: 0 | 1 | 2;
  emoji: string | null; // null for STATE 0
  timeLabel: string; // "—" for STATE 0, relative time for STATE 1/2
}

export function useLastSkane(): {
  lastSkane: LastSkaneDisplay;
  isLoading: boolean;
} {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const [lastSkane, setLastSkane] = useState<LastSkaneDisplay>({
    state: 0,
    emoji: null,
    timeLabel: t('home.lastSkaneEmpty') || '—',
  });
  const [isLoading, setIsLoading] = useState(true);
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const fetchLastSkane = async () => {
      setIsLoading(true);
      try {
        let lastItem: SkaneResult | GuestSkaneItem | null = null;

        if (user?.id) {
          // STATE 2: Signed user - try backend first
          try {
            const supabaseSkanes = await getRecentSkanes(user.id, 1);
            if (supabaseSkanes.length > 0) {
              const s = supabaseSkanes[0];
              lastItem = {
                id: s.id,
                timestamp: new Date(s.created_at),
                internalState: s.internal_state,
                microAction: 'physiological_sigh' as any,
                isGuestMode: false,
                skaneIndexBefore: s.skane_index,
                feedback: s.feedback || undefined,
              };
            }
          } catch (error) {
            console.error('Error fetching from Supabase, falling back to localStorage:', error);
          }

          // Fallback to local storage if backend failed
          if (!lastItem) {
            const localSkanes = getStoredSkanes();
            if (localSkanes.length > 0) {
              lastItem = localSkanes[0];
            }
          }
        } else {
          // STATE 1: Guest mode - check guest cache first, then localStorage
          const guestHistory = getGuestSkaneHistory();
          if (guestHistory.length > 0) {
            const guestItem = guestHistory[0];
            // Convert to SkaneResult format for consistency
            lastItem = {
              id: guestItem.id,
              timestamp: new Date(guestItem.ts),
              internalState: guestItem.mode || 'REGULATED',
              microAction: 'physiological_sigh' as any,
              isGuestMode: true,
              skaneIndexBefore: 0,
              feedback: guestItem.feedback || undefined,
            };
          } else {
            // Fallback to localStorage
            const localSkanes = getStoredSkanes();
            if (localSkanes.length > 0) {
              lastItem = localSkanes[0];
            }
          }
        }

        if (isMounted) {
          if (!lastItem) {
            // STATE 0: No skane ever
            setLastSkane({
              state: 0,
              emoji: null,
              timeLabel: tRef.current('home.lastSkaneEmpty') || '—',
            });
          } else {
            // STATE 1 or 2: At least one skane exists
            const ts = lastItem.timestamp instanceof Date 
              ? lastItem.timestamp 
              : new Date(lastItem.timestamp);
            
            const feedback = lastItem.feedback || null;
            const emoji = getFeedbackEmoji(feedback);
            const timeLabel = formatRelativeTime(ts, tRef.current);

            setLastSkane({
              state: user?.id ? 2 : 1,
              emoji,
              timeLabel,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching last skane:', error);
        if (isMounted) {
          setLastSkane({
            state: 0,
            emoji: null,
            timeLabel: tRef.current('home.lastSkaneEmpty') || '—',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLastSkane();

    return () => {
      isMounted = false;
    };
  }, [user?.id, i18n.language]);

  return {
    lastSkane,
    isLoading,
  };
}
