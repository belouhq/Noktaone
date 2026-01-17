/**
 * Error Handler for SKANE
 * 
 * Track les erreurs dans Supabase pour qualité produit
 */

import { logError } from './supabase-tracker';
import { getOrCreateGuestId, getUserId } from './supabase-tracker';

/**
 * Logger une erreur avec contexte
 */
export async function trackError(
  error: Error | unknown,
  screen: string,
  context?: Record<string, any>
) {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error instanceof Error ? error.name : 'UnknownError';
    const stackTrace = error instanceof Error ? error.stack : undefined;

    // Récupérer les IDs
    const userId = getUserId();
    const guestId = getOrCreateGuestId();

    // Device info
    const deviceInfo = {
      os: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
      ...context,
    };

    // Logger dans Supabase
    await logError(
      errorCode,
      errorMessage,
      screen,
      userId,
      guestId,
      deviceInfo,
      stackTrace
    );

    // Logger aussi dans la console pour debug
    console.error(`[SKANE Error] ${screen}:`, error);
  } catch (logError) {
    // Si le logging échoue, on log quand même dans la console
    console.error('Failed to log error to Supabase:', logError);
    console.error('Original error:', error);
  }
}

/**
 * Wrapper pour catch les erreurs dans les fonctions async
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  screen: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      await trackError(error, screen);
      throw error;
    }
  }) as T;
}
