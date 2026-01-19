// src/hooks/useHealthData.ts
// Hook React pour accéder aux données de santé dans Nokta

import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { 
  noktaHealth, 
  NormalizedHealthData, 
  HealthPermissionState,
  HRVData,
  SleepData,
} from '../services/health';
import { 
  calculateNervousSystemScore, 
  NervousSystemScore 
} from '../utils/nervousSystemScore';

interface UseHealthDataState {
  // État
  isAvailable: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Permissions
  permissionState: HealthPermissionState | null;
  
  // Données
  healthData: NormalizedHealthData | null;
  nervousSystemScore: NervousSystemScore | null;
  
  // Dernière mise à jour
  lastUpdated: Date | null;
}

interface UseHealthDataActions {
  // Actions
  initialize: () => Promise<boolean>;
  refresh: () => Promise<void>;
  
  // Getters spécifiques
  getHRV: () => Promise<HRVData | null>;
  getSleep: () => Promise<SleepData | null>;
  getTodaySteps: () => Promise<number | null>;
}

export type UseHealthDataReturn = UseHealthDataState & UseHealthDataActions;

/**
 * Hook principal pour accéder aux données de santé dans Nokta
 * 
 * @example
 * ```tsx
 * const { 
 *   healthData, 
 *   nervousSystemScore, 
 *   isLoading, 
 *   initialize 
 * } = useHealthData();
 * 
 * useEffect(() => {
 *   initialize();
 * }, []);
 * ```
 */
export function useHealthData(options?: {
  autoRefreshInterval?: number; // en millisecondes
  refreshOnForeground?: boolean;
}): UseHealthDataReturn {
  const { 
    autoRefreshInterval = 0, // Désactivé par défaut
    refreshOnForeground = true,
  } = options || {};

  // State
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<HealthPermissionState | null>(null);
  const [healthData, setHealthData] = useState<NormalizedHealthData | null>(null);
  const [nervousSystemScore, setNervousSystemScore] = useState<NervousSystemScore | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Vérifie la disponibilité au montage
   */
  useEffect(() => {
    checkAvailability();
  }, []);

  /**
   * Auto-refresh si configuré
   */
  useEffect(() => {
    if (!isInitialized || autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      refresh();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [isInitialized, autoRefreshInterval]);

  /**
   * Refresh quand l'app revient au premier plan
   */
  useEffect(() => {
    if (!refreshOnForeground || !isInitialized) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription.remove();
  }, [isInitialized, refreshOnForeground, refresh]);

  /**
   * Vérifie si le service de santé est disponible
   */
  const checkAvailability = useCallback(async () => {
    const available = await noktaHealth.isAvailable();
    setIsAvailable(available);
    
    if (!available) {
      const platformName = Platform.OS === 'ios' ? 'HealthKit' : 'Health Connect';
      setError(`${platformName} n'est pas disponible sur cet appareil`);
    }
  }, []);

  /**
   * Initialise le service et demande les permissions
   */
  const initialize = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      setError('Service de santé non disponible');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await noktaHealth.initialize();

      if (result.success) {
        setIsInitialized(true);
        setPermissionState(result.data);
        
        // Charger les données initiales
        await refresh();
        
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'initialisation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable]);

  /**
   * Rafraîchit les données de santé
   */
  const refresh = useCallback(async () => {
    if (!isInitialized) {
      console.warn('useHealthData: Service not initialized');
      return;
    }

    setIsLoading(true);

    try {
      const data = await noktaHealth.getTodayData();
      
      if (data) {
        setHealthData(data);
        setLastUpdated(new Date());
        
        // Calculer le score du système nerveux
        const score = calculateNervousSystemScore(data);
        setNervousSystemScore(score);
        
        setError(null);
      } else {
        setError('Impossible de récupérer les données de santé');
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors du rafraîchissement');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  /**
   * Récupère les données HRV
   */
  const getHRV = useCallback(async (): Promise<HRVData | null> => {
    if (!isInitialized) return null;
    return noktaHealth.getHRV();
  }, [isInitialized]);

  /**
   * Récupère les données de sommeil de la dernière nuit
   */
  const getSleep = useCallback(async (): Promise<SleepData | null> => {
    if (!isInitialized) return null;
    return noktaHealth.getLastNightSleep();
  }, [isInitialized]);

  /**
   * Récupère les pas du jour
   */
  const getTodaySteps = useCallback(async (): Promise<number | null> => {
    if (!isInitialized) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return noktaHealth.getSteps({
      startDate: today,
      endDate: new Date(),
    });
  }, [isInitialized]);

  return {
    // État
    isAvailable,
    isLoading,
    isInitialized,
    error,
    permissionState,
    healthData,
    nervousSystemScore,
    lastUpdated,
    
    // Actions
    initialize,
    refresh,
    getHRV,
    getSleep,
    getTodaySteps,
  };
}

/**
 * Hook simplifié pour récupérer uniquement le score du système nerveux
 */
export function useNervousSystemScore() {
  const { 
    nervousSystemScore, 
    isLoading, 
    error,
    isInitialized,
    initialize,
    refresh,
  } = useHealthData({ refreshOnForeground: true });

  return {
    score: nervousSystemScore,
    isLoading,
    error,
    isInitialized,
    initialize,
    refresh,
  };
}

/**
 * Hook pour le score HRV uniquement
 */
export function useHRV() {
  const [hrv, setHrv] = useState<HRVData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isInitialized, initialize, getHRV } = useHealthData();

  const fetchHRV = useCallback(async () => {
    if (!isInitialized) {
      const success = await initialize();
      if (!success) return;
    }
    
    setIsLoading(true);
    try {
      const data = await getHRV();
      setHrv(data);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize, getHRV]);

  useEffect(() => {
    if (isInitialized) {
      fetchHRV();
    }
  }, [isInitialized]);

  return { hrv, isLoading, refresh: fetchHRV };
}

export default useHealthData;
