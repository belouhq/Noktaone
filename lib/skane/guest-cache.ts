/**
 * Guest Skane History Cache
 * Stores up to 3 recent skanes for guest users
 * Key: "nokta.guestSkaneHistory.v1"
 */

export interface GuestSkaneItem {
  id: string;
  ts: number; // epoch ms
  feedback: 'better' | 'same' | 'worse' | null;
  mode?: 'HIGH_ACTIVATION' | 'LOW_ENERGY' | 'REGULATED'; // internal only, not displayed
}

const GUEST_CACHE_KEY = 'nokta.guestSkaneHistory.v1';
const MAX_CACHE_SIZE = 3;

/**
 * Get guest skane history from localStorage
 */
export function getGuestSkaneHistory(): GuestSkaneItem[] {
  try {
    const data = localStorage.getItem(GUEST_CACHE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    // Validate structure
    if (!Array.isArray(parsed)) return [];
    
    return parsed
      .filter((item: any) => 
        item && 
        typeof item.id === 'string' && 
        typeof item.ts === 'number' &&
        (item.feedback === null || ['better', 'same', 'worse'].includes(item.feedback))
      )
      .slice(0, MAX_CACHE_SIZE);
  } catch {
    return [];
  }
}

/**
 * Add a skane to guest cache
 */
export function addToGuestCache(item: GuestSkaneItem): void {
  try {
    const history = getGuestSkaneHistory();
    
    // Remove duplicate if exists
    const filtered = history.filter(h => h.id !== item.id);
    
    // Add new item at the beginning
    const updated = [item, ...filtered].slice(0, MAX_CACHE_SIZE);
    
    localStorage.setItem(GUEST_CACHE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving to guest cache:', error);
  }
}

/**
 * Clear guest cache (after successful migration to backend)
 */
export function clearGuestCache(): void {
  try {
    localStorage.removeItem(GUEST_CACHE_KEY);
  } catch (error) {
    console.error('Error clearing guest cache:', error);
  }
}

/**
 * Get emoji based on feedback
 */
export function getFeedbackEmoji(feedback: 'better' | 'same' | 'worse' | null): string {
  switch (feedback) {
    case 'better':
      return '🙂';
    case 'same':
      return '😐';
    case 'worse':
      return '😕';
    default:
      return '😐'; // Neutral if no feedback yet
  }
}
