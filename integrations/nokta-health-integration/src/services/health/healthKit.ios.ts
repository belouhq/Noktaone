// src/services/health/healthKit.ios.ts
// Implémentation Apple HealthKit pour iOS

import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
  HealthInputOptions,
  HealthUnit,
} from 'react-native-health';

import {
  NormalizedHealthData,
  HeartRateData,
  HRVData,
  SleepData,
  SleepStage,
  HealthPermissionState,
  HealthResult,
  TimeRangeOptions,
} from './types';

/**
 * Permissions requises par Nokta
 */
const NOKTA_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.OxygenSaturation,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      AppleHealthKit.Constants.Permissions.BodyTemperature,
    ],
    write: [],
  },
};

/**
 * Vérifie si HealthKit est disponible
 */
export async function isHealthKitAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    AppleHealthKit.isAvailable((error, available) => {
      resolve(available && !error);
    });
  });
}

/**
 * Initialise HealthKit et demande les permissions
 */
export async function initializeHealthKit(): Promise<HealthResult<HealthPermissionState>> {
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(NOKTA_PERMISSIONS, (error) => {
      if (error) {
        resolve({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: error.message || 'HealthKit permission denied',
          },
        });
        return;
      }

      resolve({
        success: true,
        data: {
          status: 'authorized',
          permissions: {
            heartRate: true,
            heartRateVariability: true,
            restingHeartRate: true,
            sleep: true,
            steps: true,
            activeEnergy: true,
            oxygenSaturation: true,
            respiratoryRate: true,
            bodyTemperature: true,
          },
        },
      });
    });
  });
}

/**
 * Récupère la fréquence cardiaque
 */
export async function getHeartRate(
  options: TimeRangeOptions
): Promise<HealthResult<HeartRateData>> {
  return new Promise((resolve) => {
    const inputOptions: HealthInputOptions = {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
      ascending: false,
      limit: 100,
    };

    AppleHealthKit.getHeartRateSamples(inputOptions, (error, results) => {
      if (error) {
        resolve({
          success: false,
          error: { code: 'UNKNOWN', message: error.message },
        });
        return;
      }

      if (!results || results.length === 0) {
        resolve({
          success: false,
          error: { code: 'NO_DATA', message: 'No heart rate data found' },
        });
        return;
      }

      const samples = results.map((sample: HealthValue) => ({
        value: sample.value,
        timestamp: new Date(sample.startDate),
        source: sample.sourceName,
      }));

      const values = samples.map((s) => s.value);
      
      resolve({
        success: true,
        data: {
          current: samples[0].value,
          min: Math.min(...values),
          max: Math.max(...values),
          average: values.reduce((a, b) => a + b, 0) / values.length,
          samples,
        },
      });
    });
  });
}

/**
 * Récupère la fréquence cardiaque au repos
 */
export async function getRestingHeartRate(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  return new Promise((resolve) => {
    const inputOptions: HealthInputOptions = {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
      ascending: false,
      limit: 1,
    };

    AppleHealthKit.getRestingHeartRate(inputOptions, (error, results) => {
      if (error || !results || results.length === 0) {
        resolve({
          success: false,
          error: { code: 'NO_DATA', message: 'No resting heart rate data' },
        });
        return;
      }

      resolve({
        success: true,
        data: results[0].value,
      });
    });
  });
}

/**
 * Récupère les données HRV (Heart Rate Variability)
 * C'est la donnée clé pour l'algorithme Nokta
 */
export async function getHRV(
  options: TimeRangeOptions
): Promise<HealthResult<HRVData>> {
  return new Promise((resolve) => {
    const inputOptions: HealthInputOptions = {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
      ascending: false,
      limit: 10,
    };

    AppleHealthKit.getHeartRateVariabilitySamples(inputOptions, (error, results) => {
      if (error) {
        resolve({
          success: false,
          error: { code: 'UNKNOWN', message: error.message },
        });
        return;
      }

      if (!results || results.length === 0) {
        resolve({
          success: false,
          error: { code: 'NO_DATA', message: 'No HRV data found' },
        });
        return;
      }

      // Apple HealthKit retourne SDNN en secondes, on convertit en ms
      const latestSample = results[0];
      const sdnnMs = latestSample.value * 1000; // Conversion s -> ms

      const samples = results.map((sample: HealthValue) => ({
        value: sample.value * 1000,
        timestamp: new Date(sample.startDate),
        type: 'sdnn' as const,
      }));

      resolve({
        success: true,
        data: {
          sdnn: sdnnMs,
          rmssd: null, // RMSSD pas directement disponible via cette API
          lastMeasurement: new Date(latestSample.startDate),
          samples,
        },
      });
    });
  });
}

/**
 * Récupère les données de sommeil
 */
export async function getSleep(
  options: TimeRangeOptions
): Promise<HealthResult<SleepData>> {
  return new Promise((resolve) => {
    const inputOptions: HealthInputOptions = {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
    };

    AppleHealthKit.getSleepSamples(inputOptions, (error, results) => {
      if (error) {
        resolve({
          success: false,
          error: { code: 'UNKNOWN', message: error.message },
        });
        return;
      }

      if (!results || results.length === 0) {
        resolve({
          success: false,
          error: { code: 'NO_DATA', message: 'No sleep data found' },
        });
        return;
      }

      // Mapper les types de sommeil Apple vers nos types
      const mapSleepType = (value: string): SleepStage['stage'] => {
        switch (value) {
          case 'INBED':
          case 'AWAKE':
            return 'awake';
          case 'ASLEEP':
          case 'ASLEEPUNSPECIFIED':
            return 'light';
          case 'ASLEEPCORE':
            return 'light';
          case 'ASLEEPDEEP':
            return 'deep';
          case 'ASLEEPREM':
            return 'rem';
          default:
            return 'unknown';
        }
      };

      const stages: SleepStage[] = results.map((sample: any) => {
        const startTime = new Date(sample.startDate);
        const endTime = new Date(sample.endDate);
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

        return {
          stage: mapSleepType(sample.value),
          startTime,
          endTime,
          duration,
        };
      });

      // Filtrer les phases de sommeil réel (pas "awake" ou "unknown")
      const sleepStages = stages.filter(
        (s) => s.stage !== 'awake' && s.stage !== 'unknown'
      );

      if (sleepStages.length === 0) {
        resolve({
          success: false,
          error: { code: 'NO_DATA', message: 'No valid sleep stages' },
        });
        return;
      }

      const totalDuration = sleepStages.reduce((sum, s) => sum + s.duration, 0);
      const startTime = sleepStages[sleepStages.length - 1].startTime;
      const endTime = sleepStages[0].endTime;

      // Calculer le score de qualité
      const deepSleep = stages
        .filter((s) => s.stage === 'deep')
        .reduce((sum, s) => sum + s.duration, 0);
      const remSleep = stages
        .filter((s) => s.stage === 'rem')
        .reduce((sum, s) => sum + s.duration, 0);
      
      // Score basé sur % de deep + REM (idéal ~40% du total)
      const deepRemPercent = ((deepSleep + remSleep) / totalDuration) * 100;
      const qualityScore = Math.min(100, Math.round(deepRemPercent * 2.5));

      resolve({
        success: true,
        data: {
          totalDuration,
          startTime,
          endTime,
          stages,
          qualityScore,
        },
      });
    });
  });
}

/**
 * Récupère le nombre de pas
 */
export async function getSteps(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  return new Promise((resolve) => {
    const inputOptions: HealthInputOptions = {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
    };

    AppleHealthKit.getStepCount(inputOptions, (error, results) => {
      if (error || !results) {
        resolve({
          success: false,
          error: { code: 'NO_DATA', message: 'No step data' },
        });
        return;
      }

      resolve({
        success: true,
        data: results.value,
      });
    });
  });
}

/**
 * Récupère les calories brûlées (énergie active)
 */
export async function getActiveCalories(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  return new Promise((resolve) => {
    const inputOptions: HealthInputOptions = {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
    };

    AppleHealthKit.getActiveEnergyBurned(inputOptions, (error, results) => {
      if (error || !results || results.length === 0) {
        resolve({
          success: false,
          error: { code: 'NO_DATA', message: 'No calorie data' },
        });
        return;
      }

      const total = results.reduce(
        (sum: number, sample: HealthValue) => sum + sample.value,
        0
      );

      resolve({
        success: true,
        data: Math.round(total),
      });
    });
  });
}

/**
 * Récupère la saturation en oxygène (SpO2)
 */
export async function getOxygenSaturation(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  return new Promise((resolve) => {
    const inputOptions: HealthInputOptions = {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
      ascending: false,
      limit: 1,
    };

    AppleHealthKit.getOxygenSaturationSamples(inputOptions, (error, results) => {
      if (error || !results || results.length === 0) {
        resolve({
          success: false,
          error: { code: 'NO_DATA', message: 'No SpO2 data' },
        });
        return;
      }

      // Apple retourne un pourcentage (0-1), on convertit en 0-100
      resolve({
        success: true,
        data: Math.round(results[0].value * 100),
      });
    });
  });
}

/**
 * Récupère toutes les données de santé pour Nokta
 */
export async function getAllHealthData(
  options: TimeRangeOptions
): Promise<NormalizedHealthData> {
  const [
    heartRateResult,
    restingHRResult,
    hrvResult,
    sleepResult,
    stepsResult,
    caloriesResult,
    spo2Result,
  ] = await Promise.all([
    getHeartRate(options),
    getRestingHeartRate(options),
    getHRV(options),
    getSleep(options),
    getSteps(options),
    getActiveCalories(options),
    getOxygenSaturation(options),
  ]);

  return {
    heartRate: heartRateResult.success ? heartRateResult.data : null,
    restingHeartRate: restingHRResult.success ? restingHRResult.data : null,
    hrv: hrvResult.success ? hrvResult.data : null,
    sleep: sleepResult.success ? sleepResult.data : null,
    steps: stepsResult.success ? stepsResult.data : null,
    caloriesBurned: caloriesResult.success ? caloriesResult.data : null,
    activeMinutes: null, // Calculer à partir des pas si nécessaire
    oxygenSaturation: spo2Result.success ? spo2Result.data : null,
    respiratoryRate: null, // Ajouter si disponible
    bodyTemperature: null, // Ajouter si disponible
    lastSyncDate: new Date(),
    dataSource: 'healthkit',
  };
}

export default {
  isAvailable: isHealthKitAvailable,
  initialize: initializeHealthKit,
  getHeartRate,
  getRestingHeartRate,
  getHRV,
  getSleep,
  getSteps,
  getActiveCalories,
  getOxygenSaturation,
  getAllHealthData,
};
