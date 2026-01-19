/**
 * TYPES TYPESCRIPT - NOKTA ONE SKANE ANALYSIS
 * 
 * Types pour l'analyse complète du scan facial
 */

export interface FacialSignals {
  eye_openness: number;
  blink_frequency: number;
  eye_moisture: number;
  forehead_tension: number;
  brow_position: number;
  jaw_tension: number;
  lip_compression: number;
  facial_symmetry: number;
}

export interface PosturalSignals {
  head_tilt: number;
  head_forward: number;
  shoulder_tension: number;
  neck_tension: number;
}

export interface RespiratorySignals {
  breathing_depth: number;
  breathing_rate: number;
  chest_movement: number;
}

export interface ActivationState {
  primary_state: 'HIGH_ACTIVATION' | 'LOW_ENERGY' | 'REGULATED';
  confidence: number;
  activation_level: number;
}

export interface Recommendations {
  urgency: 'immediate' | 'soon' | 'preventive';
  primary_need: 'calm_down' | 'energize' | 'focus' | 'release_tension' | 'rest' | 'maintain';
  body_area_priority: 'breathing' | 'face' | 'shoulders' | 'whole_body' | 'eyes';
}

export interface VisualContext {
  lighting_quality: number;
  image_clarity: number;
  face_coverage: number;
}

export interface FullAnalysis {
  physiological_signals: {
    facial: FacialSignals;
    postural: PosturalSignals;
    respiratory: RespiratorySignals;
  };
  activation_state: ActivationState;
  recommendations: Recommendations;
  visual_context: VisualContext;
  analysis_notes: string;
}

export interface SkaneResult {
  state: string;
  confidence: number;
  skaneIndex: number;
  analysis: {
    physiological: {
      facial: FacialSignals;
      postural: PosturalSignals;
      respiratory: RespiratorySignals;
    };
    activation: ActivationState;
  };
  action: {
    id: string;
    name: string;
    name_fr: string;
    duration: number;
    category: string;
    instructions: Array<{ text: string; duration: number; type: string }>;
    score: number;
    reasoning: string;
  };
  meta: {
    analysisTime: number;
    modelUsed: string;
    contextUsed: boolean;
    imageQuality: number;
  };
}
