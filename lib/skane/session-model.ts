/**
 * SkaneSession Model - NOKTA ONE V1.0
 * 
 * Modèle de session SKANE avec persistance locale
 * Cooldown logic (2 heures)
 */

export interface SkaneSession {
  id: string;
  createdAt: Date;
  signalLabel: string; // "High Activation", "Low Energy", "Regulated"
  beforePct: number; // 0-100
  afterPct?: number; // 0-100 (calculé après feedback)
  actionLabel: string; // "Physiological Sigh", etc.
  feedback?: 'worse' | 'same' | 'better';
  emoji?: '😕' | '😐' | '🙂';
}

const STORAGE_KEY = 'nokta_one_sessions';
const MAX_SESSIONS = 10;
const COOLDOWN_HOURS = 2;

/**
 * Créer une nouvelle session
 */
export function createSession(data: {
  signalLabel: string;
  beforePct: number;
  actionLabel: string;
}): SkaneSession {
  return {
    id: `skane_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    signalLabel: data.signalLabel,
    beforePct: data.beforePct,
    actionLabel: data.actionLabel,
  };
}

/**
 * Sauvegarder une session
 */
export function saveSession(session: SkaneSession): void {
  const sessions = getSessions();
  sessions.push(session);
  
  // Garder seulement les MAX_SESSIONS derniers
  if (sessions.length > MAX_SESSIONS) {
    sessions.splice(0, sessions.length - MAX_SESSIONS);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/**
 * Récupérer toutes les sessions
 */
export function getSessions(): SkaneSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Mettre à jour le feedback d'une session
 */
export function updateSessionFeedback(
  sessionId: string,
  feedback: 'worse' | 'same' | 'better'
): void {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (session) {
    session.feedback = feedback;
    session.emoji = feedback === 'better' ? '🙂' : feedback === 'same' ? '😐' : '😕';
    
    // Calculer afterPct basé sur le feedback
    session.afterPct = calculateAfterPct(session.beforePct, feedback);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
}

/**
 * Calculer le afterPct basé sur le feedback
 */
function calculateAfterPct(
  beforePct: number,
  feedback: 'worse' | 'same' | 'better'
): number {
  switch (feedback) {
    case 'better':
      // Réduction significative (effet wow)
      return Math.max(10, beforePct - Math.floor(Math.random() * 30 + 40));
    case 'same':
      // Légère réduction
      return Math.max(15, beforePct - Math.floor(Math.random() * 15 + 10));
    case 'worse':
      // Pas de changement ou légère augmentation
      return Math.min(95, beforePct + Math.floor(Math.random() * 10));
    default:
      return beforePct - 20;
  }
}

/**
 * Vérifier le cooldown (2 heures)
 */
export function isCooldownActive(): boolean {
  const sessions = getSessions();
  if (sessions.length === 0) return false;
  
  const lastSession = sessions[sessions.length - 1];
  const lastSessionTime = lastSession.createdAt.getTime();
  const now = Date.now();
  const hoursSince = (now - lastSessionTime) / (1000 * 60 * 60);
  
  return hoursSince < COOLDOWN_HOURS;
}

/**
 * Obtenir les heures restantes du cooldown
 */
export function getCooldownHoursRemaining(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;
  
  const lastSession = sessions[sessions.length - 1];
  const lastSessionTime = lastSession.createdAt.getTime();
  const now = Date.now();
  const hoursSince = (now - lastSessionTime) / (1000 * 60 * 60);
  
  if (hoursSince >= COOLDOWN_HOURS) return 0;
  
  return Math.ceil(COOLDOWN_HOURS - hoursSince);
}

/**
 * Obtenir la dernière session
 */
export function getLastSession(): SkaneSession | null {
  const sessions = getSessions();
  return sessions.length > 0 ? sessions[sessions.length - 1] : null;
}

/**
 * Formater une date pour l'affichage
 */
export function formatSessionDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Today – ${hours}:${minutes}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysAgo} days ago`;
  }
}

/**
 * Obtenir les 3 dernières sessions pour l'historique
 */
export function getRecentSessions(limit: number = 3): SkaneSession[] {
  const sessions = getSessions();
  return sessions.slice(-limit).reverse();
}
