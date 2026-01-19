/**
 * Guards de validation pour les APIs
 * Protège contre les erreurs de validation et les attaques
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valide qu'une image base64 est valide
 */
export function validateBase64Image(image: string | null | undefined): ValidationError | null {
  if (!image) {
    return { field: 'image', message: 'Image is required' };
  }

  // Enlever le préfixe data:image si présent
  const base64Data = image.includes(',') ? image.split(',')[1] : image;

  // Vérifier que c'est du base64 valide
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(base64Data)) {
    return { field: 'image', message: 'Invalid base64 format' };
  }

  // Vérifier la taille (max 10MB en base64 ≈ 7.5MB en binaire)
  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (sizeInBytes > maxSize) {
    return { field: 'image', message: 'Image too large (max 10MB)' };
  }

  return null;
}

/**
 * Valide qu'un userId est valide (UUID ou string non vide)
 */
export function validateUserId(userId: string | null | undefined): ValidationError | null {
  if (!userId) {
    return { field: 'userId', message: 'UserId is required' };
  }

  if (typeof userId !== 'string') {
    return { field: 'userId', message: 'UserId must be a string' };
  }

  if (userId.length < 1 || userId.length > 255) {
    return { field: 'userId', message: 'UserId length invalid' };
  }

  return null;
}

/**
 * Valide qu'un feedback est valide
 */
export function validateFeedback(feedback: string | null | undefined): ValidationError | null {
  const validFeedbacks = ['worse', 'same', 'better', 'still_high', 'reduced', 'clear'];
  
  if (!feedback) {
    return { field: 'feedback', message: 'Feedback is required' };
  }

  if (!validFeedbacks.includes(feedback.toLowerCase())) {
    return { field: 'feedback', message: `Feedback must be one of: ${validFeedbacks.join(', ')}` };
  }

  return null;
}

/**
 * Valide qu'un sessionPayload est valide
 */
export function validateSessionPayload(payload: any): ValidationError | null {
  if (!payload) {
    return { field: 'sessionPayload', message: 'SessionPayload is required' };
  }

  if (typeof payload !== 'object') {
    return { field: 'sessionPayload', message: 'SessionPayload must be an object' };
  }

  const requiredFields = ['userId', 'signalBefore', 'internalScoreBefore', 'microAction', 'deviceInfo'];
  for (const field of requiredFields) {
    if (!(field in payload)) {
      return { field: 'sessionPayload', message: `SessionPayload missing required field: ${field}` };
    }
  }

  return null;
}

/**
 * Retourne une réponse d'erreur de validation
 */
export function validationErrorResponse(
  errors: ValidationError[],
  requestId?: string
): NextResponse {
  logger.warn('Validation error', { requestId, errors });
  
  return NextResponse.json(
    {
      error: 'Validation failed',
      errors,
      requestId,
    },
    { status: 400 }
  );
}

/**
 * Retourne une réponse d'erreur serveur
 */
export function serverErrorResponse(
  message: string,
  error?: Error | unknown,
  requestId?: string
): NextResponse {
  logger.error(message, error, { requestId });
  
  return NextResponse.json(
    {
      error: message,
      requestId,
    },
    { status: 500 }
  );
}

/**
 * Rate limiting simple (à améliorer avec Redis en production)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requêtes par minute

export function checkRateLimit(identifier: string): { allowed: boolean; resetAt?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    // Nouvelle fenêtre
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true };
}
