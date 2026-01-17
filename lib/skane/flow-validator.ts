/**
 * Flow Validator - NOKTA ONE V1.0
 * 
 * Validation des transitions du flow SKANE
 * Utilisé pour debug et tests
 */

import { 
  FlowState, 
  FlowEvent, 
  canTransition, 
  getNextState,
  getRouteForState 
} from './flow-state';

/**
 * Valide une transition et retourne un résultat détaillé
 */
export interface ValidationResult {
  valid: boolean;
  currentState: FlowState;
  event: FlowEvent;
  nextState: FlowState | null;
  route: string | null;
  error?: string;
}

export function validateTransition(
  currentState: FlowState,
  event: FlowEvent
): ValidationResult {
  const valid = canTransition(currentState, event);
  const nextState = getNextState(currentState, event);
  const route = nextState ? getRouteForState(nextState) : null;

  return {
    valid,
    currentState,
    event,
    nextState,
    route,
    error: valid ? undefined : `Invalid transition: ${currentState} --[${event}]--> ?`,
  };
}

/**
 * Valide un flow complet (séquence de transitions)
 */
export function validateFlow(transitions: Array<{ state: FlowState; event: FlowEvent }>): {
  valid: boolean;
  errors: string[];
  path: Array<{ state: FlowState; event: FlowEvent; nextState: FlowState | null }>;
} {
  const errors: string[] = [];
  const path: Array<{ state: FlowState; event: FlowEvent; nextState: FlowState | null }> = [];

  for (let i = 0; i < transitions.length; i++) {
    const { state, event } = transitions[i];
    const result = validateTransition(state, event);

    path.push({
      state,
      event,
      nextState: result.nextState,
    });

    if (!result.valid) {
      errors.push(`Transition ${i + 1}: ${result.error}`);
    }

    // Vérifier la cohérence avec la transition précédente
    if (i > 0) {
      const prevNextState = path[i - 1].nextState;
      if (prevNextState !== state) {
        errors.push(
          `Transition ${i + 1}: Expected state ${prevNextState} but got ${state}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    path,
  };
}

/**
 * Flow complet attendu (happy path)
 */
export const EXPECTED_HAPPY_PATH: Array<{ state: FlowState; event: FlowEvent }> = [
  { state: 'HOME_IDLE', event: 'START_SKANE' },
  { state: 'SKANE_CAMERA', event: 'CAPTURE_COMPLETE' },
  { state: 'SKANE_ANALYZING', event: 'ANALYSIS_COMPLETE' },
  { state: 'SKANE_RESULT', event: 'START_MICRO_ACTION' },
  { state: 'MICRO_ACTION_RUNNING', event: 'MICRO_ACTION_COMPLETE' },
  { state: 'FEEDBACK', event: 'FEEDBACK_SUBMITTED' },
  { state: 'SHARE_PROMPT', event: 'SHARE_PROMPT_NO' },
  { state: 'HOME_IDLE', event: 'GO_TO_HISTORY' },
  { state: 'HISTORY', event: 'GO_TO_HOME' },
];

/**
 * Valide le happy path
 */
export function validateHappyPath(): boolean {
  const result = validateFlow(EXPECTED_HAPPY_PATH);
  if (!result.valid) {
    console.error('Happy path validation failed:', result.errors);
  }
  return result.valid;
}
