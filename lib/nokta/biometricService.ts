/**
 * Service biométrique Nokta - STUB pour PWA / Next.js
 *
 * HealthKit et Health Connect sont des APIs natives (iOS/Android).
 * En PWA sur Vercel, elles ne sont pas disponibles.
 *
 * Ce stub retourne toujours des données vides. Le scoring interne
 * fonctionne avec le facial uniquement.
 *
 * Pour l'app React Native : remplacer par une implémentation qui
 * utilise integrations/nokta-health-integration et mappe
 * NormalizedHealthData -> BiometricData.
 */

import type { BiometricData } from "./types";

function getEmpty(): BiometricData {
  return {
    hrvSdnn: null,
    hrvRmssd: null,
    restingHeartRate: null,
    currentHeartRate: null,
    sleepQuality: null,
    sleepDuration: null,
    source: "none",
    lastSync: null,
  };
}

export const biometricService = {
  async initialize(): Promise<boolean> {
    return false;
  },
  async getCurrentData(): Promise<BiometricData | null> {
    return getEmpty();
  },
  async hasWearableConnected(): Promise<boolean> {
    return false;
  },
};
