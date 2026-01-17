/**
 * Selector V2 - Avec Supabase (Version Complète)
 * 
 * Algorithme de sélection amélioré avec tracking complet des décisions
 */

import { InternalState, MicroActionType } from './types';
import { 
  selectBestAction,
  SelectionResult,
  getCandidatesForState,
  calculateActionScores 
} from './supabase-tracker';
import { GUEST_MODE_ACTIONS } from './constants';

interface SelectionContext {
  state: InternalState;
  isGuestMode: boolean;
  userId?: string | null;
  confidence?: number;
}

/**
 * Sélectionne la meilleure micro-action avec algorithme V2
 * Retourne aussi les métadonnées pour le tracking
 */
export async function selectMicroActionV2(
  context: SelectionContext
): Promise<SelectionResult> {
  const { state, isGuestMode, userId, confidence } = context;

  // === MODE INVITÉ ===
  if (isGuestMode) {
    const guestActions: MicroActionType[] = GUEST_MODE_ACTIONS;
    const randomIndex = Math.random() < 0.5 ? 0 : 1;
    return {
      actionId: guestActions[randomIndex],
      candidates: guestActions,
      selectionRule: 'guest_mode',
      penalties: {},
      userLiftUsed: false,
    };
  }

  // === MODE COMPTE ===
  // Si confidence faible, fallback sur actions universelles
  if (confidence !== undefined && confidence < 0.5) {
    const fallbackActions: MicroActionType[] = ['physiological_sigh', 'box_breathing'];
    const randomIndex = Math.floor(Math.random() * fallbackActions.length);
    return {
      actionId: fallbackActions[randomIndex],
      candidates: fallbackActions,
      selectionRule: 'fallback_low_confidence',
      penalties: {},
      userLiftUsed: false,
    };
  }

  // Algorithme complet avec scoring
  try {
    return await selectBestAction(state, userId || null, isGuestMode);
  } catch (error) {
    console.error('Error in selectMicroActionV2, using fallback:', error);
    // Fallback sur le mapping hardcodé
    return {
      actionId: getFallbackAction(state),
      candidates: [getFallbackAction(state)],
      selectionRule: 'fallback_error',
      penalties: {},
      userLiftUsed: false,
    };
  }
}

/**
 * Fallback si Supabase n'est pas disponible
 */
function getFallbackAction(state: InternalState): MicroActionType {
  const mapping: Record<InternalState, MicroActionType[]> = {
    HIGH_ACTIVATION: ['physiological_sigh', 'expiration_3_8'],
    LOW_ENERGY: ['respiration_2_1', 'posture_ancrage'],
    REGULATED: ['box_breathing', 'respiration_4_6'],
  };

  const candidates = mapping[state];
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Récupère les scores détaillés (pour debug/analytics)
 */
export async function getActionScores(
  state: InternalState,
  userId: string | null,
  isGuestMode: boolean
) {
  return calculateActionScores(state, userId, isGuestMode);
}
