/**
 * OpenAI Client - Configuration Complète
 * 
 * Client OpenAI avec support pour :
 * - Headers d'organisation et projet
 * - Request ID logging
 * - Rate limit handling
 * - Error handling amélioré
 */

import OpenAI from 'openai';

// Configuration depuis les variables d'environnement
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ORGANIZATION_ID = process.env.OPENAI_ORGANIZATION_ID;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID;

if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY is not set');
}

/**
 * Créer un client OpenAI configuré
 */
export function createOpenAIClient(): OpenAI {
  const config: { apiKey?: string; defaultHeaders?: Record<string, string> } = {
    apiKey: OPENAI_API_KEY,
  };

  // Ajouter organization ID si fourni
  if (OPENAI_ORGANIZATION_ID) {
    config.defaultHeaders = {
      ...config.defaultHeaders,
      'OpenAI-Organization': OPENAI_ORGANIZATION_ID,
    };
  }

  // Ajouter project ID si fourni
  if (OPENAI_PROJECT_ID) {
    config.defaultHeaders = {
      ...config.defaultHeaders,
      'OpenAI-Project': OPENAI_PROJECT_ID,
    };
  }

  return new OpenAI(config as ConstructorParameters<typeof OpenAI>[0]);
}

/**
 * Générer un Request ID unique pour le debugging
 */
export function generateRequestId(): string {
  return `nokta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Logger les headers de réponse OpenAI pour debugging
 */
export function logOpenAIHeaders(response: Response): void {
  const headers: Record<string, string> = {};
  
  // Headers OpenAI importants
  const importantHeaders = [
    'openai-organization',
    'openai-processing-ms',
    'openai-version',
    'x-request-id',
    'x-ratelimit-limit-requests',
    'x-ratelimit-limit-tokens',
    'x-ratelimit-remaining-requests',
    'x-ratelimit-remaining-tokens',
    'x-ratelimit-reset-requests',
    'x-ratelimit-reset-tokens',
  ];

  importantHeaders.forEach(header => {
    const value = response.headers.get(header);
    if (value) {
      headers[header] = value;
    }
  });

  if (Object.keys(headers).length > 0) {
    console.log('[OpenAI Headers]', headers);
  }
}

/**
 * Client OpenAI singleton
 */
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = createOpenAIClient();
  }
  return openaiClient;
}
