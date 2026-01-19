// src/services/health/healthConnect.android.ts
// Implémentation Google Health Connect pour Android

import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

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
 * Permissions Health Connect requises par Nokta
 */
const NOKTA_PERMISSIONS = [
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
  { accessType: 'read', recordType: 'RestingHeartRate' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'TotalCaloriesBurned' },
  { accessType: 'read', recordType: 'OxygenSaturation' },
  { accessType: 'read', recordType: 'RespiratoryRate' },
  { accessType: 'read', recordType: 'BodyTemperature' },
] as const;

/**
 * Vérifie si Health Connect est disponible
 */
export async function isHealthConnectAvailable(): Promise<boolean> {
  try {
    const status = await getSdkStatus();
    return status === SdkAvailabilityStatus.SDK_AVAILABLE;
  } catch {
    return false;
  }
}

/**
 * Initialise Health Connect et demande les permissions
 */
export async function initializeHealthConnect(): Promise<HealthResult<HealthPermissionState>> {
  try {
    // Vérifier la disponibilité
    const status = await getSdkStatus();
    
    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
      return {
        success: false,
        error: {
          code: 'NOT_AVAILABLE',
          message: 'Health Connect is not available on this device',
        },
      };
    }

    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      return {
        success: false,
        error: {
          code: 'NOT_AVAILABLE',
          message: 'Health Connect needs to be updated',
        },
      };
    }

    // Initialiser
    const initialized = await initialize();
    if (!initialized) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'Failed to initialize Health Connect',
        },
      };
    }

    // Demander les permissions
    const grantedPermissions = await requestPermission(NOKTA_PERMISSIONS);

    return {
      success: true,
      data: {
        status: 'authorized',
        permissions: {
          heartRate: grantedPermissions.some((p) => p.recordType === 'HeartRate'),
          heartRateVariability: grantedPermissions.some(
            (p) => p.recordType === 'HeartRateVariabilityRmssd'
          ),
          restingHeartRate: grantedPermissions.some(
            (p) => p.recordType === 'RestingHeartRate'
          ),
          sleep: grantedPermissions.some((p) => p.recordType === 'SleepSession'),
          steps: grantedPermissions.some((p) => p.recordType === 'Steps'),
          activeEnergy: grantedPermissions.some(
            (p) => p.recordType === 'TotalCaloriesBurned'
          ),
          oxygenSaturation: grantedPermissions.some(
            (p) => p.recordType === 'OxygenSaturation'
          ),
          respiratoryRate: grantedPermissions.some(
            (p) => p.recordType === 'RespiratoryRate'
          ),
          bodyTemperature: grantedPermissions.some(
            (p) => p.recordType === 'BodyTemperature'
          ),
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: error.message || 'Permission denied',
      },
    };
  }
}

/**
 * Récupère la fréquence cardiaque
 */
export async function getHeartRate(
  options: TimeRangeOptions
): Promise<HealthResult<HeartRateData>> {
  try {
    const result = await readRecords('HeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime: options.startDate.toISOString(),
        endTime: options.endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return {
        success: false,
        error: { code: 'NO_DATA', message: 'No heart rate data found' },
      };
    }

    const samples = result.records.flatMap((record: any) =>
      record.samples.map((sample: any) => ({
        value: sample.beatsPerMinute,
        timestamp: new Date(sample.time),
        source: record.metadata?.dataOrigin?.packageName,
      }))
    );

    const values = samples.map((s) => s.value);

    return {
      success: true,
      data: {
        current: samples[samples.length - 1].value,
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        samples,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'UNKNOWN', message: error.message },
    };
  }
}

/**
 * Récupère la fréquence cardiaque au repos
 */
export async function getRestingHeartRate(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  try {
    const result = await readRecords('RestingHeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime: options.startDate.toISOString(),
        endTime: options.endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return {
        success: false,
        error: { code: 'NO_DATA', message: 'No resting heart rate data' },
      };
    }

    // Prendre la dernière valeur
    const latestRecord = result.records[result.records.length - 1];
    
    return {
      success: true,
      data: latestRecord.beatsPerMinute,
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'UNKNOWN', message: error.message },
    };
  }
}

/**
 * Récupère les données HRV (RMSSD sur Health Connect)
 */
export async function getHRV(
  options: TimeRangeOptions
): Promise<HealthResult<HRVData>> {
  try {
    const result = await readRecords('HeartRateVariabilityRmssd', {
      timeRangeFilter: {
        operator: 'between',
        startTime: options.startDate.toISOString(),
        endTime: options.endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return {
        success: false,
        error: { code: 'NO_DATA', message: 'No HRV data found' },
      };
    }

    const latestRecord = result.records[result.records.length - 1];
    
    // Health Connect stocke RMSSD en millisecondes
    const rmssdMs = latestRecord.heartRateVariabilityMillis;

    const samples = result.records.map((record: any) => ({
      value: record.heartRateVariabilityMillis,
      timestamp: new Date(record.time),
      type: 'rmssd' as const,
    }));

    // Estimer SDNN à partir de RMSSD (approximation)
    // SDNN est généralement 1.2-1.5x RMSSD
    const estimatedSdnn = rmssdMs * 1.3;

    return {
      success: true,
      data: {
        sdnn: estimatedSdnn,
        rmssd: rmssdMs,
        lastMeasurement: new Date(latestRecord.time),
        samples,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'UNKNOWN', message: error.message },
    };
  }
}

/**
 * Récupère les données de sommeil
 */
export async function getSleep(
  options: TimeRangeOptions
): Promise<HealthResult<SleepData>> {
  try {
    const result = await readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: options.startDate.toISOString(),
        endTime: options.endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return {
        success: false,
        error: { code: 'NO_DATA', message: 'No sleep data found' },
      };
    }

    // Prendre la session de sommeil la plus récente
    const latestSession = result.records[result.records.length - 1];

    // Mapper les stages Health Connect vers nos types
    const mapStageType = (stage: number): SleepStage['stage'] => {
      // Health Connect stage types
      switch (stage) {
        case 0: return 'unknown';
        case 1: return 'awake';
        case 2: return 'light'; // Sleeping
        case 3: return 'light'; // Out of bed
        case 4: return 'light'; // Light sleep
        case 5: return 'deep';  // Deep sleep
        case 6: return 'rem';   // REM
        default: return 'unknown';
      }
    };

    const stages: SleepStage[] = (latestSession.stages || []).map((stage: any) => {
      const startTime = new Date(stage.startTime);
      const endTime = new Date(stage.endTime);
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

      return {
        stage: mapStageType(stage.stage),
        startTime,
        endTime,
        duration,
      };
    });

    const startTime = new Date(latestSession.startTime);
    const endTime = new Date(latestSession.endTime);
    const totalDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    // Calculer le score de qualité
    const deepSleep = stages
      .filter((s) => s.stage === 'deep')
      .reduce((sum, s) => sum + s.duration, 0);
    const remSleep = stages
      .filter((s) => s.stage === 'rem')
      .reduce((sum, s) => sum + s.duration, 0);
    
    const deepRemPercent = totalDuration > 0 
      ? ((deepSleep + remSleep) / totalDuration) * 100 
      : 0;
    const qualityScore = Math.min(100, Math.round(deepRemPercent * 2.5));

    return {
      success: true,
      data: {
        totalDuration,
        startTime,
        endTime,
        stages: stages.length > 0 ? stages : undefined,
        qualityScore: stages.length > 0 ? qualityScore : undefined,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'UNKNOWN', message: error.message },
    };
  }
}

/**
 * Récupère le nombre de pas
 */
export async function getSteps(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  try {
    const result = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: options.startDate.toISOString(),
        endTime: options.endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return {
        success: false,
        error: { code: 'NO_DATA', message: 'No step data' },
      };
    }

    const totalSteps = result.records.reduce(
      (sum: number, record: any) => sum + record.count,
      0
    );

    return {
      success: true,
      data: totalSteps,
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'UNKNOWN', message: error.message },
    };
  }
}

/**
 * Récupère les calories brûlées
 */
export async function getActiveCalories(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  try {
    const result = await readRecords('TotalCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime: options.startDate.toISOString(),
        endTime: options.endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return {
        success: false,
        error: { code: 'NO_DATA', message: 'No calorie data' },
      };
    }

    const totalCalories = result.records.reduce(
      (sum: number, record: any) => sum + record.energy.inKilocalories,
      0
    );

    return {
      success: true,
      data: Math.round(totalCalories),
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'UNKNOWN', message: error.message },
    };
  }
}

/**
 * Récupère la saturation en oxygène
 */
export async function getOxygenSaturation(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  try {
    const result = await readRecords('OxygenSaturation', {
      timeRangeFilter: {
        operator: 'between',
        startTime: options.startDate.toISOString(),
        endTime: options.endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return {
        success: false,
        error: { code: 'NO_DATA', message: 'No SpO2 data' },
      };
    }

    const latestRecord = result.records[result.records.length - 1];
    
    // Health Connect stocke en pourcentage (0-100)
    return {
      success: true,
      data: Math.round(latestRecord.percentage),
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'UNKNOWN', message: error.message },
    };
  }
}

/**
 * Récupère le rythme respiratoire
 */
export async function getRespiratoryRate(
  options: TimeRangeOptions
): Promise<HealthResult<number>> {
  try {
    const result = await readRecords('RespiratoryRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime: options.startDate.toISOString(),
        endTime: options.endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return {
        success: false,
        error: { code: 'NO_DATA', message: 'No respiratory rate data' },
      };
    }

    const latestRecord = result.records[result.records.length - 1];
    
    return {
      success: true,
      data: latestRecord.rate,
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'UNKNOWN', message: error.message },
    };
  }
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
    respiratoryResult,
  ] = await Promise.all([
    getHeartRate(options),
    getRestingHeartRate(options),
    getHRV(options),
    getSleep(options),
    getSteps(options),
    getActiveCalories(options),
    getOxygenSaturation(options),
    getRespiratoryRate(options),
  ]);

  return {
    heartRate: heartRateResult.success ? heartRateResult.data : null,
    restingHeartRate: restingHRResult.success ? restingHRResult.data : null,
    hrv: hrvResult.success ? hrvResult.data : null,
    sleep: sleepResult.success ? sleepResult.data : null,
    steps: stepsResult.success ? stepsResult.data : null,
    caloriesBurned: caloriesResult.success ? caloriesResult.data : null,
    activeMinutes: null,
    oxygenSaturation: spo2Result.success ? spo2Result.data : null,
    respiratoryRate: respiratoryResult.success ? respiratoryResult.data : null,
    bodyTemperature: null,
    lastSyncDate: new Date(),
    dataSource: 'health_connect',
  };
}

export default {
  isAvailable: isHealthConnectAvailable,
  initialize: initializeHealthConnect,
  getHeartRate,
  getRestingHeartRate,
  getHRV,
  getSleep,
  getSteps,
  getActiveCalories,
  getOxygenSaturation,
  getRespiratoryRate,
  getAllHealthData,
};
