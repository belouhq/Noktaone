/**
 * Amplifier Engine FlowV1
 * Gère les amplificateurs sensoriels optionnels
 */

import type { InternalState, AmplifierType } from '@/lib/skane/types';

interface AmplifierContext {
  state: InternalState;
  actionDuration: number; // en secondes
}

/**
 * Détermine le type d'amplificateur à utiliser
 */
export function selectAmplifier(context: AmplifierContext): AmplifierType {
  const { state, actionDuration } = context;

  // Si l'action est courte (<25s), on peut ajouter un amplificateur
  if (actionDuration < 25) {
    if (state === 'HIGH_ACTIVATION') {
      return 'warm_sip';
    }
    if (state === 'LOW_ENERGY') {
      return 'fixed_gaze_expiration';
    }
  }

  // Par défaut, pas d'amplificateur
  return null;
}

/**
 * Durée de l'amplificateur (en secondes)
 */
export function getAmplifierDuration(type: AmplifierType): number {
  switch (type) {
    case 'warm_sip':
      return 5; // 5 secondes pour une gorgée
    case 'fixed_gaze_expiration':
      return 8; // 8 secondes pour regard fixe + expiration
    default:
      return 0;
  }
}

/**
 * Instructions pour l'amplificateur
 */
export function getAmplifierInstructions(type: AmplifierType): string {
  switch (type) {
    case 'warm_sip':
      return 'Prends une gorgée chaude, consciente';
    case 'fixed_gaze_expiration':
      return 'Regard fixe, expiration longue';
    default:
      return '';
  }
}
