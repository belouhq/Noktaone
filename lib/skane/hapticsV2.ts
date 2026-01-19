/**
 * HAPTICS V2 - Guidage Multi-Modal pour Nokta
 * 
 * PRINCIPE FONDAMENTAL :
 * Le vibreur devient le métronome.
 * La micro-action doit être réalisable SANS regarder l'écran.
 * 
 * PATTERNS :
 * - Inspire : vibration courte répétée (pulse up)
 * - Expire : vibration longue unique (pulse down)
 * - Hold : vibration très légère (sustained)
 * - Pause : silence
 * - Transition : vibration distincte
 * - Fin : signature Nokta (double long)
 * 
 * CARACTÉRISTIQUES :
 * - Vibrations différenciées
 * - Jamais agressives
 * - Reconnaissables en 2 cycles
 */

// Vérifier si le vibreur est supporté
export function isHapticSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

// Patterns définis (durées en ms)
const HAPTIC_PATTERNS = {
  // Inspire : 2 vibrations courtes rapprochées (feeling "up")
  INHALE_START: [40, 60, 40] as number[],
  INHALE_TICK: 30,
  
  // Expire : 1 vibration longue douce (feeling "down")
  EXHALE_START: 150,
  EXHALE_TICK: 20,
  
  // Hold : micro-vibration subtile
  HOLD_TICK: 15,
  
  // Transition entre phases
  TRANSITION: 100,
  
  // Fin de cycle
  CYCLE_END: 180,
  
  // Signature de fin Nokta (reconnaissable)
  END_SIGNATURE: [150, 100, 150, 100, 250] as number[],
  
  // Feedback utilisateur
  FEEDBACK_TAP: 50,
  
  // Erreur / alerte
  ERROR: [100, 50, 100] as number[],
};

// Déclencher une vibration
function vibrate(pattern: number | number[]): void {
  if (!isHapticSupported()) {
    console.log(`[HAPTIC V2] Pattern: ${JSON.stringify(pattern)} (not supported)`);
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn("[HAPTIC V2] Error:", error);
  }
}

// Arrêter toute vibration en cours
function stopVibration(): void {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
}

/**
 * API Haptique V2
 */
export const hapticV2 = {
  // === INSPIRE ===
  inhaleStart: () => vibrate(HAPTIC_PATTERNS.INHALE_START),
  inhaleTick: () => vibrate(HAPTIC_PATTERNS.INHALE_TICK),
  
  // === EXPIRE ===
  exhaleStart: () => vibrate(HAPTIC_PATTERNS.EXHALE_START),
  exhaleTick: () => vibrate(HAPTIC_PATTERNS.EXHALE_TICK),
  
  // === HOLD ===
  holdTick: () => vibrate(HAPTIC_PATTERNS.HOLD_TICK),
  
  // === PAUSE ===
  // Pas de vibration pendant la pause
  pauseTick: () => {}, // Silence intentionnel
  
  // === TRANSITIONS ===
  transition: () => vibrate(HAPTIC_PATTERNS.TRANSITION),
  cycleEnd: () => vibrate(HAPTIC_PATTERNS.CYCLE_END),
  
  // === FIN ===
  endSignature: () => vibrate(HAPTIC_PATTERNS.END_SIGNATURE),
  
  // === FEEDBACK ===
  feedbackTap: () => vibrate(HAPTIC_PATTERNS.FEEDBACK_TAP),
  
  // === ERREUR ===
  error: () => vibrate(HAPTIC_PATTERNS.ERROR),
  
  // === CONTRÔLE ===
  stop: () => stopVibration(),
  
  // === HELPER : Vibration selon le type de phase ===
  forPhase: (type: "inhale" | "exhale" | "hold" | "pause" | "action", isStart: boolean) => {
    if (isStart) {
      // Vibration de début de phase
      switch (type) {
        case "inhale":
          hapticV2.inhaleStart();
          break;
        case "exhale":
          hapticV2.exhaleStart();
          break;
        case "hold":
        case "action":
          hapticV2.transition();
          break;
        case "pause":
          // Silence
          break;
      }
    } else {
      // Tick pendant la phase
      switch (type) {
        case "inhale":
          hapticV2.inhaleTick();
          break;
        case "exhale":
          hapticV2.exhaleTick();
          break;
        case "hold":
        case "action":
          hapticV2.holdTick();
          break;
        case "pause":
          // Silence
          break;
      }
    }
  },
  
  // === COMPATIBILITÉ V1 (pour transition) ===
  inhale: () => hapticV2.inhaleStart(),
  exhale: () => hapticV2.exhaleStart(),
  hold: () => hapticV2.transition(),
  tick: () => hapticV2.feedbackTap(),
  long: () => hapticV2.cycleEnd(),
};

/**
 * Séquence haptique pour respiration
 * Gère automatiquement les patterns selon la phase
 */
export class HapticBreathingGuide {
  private currentPhase: "inhale" | "exhale" | "hold" | "pause" | "action" = "pause";
  private intervalId: NodeJS.Timeout | null = null;
  
  startPhase(
    phase: "inhale" | "exhale" | "hold" | "pause" | "action",
    durationSeconds: number
  ): void {
    this.stopPhase();
    this.currentPhase = phase;
    
    // Vibration de début
    hapticV2.forPhase(phase, true);
    
    // Si pause, pas de tick
    if (phase === "pause") return;
    
    // Ticks pendant la phase
    const tickInterval = phase === "inhale" ? 800 : 1000;
    
    this.intervalId = setInterval(() => {
      hapticV2.forPhase(this.currentPhase, false);
    }, tickInterval);
  }
  
  stopPhase(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  endCycle(): void {
    this.stopPhase();
    hapticV2.cycleEnd();
  }
  
  complete(): void {
    this.stopPhase();
    hapticV2.endSignature();
  }
}

export default hapticV2;
