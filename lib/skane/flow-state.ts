/**
 * Flow State Machine - NOKTA ONE V1.0
 * 
 * Machine d'états simple pour gérer les transitions du flow SKANE
 * Pas de dépendance externe (xstate), implémentation légère
 */

export type FlowState =
  | 'HOME_IDLE'
  | 'SKANE_CAMERA'
  | 'SKANE_ANALYZING'
  | 'SKANE_RESULT'
  | 'MICRO_ACTION_RUNNING'
  | 'FEEDBACK'
  | 'SHARE_PROMPT'
  | 'SHARE_CARD'
  | 'HISTORY'
  | 'ERROR';

export type FlowEvent =
  | 'START_SKANE'
  | 'CAPTURE_COMPLETE'
  | 'ANALYSIS_COMPLETE'
  | 'START_MICRO_ACTION'
  | 'MICRO_ACTION_COMPLETE'
  | 'FEEDBACK_SUBMITTED'
  | 'SHARE_PROMPT_YES'
  | 'SHARE_PROMPT_NO'
  | 'SHARE_COMPLETE'
  | 'GO_TO_HISTORY'
  | 'GO_TO_HOME'
  | 'RESTART_SKANE'
  | 'ERROR_OCCURRED';

/**
 * Matrice de transitions valides
 * [état_actuel, événement] -> état_suivant
 */
const TRANSITIONS: Record<FlowState, Partial<Record<FlowEvent, FlowState>>> = {
  HOME_IDLE: {
    START_SKANE: 'SKANE_CAMERA',
    GO_TO_HISTORY: 'HISTORY',
  },
  SKANE_CAMERA: {
    CAPTURE_COMPLETE: 'SKANE_ANALYZING',
    ERROR_OCCURRED: 'ERROR',
    GO_TO_HOME: 'HOME_IDLE',
  },
  SKANE_ANALYZING: {
    ANALYSIS_COMPLETE: 'SKANE_RESULT',
    ERROR_OCCURRED: 'ERROR',
  },
  SKANE_RESULT: {
    START_MICRO_ACTION: 'MICRO_ACTION_RUNNING',
    ERROR_OCCURRED: 'ERROR',
  },
  MICRO_ACTION_RUNNING: {
    MICRO_ACTION_COMPLETE: 'FEEDBACK',
    ERROR_OCCURRED: 'ERROR',
  },
  FEEDBACK: {
    FEEDBACK_SUBMITTED: 'SHARE_PROMPT',
    ERROR_OCCURRED: 'ERROR',
  },
  SHARE_PROMPT: {
    SHARE_PROMPT_YES: 'SHARE_CARD',
    SHARE_PROMPT_NO: 'HOME_IDLE',
  },
  SHARE_CARD: {
    SHARE_COMPLETE: 'HOME_IDLE',
    GO_TO_HOME: 'HOME_IDLE',
  },
  HISTORY: {
    GO_TO_HOME: 'HOME_IDLE',
    START_SKANE: 'SKANE_CAMERA',
  },
  ERROR: {
    RESTART_SKANE: 'SKANE_CAMERA',
    GO_TO_HOME: 'HOME_IDLE',
  },
};

/**
 * Vérifie si une transition est valide
 */
export function canTransition(
  currentState: FlowState,
  event: FlowEvent
): boolean {
  return TRANSITIONS[currentState]?.[event] !== undefined;
}

/**
 * Obtient l'état suivant après un événement
 */
export function getNextState(
  currentState: FlowState,
  event: FlowEvent
): FlowState | null {
  return TRANSITIONS[currentState]?.[event] || null;
}

/**
 * Valide et retourne l'état suivant (throw si invalide)
 */
export function transition(
  currentState: FlowState,
  event: FlowEvent
): FlowState {
  const nextState = getNextState(currentState, event);
  
  if (!nextState) {
    throw new Error(
      `Invalid transition: ${currentState} --[${event}]--> ?`
    );
  }
  
  return nextState;
}

/**
 * Obtient tous les événements possibles depuis un état
 */
export function getPossibleEvents(state: FlowState): FlowEvent[] {
  return Object.keys(TRANSITIONS[state] || {}) as FlowEvent[];
}

/**
 * Route correspondant à chaque état
 */
export const STATE_ROUTES: Record<FlowState, string> = {
  HOME_IDLE: '/',
  SKANE_CAMERA: '/skane',
  SKANE_ANALYZING: '/skane/analyzing',
  SKANE_RESULT: '/skane/result',
  MICRO_ACTION_RUNNING: '/skane/action',
  FEEDBACK: '/skane/feedback',
  SHARE_PROMPT: '/skane/share-prompt',
  SHARE_CARD: '/skane/share',
  HISTORY: '/history',
  ERROR: '/skane/error',
};

/**
 * Obtient la route pour un état
 */
export function getRouteForState(state: FlowState): string {
  return STATE_ROUTES[state];
}

/**
 * Obtient l'état depuis une route
 */
export function getStateFromRoute(route: string): FlowState | null {
  for (const [state, stateRoute] of Object.entries(STATE_ROUTES)) {
    if (stateRoute === route || route.startsWith(stateRoute + '/')) {
      return state as FlowState;
    }
  }
  return null;
}
