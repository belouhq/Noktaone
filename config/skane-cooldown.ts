// Configuration des cooldowns SKANE selon le feedback

export type SkaneFeedback = 'clear' | 'reduced' | 'still_high';

export interface CooldownConfig {
  cooldownMinutes: number;
  message: string;
  encouragement: string;
}

export const SKANE_COOLDOWN_CONFIG: Record<SkaneFeedback, CooldownConfig> = {
  clear: {
    cooldownMinutes: 15, // 15 minutes - Signal équilibré, court délai pour intégrer le reset
    message: "Votre signal est équilibré",
    encouragement: "Profitez de cet état de sérénité ✨"
  },
  reduced: {
    cooldownMinutes: 10, // 10 minutes - Résultat correct, option de refaire rapidement
    message: "Votre signal s'est apaisé",
    encouragement: "Laissez votre corps intégrer ce reset ✨"
  },
  still_high: {
    cooldownMinutes: 0, // Immédiat - Signal encore élevé, une autre micro-action est proposée sans attente
    message: "Votre signal est encore élevé",
    encouragement: "Essayons une autre approche"
  }
};

export function getNextSkaneTime(feedback: SkaneFeedback): Date | null {
  const config = SKANE_COOLDOWN_CONFIG[feedback];
  if (config.cooldownMinutes === 0) return null;
  
  const nextTime = new Date();
  nextTime.setMinutes(nextTime.getMinutes() + config.cooldownMinutes);
  return nextTime;
}

export function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return "Disponible";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}
