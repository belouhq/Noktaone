/**
 * SÉLECTEUR D'ACTION INTELLIGENT - NOKTA ONE
 * 
 * Algorithme de scoring multi-factoriel pour sélectionner la meilleure micro-action
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { MICRO_ACTIONS, STATE_TO_ACTIONS } from './constants';
import type { MicroActionType, InternalState } from './types';

export interface ActionSelectionInput {
  state: InternalState;
  physiologicalSignals: {
    facial?: {
      forehead_tension?: number;
      jaw_tension?: number;
      eye_openness?: number;
      blink_frequency?: number;
    };
    postural?: {
      shoulder_tension?: number;
      neck_tension?: number;
      head_forward?: number;
    };
    respiratory?: {
      breathing_depth?: number;
      breathing_rate?: number;
    };
  };
  activationLevel?: number; // 0-100
  recommendations: {
    urgency?: string;
    primary_need?: string;
    body_area_priority?: string;
  };
  context: {
    timeOfDay?: string;
    hrv?: number;
    sleepHours?: number;
    preferredActions?: string[];
  };
  userHistory: {
    lastActionId?: string;
    actionFeedbackMap?: Record<string, number>; // action_id -> avg feedback score (1-3)
  };
}

export interface ActionResult {
  id: MicroActionType;
  name: string;
  name_fr: string;
  duration: number;
  category: 'breathing' | 'posture' | 'movement' | 'sensory' | 'mental';
  instructions: Array<{ text: string; duration: number; type: string }>;
  score: number;
  reasoning: string;
}

// Mapping état → actions prioritaires
const STATE_ACTION_PRIORITY: Record<string, MicroActionType[]> = {
  HIGH_ACTIVATION: ['physiological_sigh', 'expiration_3_8', 'drop_trapezes'],
  LOW_ENERGY: ['respiration_2_1', 'posture_ancrage', 'ouverture_thoracique'],
  REGULATED: ['box_breathing', 'respiration_4_6', 'regard_fixe_expiration'],
};

// Mapping besoin → actions avec boost
const NEED_ACTION_BOOST: Record<string, Record<string, number>> = {
  calm_down: { physiological_sigh: 0.3, expiration_3_8: 0.3, jaw_release: 0.2 },
  energize: { respiration_2_1: 0.3, posture_ancrage: 0.3 },
  focus: { box_breathing: 0.3, regard_fixe_expiration: 0.2 },
  release_tension: { drop_trapezes: 0.3, jaw_release: 0.3, shake_neuromusculaire: 0.2 },
  rest: { respiration_4_6: 0.3, expiration_3_8: 0.2 },
  maintain: { box_breathing: 0.2 },
};

export function selectMicroAction(input: ActionSelectionInput): ActionResult {
  const { state, physiologicalSignals, activationLevel, recommendations, context, userHistory } = input;
  
  // Initialiser les scores
  const scores: Record<string, { score: number; reasons: string[] }> = {};
  
  // Initialiser tous les scores à 0
  Object.keys(MICRO_ACTIONS).forEach(actionId => {
    scores[actionId] = { score: 0, reasons: [] };
  });

  // 1. Score basé sur l'état (poids: 30%)
  const priorityActions = STATE_ACTION_PRIORITY[state] || STATE_ACTION_PRIORITY.REGULATED;
  priorityActions.forEach((actionId, index) => {
    const boost = (priorityActions.length - index) / priorityActions.length * 0.3;
    if (scores[actionId]) {
      scores[actionId].score += boost;
      scores[actionId].reasons.push(`État ${state}: +${(boost * 100).toFixed(0)}%`);
    }
  });

  // 2. Score basé sur les signaux physiologiques (poids: 20%)
  const facial = physiologicalSignals.facial || {};
  const postural = physiologicalSignals.postural || {};
  
  // Tension élevée (front, mâchoire, épaules) → HIGH_ACTIVATION → breathing actions
  const tensionLevel = Math.max(
    facial.forehead_tension || 0,
    facial.jaw_tension || 0,
    postural.shoulder_tension || 0
  );
  
  if (tensionLevel > 0.6) {
    if (scores.physiological_sigh) {
      scores.physiological_sigh.score += 0.2;
      scores.physiological_sigh.reasons.push('Tension musculaire élevée détectée');
    }
    if (scores.expiration_3_8) {
      scores.expiration_3_8.score += 0.15;
    }
  }
  
  // Fatigue oculaire ou basse énergie → LOW_ENERGY → posture/energizing actions
  const fatigueLevel = Math.max(
    1 - (facial.eye_openness || 0.5),
    facial.blink_frequency || 0
  );
  
  if (fatigueLevel > 0.6 || state === 'LOW_ENERGY') {
    if (scores.respiration_2_1) {
      scores.respiration_2_1.score += 0.2;
      scores.respiration_2_1.reasons.push('Fatigue physiologique détectée');
    }
    if (scores.posture_ancrage) {
      scores.posture_ancrage.score += 0.15;
    }
  }
  
  // Activation élevée → breathing actions
  if (activationLevel && activationLevel > 70) {
    if (scores.box_breathing) {
      scores.box_breathing.score += 0.2;
      scores.box_breathing.reasons.push('Activation physiologique élevée');
    }
  }

  // 3. Score basé sur le besoin primaire (poids: 15%)
  const needBoosts = NEED_ACTION_BOOST[recommendations.primary_need || 'maintain'] || {};
  Object.entries(needBoosts).forEach(([actionId, boost]) => {
    if (scores[actionId]) {
      scores[actionId].score += boost * 0.5; // 50% du boost max
      scores[actionId].reasons.push(`Besoin: ${recommendations.primary_need}`);
    }
  });

  // 4. Ajustement temporel (poids: 10%)
  if (context.timeOfDay === 'morning') {
    if (scores.posture_ancrage) {
      scores.posture_ancrage.score += 0.1;
      scores.posture_ancrage.reasons.push('Boost matinal');
    }
  }
  if (context.timeOfDay === 'evening' || context.timeOfDay === 'night') {
    if (scores.expiration_3_8) {
      scores.expiration_3_8.score += 0.1;
      scores.expiration_3_8.reasons.push('Relaxation du soir');
    }
    if (scores.respiration_4_6) {
      scores.respiration_4_6.score += 0.1;
    }
  }

  // 5. Ajustement biométrique (poids: 10%)
  if (context.hrv && context.hrv < 40) {
    if (scores.physiological_sigh) {
      scores.physiological_sigh.score += 0.1;
      scores.physiological_sigh.reasons.push('HRV bas');
    }
  }
  if (context.sleepHours && context.sleepHours < 6) {
    if (scores.respiration_2_1) {
      scores.respiration_2_1.score += 0.1;
      scores.respiration_2_1.reasons.push('Manque de sommeil');
    }
  }

  // 6. Préférences utilisateur (poids: 10%)
  if (context.preferredActions) {
    context.preferredActions.forEach(actionId => {
      if (scores[actionId]) {
        scores[actionId].score += 0.1;
        scores[actionId].reasons.push('Action préférée');
      }
    });
  }

  // 7. Anti-répétition (pénalité: -30%)
  if (userHistory.lastActionId && scores[userHistory.lastActionId]) {
    scores[userHistory.lastActionId].score -= 0.3;
    scores[userHistory.lastActionId].reasons.push('Éviter répétition');
  }

  // 8. Feedback historique (poids: 5%)
  if (userHistory.actionFeedbackMap) {
    Object.entries(userHistory.actionFeedbackMap).forEach(([actionId, avgFeedback]) => {
      if (scores[actionId]) {
        // avgFeedback est entre 1-3, on convertit en -0.05 à +0.05
        const feedbackBoost = (avgFeedback - 2) / 2 * 0.05;
        scores[actionId].score += feedbackBoost;
        if (feedbackBoost > 0) {
          scores[actionId].reasons.push('Bon feedback historique');
        }
      }
    });
  }

  // Sélectionner la meilleure action
  const sortedActions = Object.entries(scores)
    .sort(([, a], [, b]) => b.score - a.score);

  const [bestActionId, bestScore] = sortedActions[0];
  const action = MICRO_ACTIONS[bestActionId as MicroActionType];

  if (!action) {
    // Fallback si action non trouvée
    const fallbackAction = MICRO_ACTIONS.physiological_sigh;
    return {
      id: fallbackAction.id,
      name: fallbackAction.name,
      name_fr: fallbackAction.nameKey || fallbackAction.name,
      duration: fallbackAction.duration,
      category: 'breathing',
      instructions: fallbackAction.instructions.map(i => ({
        text: i.text,
        duration: i.duration,
        type: i.type,
      })),
      score: 50,
      reasoning: 'Action par défaut',
    };
  }

  return {
    id: action.id,
    name: action.name,
    name_fr: action.nameKey || action.name,
    duration: action.duration,
    category: 'breathing', // TODO: ajouter category dans MicroAction type
    instructions: action.instructions.map(i => ({
      text: i.text,
      duration: i.duration,
      type: i.type,
    })),
    score: Math.round(bestScore.score * 100),
    reasoning: bestScore.reasons.slice(0, 3).join(', '),
  };
}

export async function getUserActionHistory(userId: string | null): Promise<{
  lastActionId?: string;
  actionFeedbackMap?: Record<string, number>;
}> {
  if (!userId) return { lastActionId: undefined, actionFeedbackMap: undefined };

  try {
    const supabase = supabaseAdmin;

    // Dernière action
    const { data: lastSession } = await supabase
      .from('skane_sessions')
      .select('selected_action_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Feedback moyen par action
    const { data: feedbackData } = await supabase
      .from('skane_sessions')
      .select('selected_action_id, feedback')
      .eq('user_id', userId)
      .not('feedback', 'is', null)
      .limit(50);

    const feedbackMap: Record<string, number[]> = {};
    feedbackData?.forEach(session => {
      if (session.selected_action_id && session.feedback) {
        if (!feedbackMap[session.selected_action_id]) {
          feedbackMap[session.selected_action_id] = [];
        }
        const feedbackScore = session.feedback === 'better' ? 3 : session.feedback === 'same' ? 2 : 1;
        feedbackMap[session.selected_action_id].push(feedbackScore);
      }
    });

    const actionFeedbackMap: Record<string, number> = {};
    Object.entries(feedbackMap).forEach(([actionId, scores]) => {
      actionFeedbackMap[actionId] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    return {
      lastActionId: lastSession?.selected_action_id || undefined,
      actionFeedbackMap: Object.keys(actionFeedbackMap).length > 0 ? actionFeedbackMap : undefined,
    };
  } catch (error) {
    console.error('Error fetching user action history:', error);
    return { lastActionId: undefined, actionFeedbackMap: undefined };
  }
}
