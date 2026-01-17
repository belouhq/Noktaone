/**
 * Flow Orchestrator FlowV1
 * Machine à états pour le flow complet
 */

import type { InternalState, MicroActionType, UserFeedback, AmplifierType } from '@/lib/skane/types';
import { determineInternalState, shouldEnableAmplifier } from './decisionEngine';
import { computeRawDysregulation, computeBeforeScore, computeAfterScore } from './scoreEngine';
import { selectAmplifier } from './amplifierEngine';
import { STATE_TO_ACTIONS, MICRO_ACTIONS } from '@/lib/skane/constants';

export type FlowState = 
  | 'IDLE'
  | 'SCANNING'
  | 'DECIDE'
  | 'ACTION'
  | 'FEEDBACK'
  | 'RESULT'
  | 'SHARE'
  | 'ERROR';

export interface FlowContext {
  sessionId: string;
  userId: string | null;
  state: FlowState;
  internalState?: InternalState;
  rawDysregulation?: number;
  beforeScore?: number;
  afterScore?: number;
  microAction?: MicroActionType;
  amplifier?: {
    enabled: boolean;
    type: AmplifierType;
  };
  feedback?: UserFeedback;
  previousState?: InternalState; // Pour hystérésis
  lastActionIds?: MicroActionType[]; // Anti-répétition
}

export class FlowOrchestrator {
  private context: FlowContext;

  constructor(sessionId: string, userId: string | null = null) {
    this.context = {
      sessionId,
      userId,
      state: 'IDLE',
      lastActionIds: [],
    };
  }

  /**
   * Démarre le scan
   */
  startScan(): void {
    this.context.state = 'SCANNING';
  }

  /**
   * Traite les features extraites du scan
   */
  async processScan(features: {
    eye_openness: number;
    blink_rate: number;
    brow_furrow: number;
    jaw_tension: number;
    lip_compression: number;
    head_jitter: number;
    skin_tone_variance: number;
    symmetry_delta: number;
  }): Promise<void> {
    // 1) Calculer raw dysregulation
    const raw = computeRawDysregulation(features);
    this.context.rawDysregulation = raw;

    // 2) Déterminer l'état interne
    const state = determineInternalState({
      features,
      previousState: this.context.previousState,
    });
    this.context.internalState = state;
    this.context.previousState = state;

    // 3) Calculer before score
    const beforeScore = computeBeforeScore({
      state,
      rawDysregulation: raw,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      actionId: '', // Sera défini après sélection
      amplifierEnabled: false, // Sera défini après décision
    });
    this.context.beforeScore = beforeScore;

    // 4) Sélectionner micro-action (anti-répétition)
    const candidates = STATE_TO_ACTIONS[state] || [];
    const availableActions = candidates.filter(
      action => !this.context.lastActionIds?.includes(action)
    );
    const action = availableActions.length > 0
      ? availableActions[Math.floor(Math.random() * availableActions.length)]
      : candidates[0];
    this.context.microAction = action;

    // 5) Décider amplificateur
    const hasUsedAmplifierToday = false; // TODO: vérifier depuis storage
    const amplifierEnabled = shouldEnableAmplifier(state, raw, hasUsedAmplifierToday);
    const actionDetails = MICRO_ACTIONS[action];
    const amplifierType = amplifierEnabled
      ? selectAmplifier({
          state,
          actionDuration: actionDetails?.duration || 24,
        })
      : null;

    this.context.amplifier = {
      enabled: amplifierEnabled,
      type: amplifierType,
    };

    // 6) Calculer after score (prévision)
    const afterScore = computeAfterScore(
      {
        state,
        rawDysregulation: raw,
        userId: this.context.userId,
        sessionId: this.context.sessionId,
        actionId: action,
        amplifierEnabled,
      },
      beforeScore
    );
    this.context.afterScore = afterScore;

    // 7) Passer à l'état DECIDE
    this.context.state = 'DECIDE';
  }

  /**
   * Passe à l'action
   */
  startAction(): void {
    if (this.context.state !== 'DECIDE') {
      throw new Error('Cannot start action from current state');
    }
    this.context.state = 'ACTION';
  }

  /**
   * Action terminée, passe au feedback
   */
  completeAction(): void {
    if (this.context.state !== 'ACTION') {
      throw new Error('Cannot complete action from current state');
    }
    this.context.state = 'FEEDBACK';
  }

  /**
   * Soumet le feedback
   */
  submitFeedback(feedback: UserFeedback): void {
    if (this.context.state !== 'FEEDBACK') {
      throw new Error('Cannot submit feedback from current state');
    }
    this.context.feedback = feedback;
    this.context.state = 'RESULT';
  }

  /**
   * Passe au partage
   */
  goToShare(): void {
    if (this.context.state !== 'RESULT') {
      throw new Error('Cannot go to share from current state');
    }
    this.context.state = 'SHARE';
  }

  /**
   * Gère les erreurs
   */
  setError(error: Error): void {
    this.context.state = 'ERROR';
    console.error('Flow error:', error);
  }

  /**
   * Récupère le contexte actuel
   */
  getContext(): FlowContext {
    return { ...this.context };
  }

  /**
   * Sauvegarde le contexte dans sessionStorage
   */
  save(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('flowV1_context', JSON.stringify(this.context));
    }
  }

  /**
   * Charge le contexte depuis sessionStorage
   */
  static load(sessionId: string, userId: string | null = null): FlowOrchestrator | null {
    if (typeof window === 'undefined') return null;
    
    const stored = sessionStorage.getItem('flowV1_context');
    if (!stored) return null;

    try {
      const context = JSON.parse(stored) as FlowContext;
      const orchestrator = new FlowOrchestrator(sessionId, userId);
      orchestrator.context = context;
      return orchestrator;
    } catch (error) {
      console.error('Error loading flow context:', error);
      return null;
    }
  }
}
