/**
 * Hook unifié pour gérer les skanes récents
 * Gère à la fois localStorage (guest) et Supabase (inscrit)
 * Respecte les règles NOKTA ONE : jamais d'état vide, max 3 entrées, temps relatif
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { getStoredSkanes } from '@/lib/skane/storage';
import type { SkaneResult } from '@/lib/skane/types';
import { getRecentSkanes } from '@/lib/supabase/skanes';
import { InternalState } from '@/lib/skane/types';
import { useTranslation, i18n } from './useTranslation';

export interface RecentSkaneDisplay {
  id: string;
  emoji: string;
  timeLabel: string; // "Just now", "5 min ago", "Today – 14:34"
  internalState: InternalState;
}

const STATE_EMOJI: Record<InternalState, string> = {
  HIGH_ACTIVATION: '😰',
  LOW_ENERGY: '😴',
  REGULATED: '😊',
};

/**
 * Formate le temps relatif selon les règles NOKTA ONE
 */
function formatRelativeTime(timestamp: Date, t: (key: string) => string): string {
  const now = new Date();
  
  // Vérifier que le timestamp est valide
  if (isNaN(timestamp.getTime())) {
    return '—';
  }
  
  const diffMs = now.getTime() - timestamp.getTime();
  
  // Vérifier que la différence est positive (pas de dates futures)
  if (diffMs < 0) {
    return '—';
  }
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Même jour, même heure → "Just now"
  if (diffMins < 1) {
    const translated = t('home.justNow');
    return translated !== 'home.justNow' ? translated : 'Just now';
  }

  // Même jour, < 60 min → "X min ago"
  if (diffMins < 60 && now.toDateString() === timestamp.toDateString()) {
    const translated = t('home.minutesAgo');
    if (translated !== 'home.minutesAgo' && translated.includes('{{count}}')) {
      return translated.replace('{{count}}', String(diffMins));
    }
    return `${diffMins} min ago`;
  }

  // Aujourd'hui → "Today – HH:mm"
  if (now.toDateString() === timestamp.toDateString()) {
    const timeStr = timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const translated = t('home.todayAt');
    if (translated !== 'home.todayAt' && translated.includes('{{time}}')) {
      return translated.replace('{{time}}', timeStr);
    }
    return `Today – ${timeStr}`;
  }

  // Hier → "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (timestamp.toDateString() === yesterday.toDateString()) {
    const translated = t('home.yesterday');
    return translated !== 'home.yesterday' ? translated : 'Yesterday';
  }

  // Plus ancien → "X days ago"
  const translated = t('home.daysAgo');
  if (translated !== 'home.daysAgo' && translated.includes('{{count}}')) {
    return translated.replace('{{count}}', String(diffDays));
  }
  return `${diffDays} days ago`;
}

export function useRecentSkanes(): {
  recentSkanes: RecentSkaneDisplay[];
  isLoading: boolean;
} {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const [recentSkanes, setRecentSkanes] = useState<RecentSkaneDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tRef = useRef(t);
  const languageRef = useRef(i18n.language);

  // Mettre à jour la ref quand t ou la langue change
  useEffect(() => {
    tRef.current = t;
    languageRef.current = i18n.language;
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const fetchSkanes = async () => {
      setIsLoading(true);
      try {
        let skanes: SkaneResult[] = [];

        if (user?.id) {
          // Utilisateur inscrit : récupérer depuis Supabase
          try {
            const supabaseSkanes = await getRecentSkanes(user.id, 3);
            // Convertir RecentSkane[] en SkaneResult[] pour formatage
            skanes = supabaseSkanes.map((s) => ({
              id: s.id,
              timestamp: new Date(s.created_at),
              internalState: s.internal_state,
              microAction: 'physiological_sigh' as any, // Pas utilisé pour l'affichage
              isGuestMode: false,
              skaneIndexBefore: s.skane_index,
            }));
          } catch (error) {
            console.error('Error fetching from Supabase, falling back to localStorage:', error);
            // Fallback sur localStorage en cas d'erreur
            skanes = getStoredSkanes();
          }
        } else {
          // Mode guest : récupérer depuis localStorage
          skanes = getStoredSkanes();
        }

        // Filtrer les skanes avec timestamp valide et trier par timestamp (plus récent en premier)
        const validSkanes = skanes.filter(skane => {
          const ts = skane.timestamp instanceof Date ? skane.timestamp : new Date(skane.timestamp);
          return !isNaN(ts.getTime());
        });
        
        validSkanes.sort((a, b) => {
          const tsA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
          const tsB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
          return tsB.getTime() - tsA.getTime();
        });

        // Limiter à 3 entrées max
        const limitedSkanes = validSkanes.slice(0, 3);

        // Formater pour l'affichage (utiliser tRef.current pour éviter la dépendance)
        const formatted: RecentSkaneDisplay[] = limitedSkanes.map((skane) => {
          const ts = skane.timestamp instanceof Date ? skane.timestamp : new Date(skane.timestamp);
          return {
            id: skane.id,
            emoji: STATE_EMOJI[skane.internalState] || '😊',
            timeLabel: formatRelativeTime(ts, tRef.current),
            internalState: skane.internalState,
          };
        });

        if (isMounted) {
          setRecentSkanes(formatted);
        }
      } catch (error) {
        console.error('Error fetching recent skanes:', error);
        if (isMounted) {
          setRecentSkanes([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSkanes();

    return () => {
      isMounted = false;
    };
  }, [user?.id, i18n.language]);

  return {
    recentSkanes,
    isLoading,
  };
}
