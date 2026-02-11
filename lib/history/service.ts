// ============================================
// SERVICE - Historique Supabase
// ============================================

import { supabase } from '@/lib/supabase/client';
import {
  HistoryRowRaw,
  StatsRowRaw,
  HistorySkane,
  UserStats,
  transformHistoryRow,
  transformStats,
} from './types';

const PAGE_SIZE = 20;

class HistoryService {
  /**
   * Récupère l'historique des skanes d'un utilisateur
   */
  async getHistory(
    userId: string,
    limit: number = PAGE_SIZE,
    offset: number = 0
  ): Promise<{ skanes: HistorySkane[]; hasMore: boolean }> {
    const { data, error } = await supabase.rpc('get_user_history', {
      p_user_id: userId,
      p_limit: limit + 1,
      p_offset: offset,
    });

    if (error) {
      console.error('Error fetching history:', error);
      throw new Error('Impossible de charger l\'historique');
    }

    const rows = (data || []) as HistoryRowRaw[];
    const hasMore = rows.length > limit;
    const slicedRows = hasMore ? rows.slice(0, limit) : rows;

    return {
      skanes: slicedRows.map(transformHistoryRow),
      hasMore,
    };
  }

  /**
   * Récupère les stats de l'utilisateur
   */
  async getStats(userId: string): Promise<UserStats> {
    const { data, error } = await supabase.rpc('get_user_stats', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching stats:', error);
      return transformStats(null);
    }

    const row = Array.isArray(data) ? data[0] : data;
    return transformStats(row as StatsRowRaw | null);
  }

  /**
   * Récupère historique + stats en une fois
   */
  async getHistoryWithStats(
    userId: string,
    limit: number = PAGE_SIZE
  ): Promise<{ skanes: HistorySkane[]; stats: UserStats; hasMore: boolean }> {
    const [historyResult, stats] = await Promise.all([
      this.getHistory(userId, limit, 0),
      this.getStats(userId),
    ]);

    return {
      skanes: historyResult.skanes,
      stats,
      hasMore: historyResult.hasMore,
    };
  }

  /**
   * Charge plus de skanes (pagination)
   */
  async loadMore(
    userId: string,
    currentCount: number
  ): Promise<{ skanes: HistorySkane[]; hasMore: boolean }> {
    return this.getHistory(userId, PAGE_SIZE, currentCount);
  }

  /**
   * Récupère un skane spécifique (pour détail)
   */
  async getSkaneById(skaneId: string): Promise<HistorySkane | null> {
    const { data, error } = await supabase
      .from('skane_sessions')
      .select('id, started_at, state_internal, before_score, after_score, was_shared, validation_status')
      .eq('id', skaneId)
      .single();

    if (error || !data) {
      return null;
    }

    const row = data as Record<string, unknown>;
    const validationStatus = row.validation_status as string | undefined;
    if (validationStatus != null && validationStatus !== 'ok') return null;

    const before = (row.skane_index_before as number | undefined) ?? (row.before_score as number | undefined) ?? null;
    const after = (row.skane_index_after as number | undefined) ?? (row.after_score as number | undefined) ?? null;
    const delta =
      before != null && after != null && before > 0
        ? Math.round(((before - after) / before) * 100)
        : 0;

    const startedAt = new Date(row.started_at as string);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
    let dateRelative = 'today';
    if (diffDays === 1) dateRelative = 'yesterday';
    else if (diffDays > 1) dateRelative = startedAt.toISOString().split('T')[0];

    const historyRow: HistoryRowRaw = {
      id: row.id as string,
      started_at: row.started_at as string,
      state_internal: (row.state_internal as HistoryRowRaw['state_internal']) ?? null,
      skane_index_before: before,
      skane_index_after: after,
      delta,
      was_shared: Boolean(row.was_shared),
      date_relative: dateRelative,
      time_formatted: startedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    return transformHistoryRow(historyRow);
  }

  /**
   * Vérifie si le streak est cassé (à appeler au login)
   */
  async checkStreak(userId: string): Promise<{ isBroken: boolean; previousStreak: number }> {
    const { data } = await supabase
      .from('user_profile')
      .select('streak_current, last_skane_date')
      .eq('user_id', userId)
      .single();

    if (!data || !(data as { last_skane_date?: string }).last_skane_date) {
      return { isBroken: false, previousStreak: 0 };
    }

    const lastDate = new Date((data as { last_skane_date: string }).last_skane_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const current = (data as { streak_current?: number }).streak_current ?? 0;

    if (diffDays > 1 && current > 0) {
      return { isBroken: true, previousStreak: current };
    }

    return { isBroken: false, previousStreak: current };
  }
}

export const historyService = new HistoryService();
export default historyService;
