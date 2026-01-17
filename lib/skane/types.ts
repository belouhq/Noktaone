// États internes (jamais affichés à l'utilisateur)
export type InternalState = 'HIGH_ACTIVATION' | 'LOW_ENERGY' | 'REGULATED';

// Feedback utilisateur
export type UserFeedback = 'worse' | 'same' | 'better';

// Types de micro-actions
export type MicroActionType = 
  | 'physiological_sigh'
  | 'expiration_3_8'
  | 'respiration_4_6'
  | 'box_breathing'
  | 'respiration_2_1'
  | 'drop_trapezes'
  | 'ouverture_thoracique'
  | 'posture_ancrage'
  | 'shake_neuromusculaire'
  | 'pression_plantaire'
  | 'regard_fixe_expiration';

// Structure d'une micro-action
export interface MicroAction {
  id: MicroActionType;
  name: string;
  nameKey?: string; // Clé de traduction
  duration: number; // en secondes
  instructions: Instruction[];
  repetitions: number;
}

// Instruction individuelle
export interface Instruction {
  text: string;
  textKey?: string; // Clé de traduction
  duration: number; // en secondes
  type: 'inhale' | 'exhale' | 'hold' | 'action' | 'pause';
}

// Résultat d'un skane
export interface SkaneResult {
  id: string;
  timestamp: Date;
  internalState: InternalState;
  microAction: MicroActionType;
  feedback?: UserFeedback;
  userId?: string;
  isGuestMode: boolean;
  skaneIndexBefore: number;
  skaneIndexAfter?: number;
}

// Skane Index (pour le partage viral)
export interface SkaneIndex {
  before: number; // 0-100
  after: number;  // 0-100
  state: InternalState;
  action: MicroActionType;
}

// Amplificateur sensoriel
export type AmplifierType = 'warm_sip' | 'fixed_gaze_expiration' | null;

export interface Amplifier {
  enabled: boolean;
  type: AmplifierType;
}

// Signaux faciaux inférés (normalisés 0-1)
export interface InferredSignals {
  eye_openness: number;
  blink_rate: number;
  jaw_tension: number;
  lip_compression: number;
  forehead_tension: number;
  head_stability: number;
}

// Réponse complète de l'analyse GPT
export interface AnalysisResponse {
  internal_state: InternalState;
  signal_label: string; // "High Activation" | "Low Energy" | "Clear Signal"
  inferred_signals: InferredSignals;
  micro_action: {
    id: MicroActionType;
    duration_seconds: number;
    category: 'breathing' | 'posture';
  };
  amplifier: Amplifier;
  ui_flags: {
    share_allowed: boolean;
    medical_disclaimer: boolean;
  };
}
