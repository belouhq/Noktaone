/**
 * Haptic Metronome - Nokta One
 * 
 * Permet d'exécuter les micro-actions sans regarder l'écran.
 * Vibrations rythmées pour guider respiration et timing.
 * 
 * Patterns :
 * - INHALE : vibration courte au début
 * - EXHALE : double vibration courte au début
 * - HOLD : vibration longue douce
 * - TICK : micro-vibration chaque seconde
 * - COMPLETE : pattern célébration
 */

// ============================================
// TYPES
// ============================================

export type HapticPattern = 
  | 'inhale'      // Début inspiration
  | 'exhale'      // Début expiration
  | 'hold'        // Maintien (apnée)
  | 'tick'        // Chaque seconde
  | 'start'       // Début action
  | 'complete'    // Fin action (célébration)
  | 'warning';    // Attention (5s restantes)

interface HapticConfig {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'strong';
}

// ============================================
// CONFIG
// ============================================

const DEFAULT_CONFIG: HapticConfig = {
  enabled: true,
  intensity: 'medium',
};

// Durées en ms selon l'intensité
const DURATIONS: Record<HapticConfig['intensity'], Record<string, number>> = {
  light: { short: 10, medium: 30, long: 50 },
  medium: { short: 20, medium: 50, long: 100 },
  strong: { short: 30, medium: 80, long: 150 },
};

// ============================================
// HELPERS
// ============================================

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

function vibrate(pattern: number | number[]): boolean {
  if (!canVibrate()) return false;
  
  try {
    navigator.vibrate(pattern);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// HAPTIC PATTERNS
// ============================================

/**
 * Joue un pattern haptique
 */
export function playHaptic(
  pattern: HapticPattern, 
  config: HapticConfig = DEFAULT_CONFIG
): boolean {
  if (!config.enabled || !canVibrate()) return false;

  const d = DURATIONS[config.intensity];

  switch (pattern) {
    case 'inhale':
      // Une vibration courte = "inspire"
      return vibrate(d.medium);

    case 'exhale':
      // Deux vibrations courtes = "expire"
      return vibrate([d.short, 50, d.short]);

    case 'hold':
      // Vibration longue douce = "maintiens"
      return vibrate(d.long);

    case 'tick':
      // Micro-vibration = compteur
      return vibrate(d.short);

    case 'start':
      // Pattern de démarrage
      return vibrate([d.short, 100, d.short, 100, d.medium]);

    case 'complete':
      // Pattern de célébration
      return vibrate([d.short, 80, d.short, 80, d.short, 150, d.long]);

    case 'warning':
      // Deux vibrations = attention
      return vibrate([d.medium, 100, d.medium]);

    default:
      return false;
  }
}

/**
 * Arrête toutes les vibrations
 */
export function stopHaptic(): void {
  if (canVibrate()) {
    navigator.vibrate(0);
  }
}

// ============================================
// BREATHING METRONOME
// ============================================

interface BreathingMetronomeConfig {
  inhaleSeconds: number;
  holdAfterInhale?: number;
  exhaleSeconds: number;
  holdAfterExhale?: number;
  cycles: number;
  hapticConfig?: HapticConfig;
  onPhaseChange?: (phase: 'inhale' | 'hold' | 'exhale' | 'hold_after' | 'complete') => void;
  onTick?: (secondsRemaining: number) => void;
  onComplete?: () => void;
}

/**
 * Métronome haptique pour exercices de respiration
 * Vibre au début de chaque phase + tick optionnel
 */
export function startBreathingMetronome(config: BreathingMetronomeConfig): () => void {
  const {
    inhaleSeconds,
    holdAfterInhale = 0,
    exhaleSeconds,
    holdAfterExhale = 0,
    cycles,
    hapticConfig = DEFAULT_CONFIG,
    onPhaseChange,
    onTick,
    onComplete,
  } = config;

  let currentCycle = 0;
  let currentPhase: 'inhale' | 'hold' | 'exhale' | 'hold_after' = 'inhale';
  let phaseSecondsRemaining = inhaleSeconds;
  let intervalId: NodeJS.Timeout | null = null;
  let isRunning = true;

  // Signal de démarrage
  playHaptic('start', hapticConfig);
  onPhaseChange?.('inhale');

  // Vibration initiale pour inhale
  setTimeout(() => {
    if (isRunning) playHaptic('inhale', hapticConfig);
  }, 300);

  intervalId = setInterval(() => {
    if (!isRunning) return;

    phaseSecondsRemaining--;
    onTick?.(phaseSecondsRemaining);

    // Tick haptique chaque seconde (optionnel, peut être désactivé)
    // playHaptic('tick', hapticConfig);

    if (phaseSecondsRemaining <= 0) {
      // Passer à la phase suivante
      switch (currentPhase) {
        case 'inhale':
          if (holdAfterInhale > 0) {
            currentPhase = 'hold';
            phaseSecondsRemaining = holdAfterInhale;
            playHaptic('hold', hapticConfig);
            onPhaseChange?.('hold');
          } else {
            currentPhase = 'exhale';
            phaseSecondsRemaining = exhaleSeconds;
            playHaptic('exhale', hapticConfig);
            onPhaseChange?.('exhale');
          }
          break;

        case 'hold':
          currentPhase = 'exhale';
          phaseSecondsRemaining = exhaleSeconds;
          playHaptic('exhale', hapticConfig);
          onPhaseChange?.('exhale');
          break;

        case 'exhale':
          if (holdAfterExhale > 0) {
            currentPhase = 'hold_after';
            phaseSecondsRemaining = holdAfterExhale;
            playHaptic('hold', hapticConfig);
            onPhaseChange?.('hold_after');
          } else {
            // Fin du cycle
            currentCycle++;
            if (currentCycle >= cycles) {
              // Terminé
              isRunning = false;
              if (intervalId) clearInterval(intervalId);
              playHaptic('complete', hapticConfig);
              onPhaseChange?.('complete');
              onComplete?.();
            } else {
              // Cycle suivant
              currentPhase = 'inhale';
              phaseSecondsRemaining = inhaleSeconds;
              playHaptic('inhale', hapticConfig);
              onPhaseChange?.('inhale');
            }
          }
          break;

        case 'hold_after':
          currentCycle++;
          if (currentCycle >= cycles) {
            isRunning = false;
            if (intervalId) clearInterval(intervalId);
            playHaptic('complete', hapticConfig);
            onPhaseChange?.('complete');
            onComplete?.();
          } else {
            currentPhase = 'inhale';
            phaseSecondsRemaining = inhaleSeconds;
            playHaptic('inhale', hapticConfig);
            onPhaseChange?.('inhale');
          }
          break;
      }
    }

    // Warning à 5 secondes de la fin totale
    const totalRemaining = calculateTotalRemaining(
      currentCycle, cycles, currentPhase, phaseSecondsRemaining,
      inhaleSeconds, holdAfterInhale, exhaleSeconds, holdAfterExhale
    );
    if (totalRemaining === 5) {
      playHaptic('warning', hapticConfig);
    }

  }, 1000);

  // Retourne fonction de cleanup
  return () => {
    isRunning = false;
    if (intervalId) clearInterval(intervalId);
    stopHaptic();
  };
}

function calculateTotalRemaining(
  currentCycle: number,
  totalCycles: number,
  currentPhase: string,
  phaseRemaining: number,
  inhale: number,
  hold1: number,
  exhale: number,
  hold2: number
): number {
  const cycleLength = inhale + hold1 + exhale + hold2;
  const remainingCycles = totalCycles - currentCycle - 1;
  
  let phaseOffset = 0;
  switch (currentPhase) {
    case 'inhale': phaseOffset = hold1 + exhale + hold2; break;
    case 'hold': phaseOffset = exhale + hold2; break;
    case 'exhale': phaseOffset = hold2; break;
    case 'hold_after': phaseOffset = 0; break;
  }

  return phaseRemaining + phaseOffset + (remainingCycles * cycleLength);
}

// ============================================
// SIMPLE TIMER METRONOME
// ============================================

/**
 * Métronome simple pour actions non-respiratoires
 * Tick haptique à intervalles réguliers
 */
export function startTimerMetronome(
  durationSeconds: number,
  tickIntervalSeconds: number = 5,
  hapticConfig: HapticConfig = DEFAULT_CONFIG,
  onTick?: (remaining: number) => void,
  onComplete?: () => void
): () => void {
  let remaining = durationSeconds;
  let isRunning = true;

  playHaptic('start', hapticConfig);

  const intervalId = setInterval(() => {
    if (!isRunning) return;

    remaining--;
    onTick?.(remaining);

    // Tick à intervalle régulier
    if (remaining > 0 && remaining % tickIntervalSeconds === 0) {
      playHaptic('tick', hapticConfig);
    }

    // Warning à 5s
    if (remaining === 5) {
      playHaptic('warning', hapticConfig);
    }

    if (remaining <= 0) {
      isRunning = false;
      clearInterval(intervalId);
      playHaptic('complete', hapticConfig);
      onComplete?.();
    }
  }, 1000);

  return () => {
    isRunning = false;
    clearInterval(intervalId);
    stopHaptic();
  };
}

// ============================================
// USER PREFERENCES
// ============================================

const HAPTIC_STORAGE_KEY = 'nokta_haptic_enabled';

export function getHapticPreference(): boolean {
  if (typeof localStorage === 'undefined') return true;
  const stored = localStorage.getItem(HAPTIC_STORAGE_KEY);
  return stored !== 'false';
}

export function setHapticPreference(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(HAPTIC_STORAGE_KEY, String(enabled));
}

// ============================================
// EXPORTS
// ============================================

export { canVibrate, DEFAULT_CONFIG };
export type { HapticConfig, BreathingMetronomeConfig };
