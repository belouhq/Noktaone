// Utilitaires pour obtenir une micro-action alternative

import { MicroActionType, InternalState } from './types';
import { STATE_TO_ACTIONS, MICRO_ACTIONS } from './constants';

/**
 * Obtient une micro-action alternative différente de celle actuelle
 */
export function getAlternativeMicroAction(
  currentAction: MicroActionType,
  state: InternalState
): MicroActionType | null {
  const availableActions = STATE_TO_ACTIONS[state];
  
  // Filtrer pour exclure l'action actuelle
  const alternatives = availableActions.filter(action => action !== currentAction);
  
  if (alternatives.length === 0) {
    // Si pas d'alternative, retourner null
    return null;
  }
  
  // Retourner une action aléatoire parmi les alternatives
  const randomIndex = Math.floor(Math.random() * alternatives.length);
  return alternatives[randomIndex];
}

/**
 * Obtient les détails d'une micro-action alternative
 */
export function getAlternativeActionDetails(
  currentAction: MicroActionType,
  state: InternalState
) {
  const alternativeId = getAlternativeMicroAction(currentAction, state);
  if (!alternativeId) return null;
  
  return MICRO_ACTIONS[alternativeId];
}
