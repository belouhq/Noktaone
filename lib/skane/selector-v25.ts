/**
 * Selector V2.5 - Précision Maximale (Version Minimale)
 * 
 * 4 règles simples qui couvrent 80% de la valeur :
 * 1. Exclure actions avec feedback négatif < 24h
 * 2. Forcer 70% actions cœur si ratio trop bas
 * 3. Éviter même action > 3x consécutives
 * 4. Toujours avoir un fallback (airbag)
 */

import { InternalState, MicroActionType } from './types';
import { STATE_TO_ACTIONS } from './constants';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIG
// ============================================

/** Top 5 actions universelles (respirations) */
export const CORE_ACTIONS: MicroActionType[] = [
  'physiological_sigh',
  'box_breathing',
  'expiration_3_8',
  'respiration_2_1',
  'respiration_4_6',
];

/** Fallback ultime si tout échoue */
export const FALLBACK_ACTION: MicroActionType = 'physiological_sigh';

/** Ratio minimum d'actions cœur sur les 10 derniers usages */
const CORE_RATIO_MIN = 0.7;

/** Max répétitions consécutives de la même action */
const MAX_CONSECUTIVE = 3;

// ============================================
// TYPES
// ============================================

export interface SelectionResultV25 {
  actionId: MicroActionType;
  rule: string;
  candidates: MicroActionType[];
}

interface UserHistory {
  lastActions: MicroActionType[];
  negativeActions24h: MicroActionType[];
  coreRatio: number;
}

// ============================================
// ALGORITHME PRINCIPAL
// ============================================

export async function selectMicroActionV25(
  state: InternalState,
  userId: string | null,
  isGuestMode: boolean
): Promise<SelectionResultV25> {
  
  // Mode invité : simple random entre les 2 meilleures
  if (isGuestMode || !userId) {
    const guestActions: MicroActionType[] = ['physiological_sigh', 'box_breathing'];
    const selected = guestActions[Math.random() < 0.5 ? 0 : 1];
    return { actionId: selected, rule: 'guest_mode', candidates: guestActions };
  }
  
  // Récupérer l'historique
  const history = await getUserHistory(userId);
  
  // Candidats de base selon l'état
  let candidates = [...STATE_TO_ACTIONS[state]];
  let rule = 'default';
  
  // === RÈGLE 1 : Exclure feedback négatif < 24h ===
  const beforeNegative = candidates.length;
  candidates = candidates.filter(a => !history.negativeActions24h.includes(a));
  if (candidates.length < beforeNegative) {
    rule = 'excluded_negative_24h';
  }
  
  // === RÈGLE 2 : Forcer actions cœur si ratio trop bas ===
  if (history.coreRatio < CORE_RATIO_MIN && history.lastActions.length >= 5) {
    const coreOnly = candidates.filter(a => CORE_ACTIONS.includes(a));
    if (coreOnly.length > 0) {
      candidates = coreOnly;
      rule = 'forced_core_ratio';
    }
  }
  
  // === RÈGLE 3 : Éviter > 3x consécutives ===
  if (history.lastActions.length >= MAX_CONSECUTIVE) {
    const lastAction = history.lastActions[0];
    const consecutiveCount = history.lastActions
      .slice(0, MAX_CONSECUTIVE)
      .filter(a => a === lastAction).length;
    
    if (consecutiveCount >= MAX_CONSECUTIVE) {
      const filtered = candidates.filter(a => a !== lastAction);
      if (filtered.length > 0) {
        candidates = filtered;
        rule = 'avoid_3x_consecutive';
      }
    }
  }
  
  // === RÈGLE 4 : Fallback si liste vide ===
  if (candidates.length === 0) {
    return { actionId: FALLBACK_ACTION, rule: 'fallback_airbag', candidates: [FALLBACK_ACTION] };
  }
  
  // Sélection : 70% meilleur candidat, 30% random
  let selected: MicroActionType;
  if (Math.random() < 0.7) {
    // Privilégier les actions cœur
    const core = candidates.filter(a => CORE_ACTIONS.includes(a));
    selected = core.length > 0 
      ? core[Math.floor(Math.random() * core.length)]
      : candidates[0];
  } else {
    selected = candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  return { actionId: selected, rule, candidates };
}

// ============================================
// HELPER : Récupérer historique utilisateur
// ============================================

async function getUserHistory(userId: string): Promise<UserHistory> {
  try {
    // Utiliser service role pour accès complet aux données
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Dernières 10 actions
    const { data: events, error } = await supabase
      .from('micro_action_events')
      .select('micro_action_id, effect, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('getUserHistory error:', error);
      return { lastActions: [], negativeActions24h: [], coreRatio: 1 };
    }
    
    if (!events || events.length === 0) {
      return { lastActions: [], negativeActions24h: [], coreRatio: 1 };
    }
    
    const lastActions = events.map(e => e.micro_action_id as MicroActionType);
    
    // Actions avec feedback négatif dans les 24h
    const h24Ago = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const negativeActions24h = events
      .filter(e => e.effect === -1 && new Date(e.created_at) > h24Ago)
      .map(e => e.micro_action_id as MicroActionType);
    
    // Ratio actions cœur
    const coreCount = lastActions.filter(a => CORE_ACTIONS.includes(a)).length;
    const coreRatio = lastActions.length > 0 ? coreCount / lastActions.length : 1;
    
    return { lastActions, negativeActions24h, coreRatio };
    
  } catch (error) {
    console.error('getUserHistory error:', error);
    return { lastActions: [], negativeActions24h: [], coreRatio: 1 };
  }
}
