// src/services/health/types.ts
// Types unifiés pour Apple HealthKit et Google Health Connect

/**
 * Données de santé normalisées pour Nokta
 * Compatible iOS (HealthKit) et Android (Health Connect)
 */

export interface NormalizedHealthData {
  // Données cardiaques
  heartRate: HeartRateData | null;
  restingHeartRate: number | null; // bpm
  hrv: HRVData | null;
  
  // Sommeil
  sleep: SleepData | null;
  
  // Activité
  steps: number | null;
  caloriesBurned: number | null; // kcal
  activeMinutes: number | null;
  
  // Physiologique
  oxygenSaturation: number | null; // pourcentage (0-100)
  respiratoryRate: number | null; // respirations/min
  bodyTemperature: number | null; // Celsius
  
  // Métadonnées
  lastSyncDate: Date;
  dataSource: 'healthkit' | 'health_connect' | 'manual';
}

export interface HeartRateData {
  current: number; // bpm
  min: number;
  max: number;
  average: number;
  samples: HeartRateSample[];
}

export interface HeartRateSample {
  value: number; // bpm
  timestamp: Date;
  source?: string; // ex: "Apple Watch", "Oura"
}

export interface HRVData {
  /**
   * SDNN (Standard Deviation of NN intervals)
   * Mesure principale de variabilité cardiaque
   * Unité: millisecondes (ms)
   */
  sdnn: number;
  
  /**
   * RMSSD (Root Mean Square of Successive Differences)
   * Indicateur du tonus parasympathique
   * Unité: millisecondes (ms)
   */
  rmssd: number | null;
  
  /**
   * Dernière mesure
   */
  lastMeasurement: Date;
  
  /**
   * Samples bruts si disponibles
   */
  samples?: HRVSample[];
}

export interface HRVSample {
  value: number; // ms
  timestamp: Date;
  type: 'sdnn' | 'rmssd';
}

export interface SleepData {
  /**
   * Durée totale de sommeil en minutes
   */
  totalDuration: number;
  
  /**
   * Heure de coucher
   */
  startTime: Date;
  
  /**
   * Heure de réveil
   */
  endTime: Date;
  
  /**
   * Phases de sommeil (si disponibles)
   */
  stages?: SleepStage[];
  
  /**
   * Score de qualité (calculé)
   */
  qualityScore?: number; // 0-100
}

export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem' | 'unknown';
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
}

/**
 * Permissions demandées par Nokta
 */
export interface HealthPermissions {
  heartRate: boolean;
  heartRateVariability: boolean;
  restingHeartRate: boolean;
  sleep: boolean;
  steps: boolean;
  activeEnergy: boolean;
  oxygenSaturation: boolean;
  respiratoryRate: boolean;
  bodyTemperature: boolean;
}

/**
 * État des permissions
 */
export type PermissionStatus = 
  | 'not_determined' 
  | 'authorized' 
  | 'denied' 
  | 'unavailable';

export interface HealthPermissionState {
  status: PermissionStatus;
  permissions: Partial<HealthPermissions>;
}

/**
 * Options de requête temporelle
 */
export interface TimeRangeOptions {
  startDate: Date;
  endDate: Date;
}

/**
 * Score du système nerveux calculé par Nokta
 */
export interface NervousSystemScore {
  /**
   * Score global (0-100)
   * 0-30: Sympathique dominant (stress)
   * 30-70: Équilibré
   * 70-100: Parasympathique dominant (relaxé)
   */
  score: number;
  
  /**
   * Interprétation
   */
  state: 'stressed' | 'balanced' | 'relaxed' | 'unknown';
  
  /**
   * Composants du score
   */
  components: {
    hrvScore: number;
    heartRateScore: number;
    sleepScore: number;
  };
  
  /**
   * Recommandation Nokta
   */
  recommendation: MicroActionRecommendation;
  
  /**
   * Confiance du score (basée sur la quantité de données)
   */
  confidence: 'low' | 'medium' | 'high';
  
  /**
   * Timestamp du calcul
   */
  calculatedAt: Date;
}

export interface MicroActionRecommendation {
  type: 'breathing' | 'posture' | 'tea' | 'movement' | 'grounding';
  name: string;
  duration: number; // secondes
  description: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Erreurs possibles
 */
export type HealthError = 
  | { code: 'NOT_AVAILABLE'; message: string }
  | { code: 'PERMISSION_DENIED'; message: string }
  | { code: 'NO_DATA'; message: string }
  | { code: 'UNKNOWN'; message: string };

export type HealthResult<T> = 
  | { success: true; data: T }
  | { success: false; error: HealthError };
