/**
 * TTFR Tracker - Time To First Reset
 * 
 * Mesure le temps entre l'ouverture de l'app et la première action complétée.
 * C'est LA métrique qui prédit la rétention.
 * 
 * Objectif : TTFR < 45 secondes
 */

import { supabase } from '@/lib/supabase/client';

// ============================================
// CONSTANTS
// ============================================

const TTFR_STORAGE_KEY = 'nokta_ttfr_session_start';
const TTFR_COMPLETED_KEY = 'nokta_ttfr_completed';

// ============================================
// SESSION TRACKING
// ============================================

/**
 * Marque le début d'une session (à appeler au chargement de l'app)
 */
export function startTTFRSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  
  // Ne pas écraser si déjà commencé cette session
  if (sessionStorage.getItem(TTFR_STORAGE_KEY)) return;
  
  sessionStorage.setItem(TTFR_STORAGE_KEY, String(Date.now()));
  sessionStorage.removeItem(TTFR_COMPLETED_KEY);
}

/**
 * Marque la fin du premier reset (à appeler après feedback positif)
 * Retourne le TTFR en secondes
 */
export function completeTTFR(): number | null {
  if (typeof sessionStorage === 'undefined') return null;
  
  // Déjà complété cette session ?
  if (sessionStorage.getItem(TTFR_COMPLETED_KEY)) return null;
  
  const startTime = sessionStorage.getItem(TTFR_STORAGE_KEY);
  if (!startTime) return null;
  
  const ttfrMs = Date.now() - parseInt(startTime, 10);
  const ttfrSeconds = Math.round(ttfrMs / 1000);
  
  sessionStorage.setItem(TTFR_COMPLETED_KEY, String(ttfrSeconds));
  
  return ttfrSeconds;
}

/**
 * Récupère le TTFR de la session courante (si complété)
 */
export function getCurrentTTFR(): number | null {
  if (typeof sessionStorage === 'undefined') return null;
  
  const completed = sessionStorage.getItem(TTFR_COMPLETED_KEY);
  return completed ? parseInt(completed, 10) : null;
}

// ============================================
// ANALYTICS TRACKING
// ============================================

interface TTFREventData {
  user_id?: string | null;
  guest_id?: string | null;
  ttfr_seconds: number;
  session_id?: string;
  is_first_ever: boolean;
  device_type?: string;
  entry_point?: string; // 'direct' | 'share_link' | 'push' | etc.
}

/**
 * Envoie le TTFR à Supabase pour analytics
 */
export async function trackTTFR(data: TTFREventData): Promise<boolean> {
  try {
    // Option 1: Table dédiée ttfr_events
    // Option 2: Ajouter dans skane_sessions (plus simple)
    
    // On utilise l'option simple : mettre à jour la session
    if (data.session_id) {
      const { error } = await supabase
        .from('skane_sessions')
        .update({ 
          ttfr_seconds: data.ttfr_seconds,
          is_first_session: data.is_first_ever,
        })
        .eq('id', data.session_id);
      
      if (error) {
        console.error('Error tracking TTFR:', error);
        return false;
      }
    }

    // Log pour analytics externes (Mixpanel, Amplitude, etc.)
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('TTFR_Completed', {
        ttfr_seconds: data.ttfr_seconds,
        is_first_ever: data.is_first_ever,
        meets_target: data.ttfr_seconds <= 45,
      });
    }

    return true;
  } catch (error) {
    console.error('Error tracking TTFR:', error);
    return false;
  }
}

// ============================================
// FIRST EVER DETECTION
// ============================================

const FIRST_RESET_KEY = 'nokta_first_reset_done';

/**
 * Vérifie si c'est le tout premier reset de l'utilisateur
 */
export function isFirstEverReset(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return !localStorage.getItem(FIRST_RESET_KEY);
}

/**
 * Marque que le premier reset a été fait
 */
export function markFirstResetDone(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(FIRST_RESET_KEY, String(Date.now()));
}

// ============================================
// COMBINED HELPER
// ============================================

interface TTFRResult {
  ttfrSeconds: number;
  isFirstEver: boolean;
  meetsTarget: boolean;
}

/**
 * Complete le TTFR tracking en une seule fonction
 * À appeler après le feedback de la première micro-action
 */
export async function finalizeTTFR(
  userId: string | null,
  guestId: string | null,
  sessionId: string
): Promise<TTFRResult | null> {
  const ttfrSeconds = completeTTFR();
  if (ttfrSeconds === null) return null;
  
  const isFirstEver = isFirstEverReset();
  
  // Track
  await trackTTFR({
    user_id: userId,
    guest_id: guestId,
    ttfr_seconds: ttfrSeconds,
    session_id: sessionId,
    is_first_ever: isFirstEver,
  });
  
  // Marquer premier reset fait
  if (isFirstEver) {
    markFirstResetDone();
  }
  
  return {
    ttfrSeconds,
    isFirstEver,
    meetsTarget: ttfrSeconds <= 45,
  };
}

// ============================================
// METRICS HELPERS
// ============================================

/**
 * Catégorise le TTFR pour analytics
 */
export function categorizeTTFR(seconds: number): string {
  if (seconds <= 30) return 'excellent';    // < 30s = parfait
  if (seconds <= 45) return 'good';         // 30-45s = objectif atteint
  if (seconds <= 60) return 'acceptable';   // 45-60s = OK
  if (seconds <= 120) return 'slow';        // 1-2min = lent
  return 'very_slow';                       // > 2min = problème
}

/**
 * Retourne un message basé sur le TTFR (pour debug/analytics)
 */
export function getTTFRMessage(seconds: number): string {
  const category = categorizeTTFR(seconds);
  
  switch (category) {
    case 'excellent': return `🚀 Excellent! ${seconds}s (target: <45s)`;
    case 'good': return `✅ Good! ${seconds}s (target: <45s)`;
    case 'acceptable': return `⚠️ Acceptable: ${seconds}s (target: <45s)`;
    case 'slow': return `🐌 Slow: ${seconds}s - needs optimization`;
    case 'very_slow': return `❌ Very slow: ${seconds}s - major friction`;
    default: return `${seconds}s`;
  }
}

// ============================================
// EXPORTS
// ============================================

export {
  TTFR_STORAGE_KEY,
  TTFR_COMPLETED_KEY,
};
