import { SkaneResult, UserFeedback, MicroActionType, InternalState } from './types';

const STORAGE_KEY = 'nokta_one_skanes';
const MAX_STORED_SKANES = 100;

export function saveSkane(skane: SkaneResult): void {
  const skanes = getStoredSkanes();
  skanes.push(skane);
  
  // Garder seulement les derniers MAX_STORED_SKANES
  if (skanes.length > MAX_STORED_SKANES) {
    skanes.splice(0, skanes.length - MAX_STORED_SKANES);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skanes));
}

export function getStoredSkanes(): SkaneResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    // Convertir les timestamps string en Date objects
    return parsed.map((skane: any) => ({
      ...skane,
      timestamp: new Date(skane.timestamp)
    }));
  } catch {
    return [];
  }
}

export function updateSkaneFeedback(skaneId: string, feedback: UserFeedback): void {
  const skanes = getStoredSkanes();
  const index = skanes.findIndex(s => s.id === skaneId);
  
  if (index !== -1) {
    skanes[index].feedback = feedback;
    skanes[index].skaneIndexAfter = calculateAfterIndex(
      skanes[index].skaneIndexBefore,
      feedback
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skanes));
  }
}

export function getSkanes24h(): SkaneResult[] {
  const skanes = getStoredSkanes();
  const now = Date.now();
  const h24 = 24 * 60 * 60 * 1000;
  
  return skanes.filter(skane => {
    const skaneTime = new Date(skane.timestamp).getTime();
    return now - skaneTime < h24;
  });
}

export function calculateInvitations(): number {
  const skanes24h = getSkanes24h();
  return Math.floor(skanes24h.length / 3);
}

// Génère un ID unique
export function generateSkaneId(): string {
  return `skane_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calcule le Skane Index "après" basé sur le feedback
function calculateAfterIndex(beforeIndex: number, feedback: UserFeedback): number {
  switch (feedback) {
    case 'better':
      // Réduction significative (effet wow)
      return Math.max(10, beforeIndex - Math.floor(Math.random() * 30 + 40));
    case 'same':
      // Légère réduction
      return Math.max(15, beforeIndex - Math.floor(Math.random() * 15 + 10));
    case 'worse':
      // Pas de changement ou légère augmentation
      return Math.min(95, beforeIndex + Math.floor(Math.random() * 10));
    default:
      return beforeIndex - 20;
  }
}
