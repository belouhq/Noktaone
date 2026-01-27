import { getStoredSkanes } from '@/lib/skane/storage';

/**
 * Calcule le nombre de jours de streak consécutifs
 * Un streak est maintenu si l'utilisateur fait au moins un skane par jour
 */
export function calculateStreak(): number {
  if (typeof window === 'undefined') return 0;
  
  const skanes = getStoredSkanes();
  if (skanes.length === 0) return 0;

  // Trier par date (plus récent en premier)
  const sortedSkanes = [...skanes].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Grouper par jour
  const daysWithSkanes = new Set<string>();
  sortedSkanes.forEach(skane => {
    const date = new Date(skane.timestamp);
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    daysWithSkanes.add(dayKey);
  });

  // Calculer le streak consécutif
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dayKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
    
    if (daysWithSkanes.has(dayKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Si c'est aujourd'hui et qu'il n'y a pas de skane, on continue quand même
      // Sinon on arrête le streak
      if (currentDate.getTime() === today.getTime()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

/**
 * Formate la date d'inscription depuis localStorage
 */
export function getMemberSince(): string {
  if (typeof window === 'undefined') return 'Jan 2026';
  
  const savedUser = localStorage.getItem('user');
  if (!savedUser) {
    // Fallback: utiliser la date du premier skane
    const skanes = getStoredSkanes();
    if (skanes.length > 0) {
      const firstSkane = skanes[skanes.length - 1]; // Le plus ancien
      const date = new Date(firstSkane.timestamp);
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }
    return 'Jan 2026'; // Fallback par défaut
  }

  try {
    const user = JSON.parse(savedUser);
    if (user.createdAt) {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }
  } catch {
    // Ignore
  }

  return 'Jan 2026';
}
