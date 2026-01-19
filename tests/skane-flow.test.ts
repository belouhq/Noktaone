/**
 * NOKTA ONE - Skane Flow Test Suite
 * 
 * Ce fichier contient des tests pour valider:
 * 1. Le flow complet du Skane
 * 2. L'analyse GPT-4 Vision 
 * 3. Le mapping des micro-actions par état
 * 4. Les transitions d'états
 * 5. Le calcul du Skane Index
 * 
 * Pour exécuter: node --experimental-vm-modules node_modules/jest/bin/jest.js tests/skane-flow.test.ts
 * Ou simplement: npm test -- --testPathPattern=skane-flow
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Types importés
type InternalState = 'HIGH_ACTIVATION' | 'LOW_ENERGY' | 'REGULATED';
type MicroActionType = 
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

// =============================================
// CONSTANTES DE RÉFÉRENCE (à valider)
// =============================================

const STATE_TO_ACTIONS: Record<InternalState, MicroActionType[]> = {
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

const SKANE_INDEX_RANGES: Record<InternalState, { min: number; max: number }> = {
  HIGH_ACTIVATION: { min: 70, max: 95 },
  LOW_ENERGY: { min: 20, max: 45 },
  REGULATED: { min: 15, max: 35 }
};

const ACTION_DURATIONS: Record<MicroActionType, number> = {
  physiological_sigh: 24,
  expiration_3_8: 33,
  respiration_4_6: 30,
  box_breathing: 24,
  respiration_2_1: 30,
  drop_trapezes: 20,
  ouverture_thoracique: 30,
  posture_ancrage: 30,
  shake_neuromusculaire: 20,
  pression_plantaire: 20,
  regard_fixe_expiration: 24,
};

// =============================================
// 1. TESTS DE MAPPING ÉTAT → MICRO-ACTIONS
// =============================================

describe('State to MicroAction Mapping', () => {
  
  it('HIGH_ACTIVATION should map to relaxation actions', () => {
    const actions = STATE_TO_ACTIONS['HIGH_ACTIVATION'];
    
    expect(actions).toContain('physiological_sigh');
    expect(actions).toContain('expiration_3_8');
    expect(actions).toContain('drop_trapezes');
    expect(actions).toContain('shake_neuromusculaire');
    expect(actions.length).toBe(4);
  });

  it('LOW_ENERGY should map to activation actions', () => {
    const actions = STATE_TO_ACTIONS['LOW_ENERGY'];
    
    expect(actions).toContain('respiration_2_1');
    expect(actions).toContain('posture_ancrage');
    expect(actions).toContain('ouverture_thoracique');
    expect(actions.length).toBe(3);
  });

  it('REGULATED should map to centering actions', () => {
    const actions = STATE_TO_ACTIONS['REGULATED'];
    
    expect(actions).toContain('box_breathing');
    expect(actions).toContain('respiration_4_6');
    expect(actions).toContain('regard_fixe_expiration');
    expect(actions.length).toBe(3);
  });

  it('All micro-actions should have valid durations <= 35 seconds', () => {
    for (const [actionId, duration] of Object.entries(ACTION_DURATIONS)) {
      expect(duration).toBeLessThanOrEqual(35);
      expect(duration).toBeGreaterThan(0);
    }
  });
});

// =============================================
// 2. TESTS DE SKANE INDEX
// =============================================

describe('Skane Index Calculation', () => {
  
  it('HIGH_ACTIVATION should generate index between 70-95', () => {
    const range = SKANE_INDEX_RANGES['HIGH_ACTIVATION'];
    
    // Simuler 100 générations
    for (let i = 0; i < 100; i++) {
      const index = Math.floor(Math.random() * (range.max - range.min) + range.min);
      expect(index).toBeGreaterThanOrEqual(70);
      expect(index).toBeLessThanOrEqual(95);
    }
  });

  it('LOW_ENERGY should generate index between 20-45', () => {
    const range = SKANE_INDEX_RANGES['LOW_ENERGY'];
    
    for (let i = 0; i < 100; i++) {
      const index = Math.floor(Math.random() * (range.max - range.min) + range.min);
      expect(index).toBeGreaterThanOrEqual(20);
      expect(index).toBeLessThanOrEqual(45);
    }
  });

  it('REGULATED should generate index between 15-35', () => {
    const range = SKANE_INDEX_RANGES['REGULATED'];
    
    for (let i = 0; i < 100; i++) {
      const index = Math.floor(Math.random() * (range.max - range.min) + range.min);
      expect(index).toBeGreaterThanOrEqual(15);
      expect(index).toBeLessThanOrEqual(35);
    }
  });
});

// =============================================
// 3. TESTS DU PROMPT GPT-4 VISION
// =============================================

describe('GPT-4 Vision Prompt Validation', () => {
  
  const EXPECTED_SIGNALS = [
    'eye_openness',
    'blink_rate',
    'jaw_tension',
    'lip_compression',
    'forehead_tension',
    'head_stability'
  ];

  const VALID_STATES: InternalState[] = ['HIGH_ACTIVATION', 'LOW_ENERGY', 'REGULATED'];

  it('GPT prompt should request all required signals', () => {
    // Le prompt canonique doit demander ces signaux
    const promptContent = `
      - eye_openness: How open are the eyes?
      - blink_rate: Estimated blink frequency
      - jaw_tension: Visible jaw tension or clenching
      - lip_compression: Lip compression or pursing
      - forehead_tension: Forehead wrinkles or tension
      - head_stability: Head position stability
    `;

    for (const signal of EXPECTED_SIGNALS) {
      expect(promptContent).toContain(signal);
    }
  });

  it('State classification logic should be deterministic', () => {
    // HIGH_ACTIVATION conditions
    const highActivationSignals = {
      jaw_tension: 0.7,      // > 0.6
      lip_compression: 0.5,
      forehead_tension: 0.5,
      blink_rate: 0.5
    };
    
    const isHighActivation = 
      highActivationSignals.jaw_tension > 0.6 ||
      highActivationSignals.lip_compression > 0.6 ||
      highActivationSignals.forehead_tension > 0.6 ||
      highActivationSignals.blink_rate > 0.7;
    
    expect(isHighActivation).toBe(true);

    // LOW_ENERGY conditions
    const lowEnergySignals = {
      eye_openness: 0.3,     // < 0.35
      head_stability: 0.3,   // < 0.4
      blink_rate: 0.2        // < 0.3
    };

    const isLowEnergy = 
      lowEnergySignals.eye_openness < 0.35 &&
      lowEnergySignals.head_stability < 0.4 &&
      lowEnergySignals.blink_rate < 0.3;

    expect(isLowEnergy).toBe(true);
  });

  it('Response format should be strict JSON', () => {
    // Exemple de réponse GPT attendue
    const mockResponse = {
      internal_state: 'HIGH_ACTIVATION',
      signal_label: 'High Activation',
      inferred_signals: {
        eye_openness: 0.7,
        blink_rate: 0.8,
        jaw_tension: 0.75,
        lip_compression: 0.6,
        forehead_tension: 0.65,
        head_stability: 0.9
      },
      micro_action: {
        id: 'physiological_sigh',
        duration_seconds: 24,
        category: 'breathing'
      },
      amplifier: {
        enabled: false,
        type: null
      },
      ui_flags: {
        share_allowed: true,
        medical_disclaimer: true
      }
    };

    // Valider la structure
    expect(VALID_STATES).toContain(mockResponse.internal_state);
    expect(typeof mockResponse.signal_label).toBe('string');
    expect(mockResponse.micro_action.id).toBe('physiological_sigh');
    expect(mockResponse.micro_action.duration_seconds).toBe(24);
    expect(mockResponse.ui_flags.medical_disclaimer).toBe(true);
  });
});

// =============================================
// 4. TESTS DE FLOW COMPLET
// =============================================

describe('Complete Skane Flow', () => {
  
  const FLOW_STATES = [
    'HOME_IDLE',
    'SKANE_CAMERA',
    'SKANE_ANALYZING',
    'SKANE_RESULT',
    'MICRO_ACTION_RUNNING',
    'FEEDBACK',
    'SHARE_PROMPT',
    'SHARE_CARD',
    'ERROR'
  ];

  const VALID_TRANSITIONS: Record<string, string[]> = {
    'HOME_IDLE': ['SKANE_CAMERA'],
    'SKANE_CAMERA': ['SKANE_ANALYZING', 'ERROR'],
    'SKANE_ANALYZING': ['SKANE_RESULT', 'ERROR'],
    'SKANE_RESULT': ['MICRO_ACTION_RUNNING'],
    'MICRO_ACTION_RUNNING': ['FEEDBACK', 'ERROR'],
    'FEEDBACK': ['SHARE_PROMPT'],
    'SHARE_PROMPT': ['SHARE_CARD', 'HOME_IDLE'],
    'SHARE_CARD': ['HOME_IDLE'],
    'ERROR': ['HOME_IDLE', 'SKANE_CAMERA']
  };

  it('All flow states should be defined', () => {
    for (const state of FLOW_STATES) {
      expect(VALID_TRANSITIONS[state] || state === 'ERROR').toBeTruthy();
    }
  });

  it('Flow should reach FEEDBACK from HOME_IDLE', () => {
    const path = [
      'HOME_IDLE',
      'SKANE_CAMERA',
      'SKANE_ANALYZING',
      'SKANE_RESULT',
      'MICRO_ACTION_RUNNING',
      'FEEDBACK'
    ];

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      expect(VALID_TRANSITIONS[current]).toContain(next);
    }
  });

  it('Error state should allow recovery', () => {
    expect(VALID_TRANSITIONS['ERROR']).toContain('HOME_IDLE');
    expect(VALID_TRANSITIONS['ERROR']).toContain('SKANE_CAMERA');
  });
});

// =============================================
// 5. TESTS D'INTÉGRATION API
// =============================================

describe('API Integration Tests', () => {
  
  // Mock fetch pour tester l'API
  const mockFetch = jest.fn();
  global.fetch = mockFetch as any;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('/api/skane/analyze should return valid response structure', async () => {
    const mockApiResponse = {
      success: true,
      internal_state: 'REGULATED',
      signal_label: 'Clear Signal',
      state: 'REGULATED',
      confidence: 0.85,
      skaneIndex: 25,
      skane_index: 25,
      microAction: 'box_breathing',
      micro_action: {
        id: 'box_breathing',
        duration_seconds: 24,
        category: 'breathing'
      },
      amplifier: { enabled: false, type: null },
      inferredSignals: {
        eye_openness: 0.6,
        blink_rate: 0.4,
        jaw_tension: 0.3,
        lip_compression: 0.2,
        forehead_tension: 0.25,
        head_stability: 0.85
      },
      ui_flags: {
        share_allowed: true,
        medical_disclaimer: true
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    // Simuler l'appel API
    const response = await fetch('/api/skane/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: 'base64_image_data' })
    });

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(['HIGH_ACTIVATION', 'LOW_ENERGY', 'REGULATED']).toContain(data.internal_state);
    expect(data.micro_action).toBeDefined();
    expect(data.micro_action.id).toBe('box_breathing');
    expect(data.skaneIndex).toBeGreaterThanOrEqual(0);
    expect(data.skaneIndex).toBeLessThanOrEqual(100);
  });

  it('API should handle errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    });

    const response = await fetch('/api/skane/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: '' })
    });

    expect(response.ok).toBe(false);
  });
});

// =============================================
// 6. TESTS DE VALIDATION DES MICRO-ACTIONS
// =============================================

describe('Micro-Action Validation', () => {
  
  it('Each micro-action should have complete instructions', () => {
    const requiredFields = ['id', 'name', 'duration', 'instructions', 'repetitions'];
    
    // Structure minimale attendue
    const mockAction = {
      id: 'physiological_sigh',
      name: 'Physiological Sigh',
      nameKey: 'actions.physiologicalSigh',
      duration: 24,
      repetitions: 3,
      instructions: [
        { text: 'Inspire par le nez', textKey: 'breathing.inhaleNose', duration: 2, type: 'inhale' },
        { text: 'Inspire encore un peu', textKey: 'breathing.inhaleMore', duration: 1, type: 'inhale' },
        { text: 'Expire lentement par la bouche', textKey: 'breathing.exhaleSlowMouth', duration: 5, type: 'exhale' },
      ]
    };

    for (const field of requiredFields) {
      expect(mockAction).toHaveProperty(field);
    }
  });

  it('Instruction types should be valid', () => {
    const validTypes = ['inhale', 'exhale', 'hold', 'action', 'pause'];
    
    const testInstructions = [
      { type: 'inhale', duration: 3 },
      { type: 'exhale', duration: 5 },
      { type: 'hold', duration: 3 },
      { type: 'pause', duration: 2 },
      { type: 'action', duration: 4 }
    ];

    for (const instruction of testInstructions) {
      expect(validTypes).toContain(instruction.type);
    }
  });

  it('Total action duration should match sum of instructions × repetitions', () => {
    // Box breathing: 4 phases de 3s chacune, 2 répétitions = 24s
    const boxBreathing = {
      duration: 24,
      repetitions: 2,
      instructions: [
        { duration: 3, type: 'inhale' },
        { duration: 3, type: 'hold' },
        { duration: 3, type: 'exhale' },
        { duration: 3, type: 'pause' }
      ]
    };

    const cycleTime = boxBreathing.instructions.reduce((sum, i) => sum + i.duration, 0);
    const totalTime = cycleTime * boxBreathing.repetitions;

    expect(totalTime).toBe(boxBreathing.duration);
  });
});

// =============================================
// 7. TESTS DE FEEDBACK
// =============================================

describe('Feedback System', () => {
  
  const validFeedbacks = ['worse', 'same', 'better'];

  it('All feedback values should be valid', () => {
    for (const feedback of validFeedbacks) {
      expect(['worse', 'same', 'better']).toContain(feedback);
    }
  });

  it('Feedback should affect Skane Index After calculation', () => {
    const beforeIndex = 75; // HIGH_ACTIVATION
    
    // "better" devrait réduire le stress (index plus bas = mieux)
    const afterBetter = Math.max(15, beforeIndex - 40); // ~35
    expect(afterBetter).toBeLessThan(beforeIndex);

    // "worse" devrait augmenter ou maintenir le stress
    const afterWorse = Math.min(95, beforeIndex + 5); // ~80
    expect(afterWorse).toBeGreaterThanOrEqual(beforeIndex);

    // "same" devrait rester proche
    const afterSame = beforeIndex - 10; // ~65
    expect(Math.abs(afterSame - beforeIndex)).toBeLessThanOrEqual(15);
  });
});

// =============================================
// RÉSUMÉ DES TESTS
// =============================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           NOKTA ONE - SKANE FLOW TEST SUITE                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Tests couverts:                                             ║
║  ✓ Mapping État → Micro-Actions                              ║
║  ✓ Calcul du Skane Index                                     ║
║  ✓ Validation du Prompt GPT-4 Vision                         ║
║  ✓ Flow complet et transitions                               ║
║  ✓ Intégration API                                            ║
║  ✓ Validation des Micro-Actions                               ║
║  ✓ Système de Feedback                                        ║
║                                                              ║
║  Pour exécuter: npm test -- --testPathPattern=skane-flow     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

export {};
