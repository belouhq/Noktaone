import { InternalState, MicroActionType, UserFeedback, SkaneResult } from './types';
import { STATE_TO_ACTIONS, GUEST_MODE_ACTIONS, MICRO_ACTIONS } from './constants';

interface SelectionContext {
  state: InternalState;
  isGuestMode: boolean;
  previousSkanes: SkaneResult[];
}

export function selectMicroAction(context: SelectionContext): MicroActionType {
  const { state, isGuestMode, previousSkanes } = context;
  
  // === MODE INVITÉ ===
  if (isGuestMode) {
    // Random entre les 2 meilleures actions
    const randomIndex = Math.random() < 0.5 ? 0 : 1;
    return GUEST_MODE_ACTIONS[randomIndex];
  }
  
  // === MODE NORMAL ===
  const availableActions = STATE_TO_ACTIONS[state];
  
  // Récupérer la dernière action utilisée
  const lastAction = previousSkanes.length > 0 
    ? previousSkanes[previousSkanes.length - 1].microAction 
    : null;
  
  // Filtrer pour éviter répétition
  let candidates = availableActions.filter(action => action !== lastAction);
  
  // Si toutes les actions ont été filtrées, reprendre la liste complète
  if (candidates.length === 0) {
    candidates = availableActions;
  }
  
  // Pondération par feedback historique
  const weightedCandidates = candidates.map(actionId => {
    const feedbackScore = calculateFeedbackScore(actionId, previousSkanes);
    return { actionId, score: feedbackScore };
  });
  
  // Trier par score (meilleur feedback en premier)
  weightedCandidates.sort((a, b) => b.score - a.score);
  
  // Sélection avec légère randomisation pour variété
  // 70% chance de prendre le meilleur, 30% random parmi les autres
  if (Math.random() < 0.7 || weightedCandidates.length === 1) {
    return weightedCandidates[0].actionId;
  } else {
    const randomIndex = Math.floor(Math.random() * weightedCandidates.length);
    return weightedCandidates[randomIndex].actionId;
  }
}

function calculateFeedbackScore(actionId: MicroActionType, previousSkanes: SkaneResult[]): number {
  // Filtrer les skanes avec cette action et un feedback
  const relevantSkanes = previousSkanes.filter(
    skane => skane.microAction === actionId && skane.feedback
  );
  
  if (relevantSkanes.length === 0) {
    return 0.5; // Score neutre si pas de données
  }
  
  // Calculer le score moyen
  const totalScore = relevantSkanes.reduce((sum, skane) => {
    switch (skane.feedback) {
      case 'better': return sum + 1;
      case 'same': return sum + 0.5;
      case 'worse': return sum + 0;
      default: return sum + 0.5;
    }
  }, 0);
  
  return totalScore / relevantSkanes.length;
}

// Export helper pour récupérer les infos de l'action
export function getMicroActionDetails(actionId: MicroActionType) {
  return MICRO_ACTIONS[actionId];
}
