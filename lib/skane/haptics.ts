// Types de vibration
type HapticType = 'SHORT' | 'LONG' | 'TRANSITION' | 'DOUBLE_LONG';

// Durées en millisecondes
const HAPTIC_DURATIONS: Record<HapticType, number | number[]> = {
  SHORT: 12, // 10-15ms pour tap primaire (neuro-ergonomie)
  LONG: 120,
  TRANSITION: 200,
  DOUBLE_LONG: [120, 100, 120], // vibration, pause, vibration
};

// Vérifier si le vibreur est supporté
export function isHapticSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

// Déclencher une vibration
export function triggerHaptic(type: HapticType): void {
  if (!isHapticSupported()) {
    console.log(`[HAPTIC] ${type} (not supported)`);
    return;
  }

  try {
    const duration = HAPTIC_DURATIONS[type];
    navigator.vibrate(duration);
  } catch (error) {
    console.warn('Haptic error:', error);
  }
}

// Raccourcis
export const haptic = {
  tick: () => triggerHaptic('SHORT'),
  long: () => triggerHaptic('LONG'),
  transition: () => triggerHaptic('TRANSITION'),
  end: () => triggerHaptic('DOUBLE_LONG'),
};

// Séquence haptique pour le compte à rebours
export function startHapticCountdown(
  seconds: number,
  onTick?: (remaining: number) => void,
  onComplete?: () => void
): { stop: () => void } {
  let remaining = seconds;
  let intervalId: NodeJS.Timeout | null = null;

  intervalId = setInterval(() => {
    if (remaining > 0) {
      haptic.tick();
      onTick?.(remaining);
      remaining--;
    } else {
      if (intervalId) clearInterval(intervalId);
      haptic.long();
      onComplete?.();
    }
  }, 1000);

  return {
    stop: () => {
      if (intervalId) clearInterval(intervalId);
    }
  };
}
