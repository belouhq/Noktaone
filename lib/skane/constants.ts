import { MicroAction, InternalState, MicroActionType } from './types';

export const MICRO_ACTIONS: Record<MicroActionType, MicroAction> = {
  
  // === 1. PHYSIOLOGICAL SIGH (24s) ===
  physiological_sigh: {
    id: 'physiological_sigh',
    name: 'Physiological Sigh',
    nameKey: 'actions.physiologicalSigh',
    duration: 24,
    repetitions: 3,
    tip: 'Garde les épaules immobiles.',
    tipKey: 'actions.tips.physiologicalSigh',
    instructions: [
      { text: 'Inspire par le nez', textKey: 'breathing.inhaleNose', duration: 2, type: 'inhale' },
      { text: 'Inspire encore un peu', textKey: 'breathing.inhaleMore', duration: 1, type: 'inhale' },
      { text: 'Expire lentement par la bouche', textKey: 'breathing.exhaleSlowMouth', duration: 5, type: 'exhale' },
    ]
  },
  
  // === 2. EXPIRATION LONGUE 3-8 (33s) ===
  expiration_3_8: {
    id: 'expiration_3_8',
    name: 'Expiration longue',
    nameKey: 'actions.expiration38',
    duration: 33,
    repetitions: 3,
    tip: 'Laisse l\'air sortir tout seul, sans pousser.',
    tipKey: 'actions.tips.expiration38',
    instructions: [
      { text: 'Inspire par le nez', textKey: 'breathing.inhaleNose', duration: 3, type: 'inhale' },
      { text: 'Expire lentement par la bouche', textKey: 'breathing.exhaleSlowMouth', duration: 8, type: 'exhale' },
    ]
  },
  
  // === 3. RESPIRATION 4-6 (30s) ===
  respiration_4_6: {
    id: 'respiration_4_6',
    name: 'Respiration stabilisante',
    nameKey: 'actions.respiration46',
    duration: 30,
    repetitions: 3,
    tip: 'Relâche légèrement la mâchoire avant de commencer.',
    tipKey: 'actions.tips.respiration46',
    instructions: [
      { text: 'Inspire par le nez', textKey: 'breathing.inhaleNose', duration: 4, type: 'inhale' },
      { text: 'Expire doucement par la bouche', textKey: 'breathing.exhaleGentleMouth', duration: 6, type: 'exhale' },
    ]
  },
  
  // === 4. BOX BREATHING (24s) ===
  box_breathing: {
    id: 'box_breathing',
    name: 'Box Breathing',
    nameKey: 'actions.boxBreathing',
    duration: 24,
    repetitions: 2,
    instructions: [
      { text: 'Inspire', textKey: 'breathing.inhale', duration: 3, type: 'inhale' },
      { text: 'Retiens', textKey: 'breathing.hold', duration: 3, type: 'hold' },
      { text: 'Expire', textKey: 'breathing.exhale', duration: 3, type: 'exhale' },
      { text: 'Pause', textKey: 'breathing.pause', duration: 3, type: 'pause' },
    ]
  },
  
  // === 5. RESPIRATION ÉNERGISANTE 2-1 (30s) ===
  respiration_2_1: {
    id: 'respiration_2_1',
    name: 'Respiration énergisante',
    nameKey: 'actions.respiration21',
    duration: 30,
    repetitions: 10,
    instructions: [
      { text: 'Inspire rapidement par le nez', textKey: 'breathing.inhaleQuickNose', duration: 2, type: 'inhale' },
      { text: 'Expire par la bouche', textKey: 'breathing.exhaleMouth', duration: 1, type: 'exhale' },
    ]
  },
  
  // === 6. DROP DES TRAPÈZES (20s) ===
  drop_trapezes: {
    id: 'drop_trapezes',
    name: 'Drop des trapèzes',
    nameKey: 'actions.dropTrapezes',
    duration: 20,
    repetitions: 5,
    tip: 'Imagine que les épaules "fondent" vers le bas.',
    tipKey: 'actions.tips.dropTrapezes',
    instructions: [
      { text: 'Monte les épaules', textKey: 'body.raiseShouders', duration: 2, type: 'action' },
      { text: 'Relâche complètement', textKey: 'body.releaseCompletely', duration: 2, type: 'pause' },
    ]
  },
  
  // === 7. OUVERTURE THORACIQUE (30s) ===
  ouverture_thoracique: {
    id: 'ouverture_thoracique',
    name: 'Ouverture thoracique',
    nameKey: 'actions.ouvertureThoracique',
    duration: 30,
    repetitions: 1,
    tip: 'Grandis-toi sans cambrer.',
    tipKey: 'actions.tips.ouvertureThoracique',
    instructions: [
      { text: 'Ouvre légèrement la poitrine', textKey: 'body.openChest', duration: 10, type: 'action' },
      { text: 'Respire calmement', textKey: 'body.breatheCalmly', duration: 10, type: 'action' },
      { text: 'Maintiens la posture', textKey: 'body.holdPosture', duration: 10, type: 'action' },
    ]
  },
  
  // === 8. POSTURE D'ANCRAGE (30s) ===
  posture_ancrage: {
    id: 'posture_ancrage',
    name: "Posture d'ancrage",
    nameKey: 'actions.postureAncrage',
    duration: 30,
    repetitions: 1,
    instructions: [
      { text: 'Tiens-toi debout, pieds ancrés', textKey: 'body.standGrounded', duration: 10, type: 'action' },
      { text: 'Regard droit devant', textKey: 'body.lookAhead', duration: 10, type: 'action' },
      { text: 'Respiration calme', textKey: 'body.calmBreathing', duration: 10, type: 'action' },
    ]
  },
  
  // === 9. SHAKE NEUROMUSCULAIRE (20s) ===
  shake_neuromusculaire: {
    id: 'shake_neuromusculaire',
    name: 'Shake neuromusculaire',
    nameKey: 'actions.shakeNeuromusculaire',
    duration: 20,
    repetitions: 1,
    instructions: [
      { text: 'Secoue doucement les bras et les mains', textKey: 'body.shakeArms', duration: 10, type: 'action' },
      { text: 'Laisse le corps bouger librement', textKey: 'body.moveFreely', duration: 10, type: 'action' },
    ]
  },
  
  // === 10. PRESSION PLANTAIRE (20s) ===
  pression_plantaire: {
    id: 'pression_plantaire',
    name: 'Pression plantaire',
    nameKey: 'actions.pressionPlantaire',
    duration: 20,
    repetitions: 5,
    instructions: [
      { text: 'Appuie les pieds dans le sol', textKey: 'body.pressFeet', duration: 2, type: 'action' },
      { text: 'Relâche', textKey: 'body.release', duration: 2, type: 'pause' },
    ]
  },
  
  // === 11. REGARD FIXE + EXPIRATION (24s) ===
  regard_fixe_expiration: {
    id: 'regard_fixe_expiration',
    name: 'Regard fixe + expiration',
    nameKey: 'actions.regardFixeExpiration',
    duration: 24,
    repetitions: 3,
    tip: 'Regarde sans fixer.',
    tipKey: 'actions.tips.regardFixeExpiration',
    instructions: [
      { text: 'Fixe un point stable', textKey: 'body.fixPoint', duration: 2, type: 'action' },
      { text: 'Inspire calmement', textKey: 'breathing.inhaleCalmly', duration: 2, type: 'inhale' },
      { text: 'Expire lentement et longuement', textKey: 'breathing.exhaleSlowLong', duration: 4, type: 'exhale' },
    ]
  },
};

// === MAPPING ÉTAT → MICRO-ACTIONS ===
export const STATE_TO_ACTIONS: Record<InternalState, MicroActionType[]> = {
  HIGH_ACTIVATION: [
    'physiological_sigh',
    'expiration_3_8',
    'drop_trapezes',
    'shake_neuromusculaire'
  ],
  LOW_ENERGY: [
    'respiration_2_1',
    'posture_ancrage',
    'ouverture_thoracique'
  ],
  REGULATED: [
    'box_breathing',
    'respiration_4_6',
    'regard_fixe_expiration'
  ]
};

// === MODE INVITÉ : TOP 2 MICRO-ACTIONS ===
export const GUEST_MODE_ACTIONS: MicroActionType[] = [
  'physiological_sigh',
  'box_breathing'
];

// === SKANE INDEX RANGES ===
export const SKANE_INDEX_RANGES: Record<InternalState, { min: number; max: number }> = {
  HIGH_ACTIVATION: { min: 70, max: 95 },
  LOW_ENERGY: { min: 20, max: 45 },
  REGULATED: { min: 15, max: 35 }
};
