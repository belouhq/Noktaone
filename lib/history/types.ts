// ============================================
// TYPES - Historique & Stats Nokta
// ============================================

// États internes possibles
export type InternalState = 'HIGH_ACTIVATION' | 'LOW_ENERGY' | 'REGULATED';

// Mapping état → emoji + label
export const STATE_MAP: Record<InternalState, { emoji: string; label: string; labelEn: string }> = {
  HIGH_ACTIVATION: { emoji: '😤', label: 'Tendu', labelEn: 'Tense' },
  LOW_ENERGY: { emoji: '😴', label: 'Fatigué', labelEn: 'Tired' },
  REGULATED: { emoji: '😌', label: 'Calme', labelEn: 'Calm' },
};

// Mapping date relative → label FR
export const DATE_LABELS: Record<string, string> = {
  today: "Aujourd'hui",
  yesterday: 'Hier',
};

// Un skane dans l'historique
export interface HistorySkane {
  id: string;
  startedAt: Date;
  stateInternal: InternalState | null;
  skaneIndexBefore: number | null;
  skaneIndexAfter: number | null;
  delta: number;
  wasShared: boolean;
  dateRelative: string;
  timeFormatted: string;
  // Computed
  emoji: string;
  stateLabel: string;
  dateLabel: string;
  deltaFormatted: string;
}

// Stats utilisateur
export interface UserStats {
  streakCurrent: number;
  streakBest: number;
  totalSkanes: number;
  averageImprovement: number;
  lastSkaneDate: Date | null;
}

// Réponse brute Supabase pour historique
export interface HistoryRowRaw {
  id: string;
  started_at: string;
  state_internal: InternalState | null;
  skane_index_before: number | null;
  skane_index_after: number | null;
  delta: number;
  was_shared: boolean;
  date_relative: string;
  time_formatted: string;
}

// Réponse brute Supabase pour stats
export interface StatsRowRaw {
  streak_current: number;
  streak_best: number;
  total_skanes: number;
  average_improvement: number;
  last_skane_date: string | null;
}

// Groupe de skanes par date (pour affichage)
export interface HistoryGroup {
  dateLabel: string;
  dateKey: string;
  skanes: HistorySkane[];
}

// État du hook useHistory
export interface HistoryState {
  skanes: HistorySkane[];
  groups: HistoryGroup[];
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

// ============================================
// HELPERS
// ============================================

/**
 * Transforme une row Supabase en HistorySkane
 */
export function transformHistoryRow(row: HistoryRowRaw): HistorySkane {
  const state = row.state_internal || 'REGULATED';
  const stateInfo = STATE_MAP[state] || STATE_MAP.REGULATED;

  // Date label
  let dateLabel = row.date_relative;
  if (DATE_LABELS[row.date_relative]) {
    dateLabel = DATE_LABELS[row.date_relative];
  } else {
    // Format: "Il y a X jours" ou date complète
    const date = new Date(row.started_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      dateLabel = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      dateLabel = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      });
    }
  }

  // Delta formaté
  const delta = row.delta || 0;
  const deltaFormatted = delta >= 0 ? `+${delta}%` : `${delta}%`;

  return {
    id: row.id,
    startedAt: new Date(row.started_at),
    stateInternal: row.state_internal,
    skaneIndexBefore: row.skane_index_before,
    skaneIndexAfter: row.skane_index_after,
    delta,
    wasShared: row.was_shared,
    dateRelative: row.date_relative,
    timeFormatted: row.time_formatted,
    emoji: stateInfo.emoji,
    stateLabel: stateInfo.label,
    dateLabel,
    deltaFormatted,
  };
}

/**
 * Transforme les stats raw en UserStats
 */
export function transformStats(row: StatsRowRaw | null): UserStats {
  if (!row) {
    return {
      streakCurrent: 0,
      streakBest: 0,
      totalSkanes: 0,
      averageImprovement: 0,
      lastSkaneDate: null,
    };
  }

  return {
    streakCurrent: row.streak_current || 0,
    streakBest: row.streak_best || 0,
    totalSkanes: row.total_skanes || 0,
    averageImprovement: row.average_improvement || 0,
    lastSkaneDate: row.last_skane_date ? new Date(row.last_skane_date) : null,
  };
}

/**
 * Groupe les skanes par date
 */
export function groupSkanesByDate(skanes: HistorySkane[]): HistoryGroup[] {
  const groups: Map<string, HistorySkane[]> = new Map();

  skanes.forEach((skane) => {
    const key = skane.dateRelative;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(skane);
  });

  return Array.from(groups.entries()).map(([dateKey, groupSkanes]) => ({
    dateKey,
    dateLabel: groupSkanes[0]?.dateLabel || dateKey,
    skanes: groupSkanes,
  }));
}

/**
 * Formate l'amélioration moyenne pour affichage
 */
export function formatAverageImprovement(avg: number): string {
  if (avg === 0) return '-';
  return avg >= 0 ? `+${Math.round(avg)}%` : `${Math.round(avg)}%`;
}
