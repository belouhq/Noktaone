/**
 * Supabase Tracker for SKANE - Version Complète
 * 
 * Gère le tracking complet des sessions SKANE, micro-actions, feedback,
 * algorithme de sélection, et toutes les métadonnées
 */

import { supabase } from '@/lib/supabase/client';
import { InternalState, MicroActionType, UserFeedback } from './types';

// ============================================
// Types
// ============================================

export interface SkaneSessionData {
  user_id?: string | null;
  guest_id?: string | null;
  mode: 'guest' | 'account';
  state_internal: InternalState;
  confidence?: number;
  signal_raw?: number;
  environment?: Record<string, any>; // {light: 'good', camera: 'ok', ...}
  version_algo?: string;
  before_score: number;
  after_score?: number;
  delta?: number;
}

export interface MicroActionEventData {
  user_id?: string | null;
  guest_id?: string | null;
  session_id: string;
  micro_action_id: MicroActionType;
  effect?: -1 | 0 | 1; // -1=pire, 0=pareil, 1=mieux
  effort?: 0 | 1 | 2; // 0=facile, 1=moyen, 2=dur
  mode: 'guest' | 'account';
  completed?: boolean;
  aborted_reason?: string;
  
  // Algorithme : décisions prises
  candidates_shown?: MicroActionType[];
  picked_action_id?: MicroActionType;
  selection_rule?: string; // 'top2_random', 'weighted', 'fallback', 'guest_mode'
  penalties_applied?: Record<string, number>; // {fatigue: -15, repetition: -5}
  user_lift_used?: boolean;
}

export interface ActionScore {
  actionId: MicroActionType;
  score: number;
  baseWeight: number;
  userLift: number;
  fatiguePenalty: number;
}

export interface ShareEventData {
  user_id?: string | null;
  guest_id?: string | null;
  session_id: string;
  share_type: 'story' | 'tiktok' | 'instagram' | 'twitter' | 'other';
  asset_url?: string;
  asset_id?: string;
}

// ============================================
// 1. Créer une session SKANE
// ============================================

export async function createSkaneSession(
  data: SkaneSessionData
): Promise<{ id: string } | null> {
  try {
    const sessionData: any = {
      user_id: data.user_id || null,
      guest_id: data.guest_id || null,
      mode: data.mode,
      state_internal: data.state_internal,
      confidence: data.confidence,
      signal_raw: data.signal_raw,
      environment: data.environment ? JSON.stringify(data.environment) : null,
      version_algo: data.version_algo || 'v1',
      before_score: data.before_score,
      after_score: data.after_score,
      delta: data.delta,
    };

    const { data: session, error } = await supabase
      .from('skane_sessions')
      .insert(sessionData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating skane session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error creating skane session:', error);
    return null;
  }
}

// ============================================
// 2. Mettre à jour une session SKANE (after_score)
// ============================================

export async function updateSkaneSession(
  sessionId: string,
  afterScore: number,
  beforeScore: number
): Promise<boolean> {
  try {
    const delta = afterScore - beforeScore;
    
    const { error } = await supabase
      .from('skane_sessions')
      .update({
        after_score: afterScore,
        delta: delta,
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating skane session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating skane session:', error);
    return false;
  }
}

// ============================================
// 3. Créer un événement micro-action
// ============================================

export async function createMicroActionEvent(
  data: MicroActionEventData
): Promise<{ id: string } | null> {
  try {
    const eventData: any = {
      user_id: data.user_id || null,
      guest_id: data.guest_id || null,
      session_id: data.session_id,
      micro_action_id: data.micro_action_id,
      mode: data.mode,
      completed: data.completed ?? false,
      aborted_reason: data.aborted_reason,
      candidates_shown: data.candidates_shown ? JSON.stringify(data.candidates_shown) : null,
      picked_action_id: data.picked_action_id,
      selection_rule: data.selection_rule,
      penalties_applied: data.penalties_applied ? JSON.stringify(data.penalties_applied) : null,
      user_lift_used: data.user_lift_used ?? false,
      started_at: new Date().toISOString(),
    };

    const { data: event, error } = await supabase
      .from('micro_action_events')
      .insert(eventData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating micro action event:', error);
      return null;
    }

    return event;
  } catch (error) {
    console.error('Error creating micro action event:', error);
    return null;
  }
}

// ============================================
// 4. Mettre à jour le feedback (effect)
// ============================================

export async function updateMicroActionFeedback(
  eventId: string,
  effect: -1 | 0 | 1,
  effort?: 0 | 1 | 2
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('micro_action_events')
      .update({
        effect,
        effort,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating feedback:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating feedback:', error);
    return false;
  }
}

// ============================================
// 5. Calculer user_lift pour une action
// ============================================

export async function getUserLift(
  userId: string | null,
  microActionId: MicroActionType,
  limit: number = 10
): Promise<number> {
  if (!userId) return 0;

  try {
    const { data, error } = await supabase
      .from('micro_action_events')
      .select('effect')
      .eq('user_id', userId)
      .eq('micro_action_id', microActionId)
      .not('effect', 'is', null)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return 0;
    }

    const avgEffect = data.reduce((sum, event) => sum + (event.effect || 0), 0) / data.length;
    return avgEffect * 10.0;
  } catch (error) {
    console.error('Error calculating user lift:', error);
    return 0;
  }
}

// ============================================
// 6. Calculer fatigue_penalty
// ============================================

export async function getFatiguePenalty(
  userId: string | null,
  microActionId: MicroActionType,
  lookbackSessions: number = 3
): Promise<number> {
  if (!userId) return 0;

  try {
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('skane_sessions')
      .select('id, started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(lookbackSessions);

    if (sessionsError || !recentSessions || recentSessions.length === 0) {
      return 0;
    }

    const sessionIds = recentSessions.map(s => s.id);

    const { data: events, error: eventsError } = await supabase
      .from('micro_action_events')
      .select('session_id')
      .eq('user_id', userId)
      .eq('micro_action_id', microActionId)
      .in('session_id', sessionIds);

    if (eventsError || !events) {
      return 0;
    }

    const recentCount = events.length;

    if (recentCount >= 3) return -30.0;
    if (recentCount >= 2) return -23.0;
    if (recentCount >= 1) return -15.0;

    return 0;
  } catch (error) {
    console.error('Error calculating fatigue penalty:', error);
    return 0;
  }
}

// ============================================
// 7. Récupérer les actions candidates pour un état
// ============================================

export async function getCandidatesForState(
  state: InternalState
): Promise<MicroActionType[]> {
  try {
    const { data, error } = await supabase
      .from('state_action_map')
      .select('micro_action_id')
      .eq('state', state)
      .order('priority', { ascending: true });

    if (error || !data) {
      return getFallbackCandidates(state);
    }

    return data.map(row => row.micro_action_id as MicroActionType);
  } catch (error) {
    console.error('Error getting candidates:', error);
    return getFallbackCandidates(state);
  }
}

function getFallbackCandidates(state: InternalState): MicroActionType[] {
  const mapping: Record<InternalState, MicroActionType[]> = {
    HIGH_ACTIVATION: ['physiological_sigh', 'expiration_3_8', 'drop_trapezes', 'shake_neuromusculaire'],
    LOW_ENERGY: ['respiration_2_1', 'posture_ancrage', 'ouverture_thoracique'],
    REGULATED: ['box_breathing', 'respiration_4_6', 'regard_fixe_expiration'],
  };
  return mapping[state];
}

// ============================================
// 8. Calculer les scores pour toutes les actions candidates
// ============================================

export async function calculateActionScores(
  state: InternalState,
  userId: string | null,
  isGuestMode: boolean
): Promise<ActionScore[]> {
  const candidates = await getCandidatesForState(state);

  const scores: ActionScore[] = [];

  for (const actionId of candidates) {
    const { data: action, error } = await supabase
      .from('micro_actions')
      .select('base_weight, is_enabled')
      .eq('id', actionId)
      .single();

    // Skip si action désactivée
    if (error || !action || !action.is_enabled) {
      continue;
    }

    const baseWeight = action.base_weight || 50.0;
    const userLift = isGuestMode ? 0 : await getUserLift(userId, actionId);
    const fatiguePenalty = isGuestMode ? 0 : await getFatiguePenalty(userId, actionId);

    const score = baseWeight + userLift + fatiguePenalty;

    scores.push({
      actionId,
      score,
      baseWeight,
      userLift,
      fatiguePenalty,
    });
  }

  return scores;
}

// ============================================
// 9. Sélectionner top-2 puis random (pondéré)
// ============================================

export interface SelectionResult {
  actionId: MicroActionType;
  candidates: MicroActionType[];
  selectionRule: string;
  penalties: Record<string, number>;
  userLiftUsed: boolean;
}

export async function selectBestAction(
  state: InternalState,
  userId: string | null,
  isGuestMode: boolean
): Promise<SelectionResult> {
  // Mode invité : top-2 global
  if (isGuestMode) {
    const guestActions: MicroActionType[] = ['physiological_sigh', 'box_breathing'];
    const randomIndex = Math.random() < 0.5 ? 0 : 1;
    return {
      actionId: guestActions[randomIndex],
      candidates: guestActions,
      selectionRule: 'guest_mode',
      penalties: {},
      userLiftUsed: false,
    };
  }

  const scores = await calculateActionScores(state, userId, isGuestMode);

  if (scores.length === 0) {
    // Fallback
    return {
      actionId: 'box_breathing',
      candidates: ['box_breathing'],
      selectionRule: 'fallback',
      penalties: {},
      userLiftUsed: false,
    };
  }

  scores.sort((a, b) => b.score - a.score);
  const top2 = scores.slice(0, 2);

  if (top2.length === 1) {
    return {
      actionId: top2[0].actionId,
      candidates: [top2[0].actionId],
      selectionRule: 'top1',
      penalties: {
        fatigue: top2[0].fatiguePenalty,
      },
      userLiftUsed: top2[0].userLift !== 0,
    };
  }

  // Sélection pondérée par score
  const totalScore = top2[0].score + top2[1].score;
  const prob1 = top2[0].score / totalScore;
  const selected = Math.random() < prob1 ? top2[0] : top2[1];

  return {
    actionId: selected.actionId,
    candidates: top2.map(s => s.actionId),
    selectionRule: 'top2_weighted',
    penalties: {
      fatigue: selected.fatiguePenalty,
    },
    userLiftUsed: selected.userLift !== 0,
  };
}

// ============================================
// 10. Tracker un partage
// ============================================

export async function createShareEvent(
  data: ShareEventData
): Promise<{ id: string } | null> {
  try {
    const { data: event, error } = await supabase
      .from('share_events')
      .insert({
        user_id: data.user_id || null,
        guest_id: data.guest_id || null,
        session_id: data.session_id,
        share_type: data.share_type,
        asset_url: data.asset_url,
        asset_id: data.asset_id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating share event:', error);
      return null;
    }

    // Mettre à jour la session pour marquer comme partagée
    await supabase
      .from('skane_sessions')
      .update({ is_share_triggered: true, share_asset_id: event.id })
      .eq('id', data.session_id);

    return event;
  } catch (error) {
    console.error('Error creating share event:', error);
    return null;
  }
}

// ============================================
// 11. Tracker une erreur
// ============================================

export async function logError(
  errorCode: string,
  errorMessage: string,
  screen: string,
  userId?: string | null,
  guestId?: string | null,
  deviceInfo?: Record<string, any>,
  stackTrace?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('error_events')
      .insert({
        user_id: userId || null,
        guest_id: guestId || null,
        error_code: errorCode,
        error_message: errorMessage.substring(0, 500), // Limiter la longueur
        screen,
        device_info: deviceInfo ? JSON.stringify(device_info) : null,
        stack_trace: stackTrace ? stackTrace.substring(0, 2000) : null,
      });

    if (error) {
      console.error('Error logging error event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error logging error:', error);
    return false;
  }
}

// ============================================
// 12. Helper: convertir UserFeedback en effect
// ============================================

export function feedbackToEffect(feedback: UserFeedback): -1 | 0 | 1 {
  switch (feedback) {
    case 'better': return 1;
    case 'same': return 0;
    case 'worse': return -1;
    default: return 0;
  }
}

// ============================================
// 13. Récupérer ou créer guest_id
// ============================================

export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';
  
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_id', guestId);
  }
  return guestId;
}

// ============================================
// 14. Récupérer user_id (si compte)
// ============================================

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId') || null;
}
