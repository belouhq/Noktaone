/**
 * SYSTÈME DE CONSENTEMENT - NOKTA ONE
 * 
 * Gère le consentement explicite de l'utilisateur pour l'analyse faciale
 * Conformité avec les policies OpenAI
 */

/** Aligné avec le dictionnaire NOKTA : régulation corporelle, patterns faciaux, micro-actions, bien-être uniquement. */
export const CONSENT_TEXT = {
  en: `By using NOKTA 3-second facial scan: you consent to facial pattern analysis for body regulation. Your images are NOT stored. No identity recognition. Data is used only to recommend micro-actions for body regulation. For personal wellness only.`,
  fr: `En utilisant le scan facial NOKTA de 3 secondes : vous consentez à l'analyse des patterns du visage pour la régulation corporelle. Vos images ne sont PAS stockées. Aucune reconnaissance d'identité. Les données servent uniquement à recommander des micro-actions pour la régulation corporelle. Pour le bien-être personnel uniquement.`,
};

/** Vocabulaire NOKTA : bien-être uniquement, pas de diagnostic. */
export const MEDICAL_DISCLAIMER = {
  en: `NOKTA is for wellness only. Seek professional advice if needed.`,
  fr: `NOKTA est uniquement pour le bien-être. Demandez un avis professionnel si nécessaire.`,
};

export interface ConsentStatus {
  hasConsented: boolean;
  consentedAt?: Date;
  version: string;
}

const CONSENT_VERSION = '1.0';
const CONSENT_STORAGE_KEY = 'nokta_consent';

/**
 * Vérifie si l'utilisateur a donné son consentement
 */
export function hasUserConsented(): boolean {
  if (typeof window === 'undefined') return false;
  
  const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!consent) return false;
  
  try {
    const parsed: ConsentStatus = JSON.parse(consent);
    return parsed.hasConsented && parsed.version === CONSENT_VERSION;
  } catch {
    return false;
  }
}

/**
 * Enregistre le consentement de l'utilisateur
 */
export function recordUserConsent(): void {
  if (typeof window === 'undefined') return;
  
  const consent: ConsentStatus = {
    hasConsented: true,
    consentedAt: new Date(),
    version: CONSENT_VERSION,
  };
  
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
}

/**
 * Révoque le consentement
 */
export function revokeUserConsent(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(CONSENT_STORAGE_KEY);
}

/**
 * Récupère le statut de consentement
 */
export function getConsentStatus(): ConsentStatus | null {
  if (typeof window === 'undefined') return null;
  
  const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!consent) return null;
  
  try {
    return JSON.parse(consent);
  } catch {
    return null;
  }
}
