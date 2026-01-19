// src/services/health/index.ts
// Service de santé unifié pour iOS et Android

import { Platform } from 'react-native';
import {
  NormalizedHealthData,
  HeartRateData,
  HRVData,
  SleepData,
  HealthPermissionState,
  HealthResult,
  TimeRangeOptions,
} from './types';

// Import conditionnel basé sur la plateforme
let healthService: typeof import('./healthKit.ios').default | typeof import('./healthConnect.android').default;

if (Platform.OS === 'ios') {
  healthService = require('./healthKit.ios').default;
} else if (Platform.OS === 'android') {
  healthService = require('./healthConnect.android').default;
}

/**
 * Service de santé unifié Nokta
 * Abstraction cross-platform pour HealthKit (iOS) et Health Connect (Android)
 */
export class NoktaHealthService {
  private initialized: boolean = false;
  private permissionState: HealthPermissionState | null = null;

  /**
   * Vérifie si le service de santé est disponible sur cet appareil
   */
  async isAvailable(): Promise<boolean> {
    if (!healthService) {
      return false;
    }
    return healthService.isAvailable();
  }

  /**
   * Initialise le service et demande les permissions
   * À appeler au démarrage de l'app ou lors de l'onboarding
   */
  async initialize(): Promise<HealthResult<HealthPermissionState>> {
    if (!healthService) {
      return {
        success: false,
        error: {
          code: 'NOT_AVAILABLE',
          message: 'Health service not available on this platform',
        },
      };
    }

    const result = await healthService.initialize();
    
    if (result.success) {
      this.initialized = true;
      this.permissionState = result.data;
    }

    return result;
  }

  /**
   * Vérifie si le service est initialisé
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Retourne l'état actuel des permissions
   */
  getPermissionState(): HealthPermissionState | null {
    return this.permissionState;
  }

  /**
   * Récupère toutes les données de santé pour une période
   */
  async getAllHealthData(options?: Partial<TimeRangeOptions>): Promise<NormalizedHealthData | null> {
    if (!this.initialized || !healthService) {
      console.warn('NoktaHealthService: Service not initialized');
      return null;
    }

    const timeRange = this.getDefaultTimeRange(options);
    
    try {
      return await healthService.getAllHealthData(timeRange);
    } catch (error) {
      console.error('NoktaHealthService: Error fetching health data', error);
      return null;
    }
  }

  /**
   * Récupère la fréquence cardiaque
   */
  async getHeartRate(options?: Partial<TimeRangeOptions>): Promise<HeartRateData | null> {
    if (!this.initialized || !healthService) return null;

    const timeRange = this.getDefaultTimeRange(options);
    const result = await healthService.getHeartRate(timeRange);
    
    return result.success ? result.data : null;
  }

  /**
   * Récupère la fréquence cardiaque au repos
   */
  async getRestingHeartRate(options?: Partial<TimeRangeOptions>): Promise<number | null> {
    if (!this.initialized || !healthService) return null;

    const timeRange = this.getDefaultTimeRange(options);
    const result = await healthService.getRestingHeartRate(timeRange);
    
    return result.success ? result.data : null;
  }

  /**
   * Récupère les données HRV - Donnée clé pour Nokta
   */
  async getHRV(options?: Partial<TimeRangeOptions>): Promise<HRVData | null> {
    if (!this.initialized || !healthService) return null;

    const timeRange = this.getDefaultTimeRange(options);
    const result = await healthService.getHRV(timeRange);
    
    return result.success ? result.data : null;
  }

  /**
   * Récupère les données de sommeil
   */
  async getSleep(options?: Partial<TimeRangeOptions>): Promise<SleepData | null> {
    if (!this.initialized || !healthService) return null;

    const timeRange = this.getDefaultTimeRange(options);
    const result = await healthService.getSleep(timeRange);
    
    return result.success ? result.data : null;
  }

  /**
   * Récupère le nombre de pas
   */
  async getSteps(options?: Partial<TimeRangeOptions>): Promise<number | null> {
    if (!this.initialized || !healthService) return null;

    const timeRange = this.getDefaultTimeRange(options);
    const result = await healthService.getSteps(timeRange);
    
    return result.success ? result.data : null;
  }

  /**
   * Récupère les calories brûlées
   */
  async getActiveCalories(options?: Partial<TimeRangeOptions>): Promise<number | null> {
    if (!this.initialized || !healthService) return null;

    const timeRange = this.getDefaultTimeRange(options);
    const result = await healthService.getActiveCalories(timeRange);
    
    return result.success ? result.data : null;
  }

  /**
   * Récupère les données du jour (helper)
   */
  async getTodayData(): Promise<NormalizedHealthData | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.getAllHealthData({
      startDate: today,
      endDate: new Date(),
    });
  }

  /**
   * Récupère les données de la dernière nuit (pour le sommeil)
   */
  async getLastNightSleep(): Promise<SleepData | null> {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(18, 0, 0, 0); // 18h la veille
    
    return this.getSleep({
      startDate: yesterday,
      endDate: now,
    });
  }

  /**
   * Calcule la plage temporelle par défaut (dernières 24h)
   */
  private getDefaultTimeRange(options?: Partial<TimeRangeOptions>): TimeRangeOptions {
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return {
      startDate: options?.startDate || oneDayAgo,
      endDate: options?.endDate || now,
    };
  }

  /**
   * Retourne le nom de la plateforme
   */
  getPlatformName(): string {
    if (Platform.OS === 'ios') return 'Apple HealthKit';
    if (Platform.OS === 'android') return 'Google Health Connect';
    return 'Unknown';
  }
}

// Singleton
export const noktaHealth = new NoktaHealthService();

// Export des types
export * from './types';

// Export par défaut
export default noktaHealth;
