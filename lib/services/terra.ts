// ============================================
// NOKTA ONE - Terra API Service
// ============================================
// Fichier: lib/services/terra.ts
// Documentation: https://docs.tryterra.co/
// ============================================

const TERRA_API_KEY = process.env.TERRA_API_KEY!;
const TERRA_DEV_ID = process.env.TERRA_DEV_ID!;
const TERRA_API_URL = 'https://api.tryterra.co/v2';

// ============================================
// TYPES
// ============================================

export type TerraProvider =
  | 'APPLE'
  | 'OURA'
  | 'WHOOP'
  | 'FITBIT'
  | 'GARMIN'
  | 'SAMSUNG'
  | 'POLAR'
  | 'COROS'
  | 'SUUNTO'
  | 'WITHINGS'
  | 'GOOGLE';

export interface TerraUser {
  user_id: string;
  provider: TerraProvider;
  reference_id?: string;
  last_webhook_update?: string;
  scopes?: string;
  active: boolean;
}

export interface TerraSession {
  status: string;
  session_id: string;
  url?: string;
  expires_at?: string;
}

export interface TerraSleepData {
  metadata: {
    start_time: string;
    end_time: string;
  };
  sleep_durations_data?: {
    asleep?: { duration_asleep_state_seconds?: number };
    awake?: { duration_awake_state_seconds?: number };
    sleep_efficiency?: number;
    other?: {
      duration_in_bed_seconds?: number;
      duration_unmeasurable_sleep_seconds?: number;
    };
  };
  sleep_stages_data?: {
    sleep_stage_durations?: {
      duration_deep_sleep_state_seconds?: number;
      duration_light_sleep_state_seconds?: number;
      duration_rem_sleep_state_seconds?: number;
    };
  };
  heart_rate_data?: {
    summary?: {
      avg_hr_bpm?: number;
      min_hr_bpm?: number;
      max_hr_bpm?: number;
      resting_hr_bpm?: number;
    };
  };
  hrv_data?: {
    summary?: {
      avg_hrv_rmssd?: number;
      avg_hrv_sdnn?: number;
    };
  };
  readiness_data?: {
    readiness?: number;
    recovery_level?: number;
  };
  respiration_data?: {
    breaths_data?: {
      avg_breaths_per_min?: number;
    };
  };
  temperature_data?: {
    delta?: number;
  };
}

export interface TerraActivityData {
  metadata: {
    start_time: string;
    end_time: string;
    type?: string;
    name?: string;
  };
  calories_data?: {
    total_burned_calories?: number;
    net_activity_calories?: number;
  };
  distance_data?: {
    summary?: {
      distance_meters?: number;
      steps?: number;
    };
  };
  active_durations_data?: {
    activity_seconds?: number;
  };
  heart_rate_data?: {
    summary?: {
      avg_hr_bpm?: number;
      max_hr_bpm?: number;
      min_hr_bpm?: number;
    };
  };
  strain_data?: {
    strain_level?: number;
  };
}

export interface TerraBodyData {
  metadata: {
    start_time: string;
    end_time: string;
  };
  blood_oxygen_data?: {
    avg_saturation_percentage?: number;
  };
  heart_data?: {
    heart_rate_data?: {
      summary?: {
        avg_hr_bpm?: number;
        resting_hr_bpm?: number;
      };
    };
  };
  measurements_data?: {
    measurements?: {
      weight_kg?: number;
      height_cm?: number;
      bmi?: number;
    }[];
  };
}

export interface TerraWebhookPayload {
  type: 'sleep' | 'activity' | 'body' | 'daily' | 'nutrition' | 'menstruation' | 'athlete';
  user: {
    user_id: string;
    provider: TerraProvider;
    reference_id?: string;
  };
  data: any[];
}

// ============================================
// TERRA SERVICE
// ============================================

class TerraService {
  private apiKey: string;
  private devId: string;

  constructor() {
    this.apiKey = TERRA_API_KEY;
    this.devId = TERRA_DEV_ID;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const response = await fetch(`${TERRA_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'dev-id': this.devId,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Terra API Error: ${response.status} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  /**
   * Générer une session de connexion widget
   */
  async generateWidgetSession(
    referenceId: string,
    providers: TerraProvider[] = ['APPLE', 'OURA', 'WHOOP', 'FITBIT', 'GARMIN'],
    language: string = 'fr'
  ): Promise<TerraSession> {
    return this.request<TerraSession>('/auth/generateWidgetSession', 'POST', {
      reference_id: referenceId,
      providers: providers.join(','),
      language,
      auth_success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/wearables/success`,
      auth_failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/wearables/error`,
    });
  }

  /**
   * Générer une session pour un provider spécifique
   */
  async generateAuthUrl(
    referenceId: string,
    provider: TerraProvider
  ): Promise<{ auth_url: string; user_id: string }> {
    return this.request('/auth/authenticateUser', 'POST', {
      reference_id: referenceId,
      resource: provider,
    });
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Récupérer un utilisateur Terra
   */
  async getUser(terraUserId: string): Promise<TerraUser> {
    const response = await this.request<{ user: TerraUser }>(`/userInfo?user_id=${terraUserId}`);
    return response.user;
  }

  /**
   * Lister tous les utilisateurs
   */
  async listUsers(): Promise<TerraUser[]> {
    const response = await this.request<{ users: TerraUser[] }>('/subscriptions');
    return response.users;
  }

  /**
   * Supprimer/déconnecter un utilisateur
   */
  async deauthenticateUser(terraUserId: string): Promise<void> {
    await this.request(`/auth/deauthenticateUser?user_id=${terraUserId}`, 'DELETE');
  }

  // ============================================
  // DATA RETRIEVAL
  // ============================================

  /**
   * Récupérer les données de sommeil
   */
  async getSleepData(
    terraUserId: string,
    startDate: string,
    endDate?: string
  ): Promise<TerraSleepData[]> {
    let url = `/sleep?user_id=${terraUserId}&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await this.request<{ data: TerraSleepData[] }>(url);
    return response.data || [];
  }

  /**
   * Récupérer les données d'activité
   */
  async getActivityData(
    terraUserId: string,
    startDate: string,
    endDate?: string
  ): Promise<TerraActivityData[]> {
    let url = `/activity?user_id=${terraUserId}&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await this.request<{ data: TerraActivityData[] }>(url);
    return response.data || [];
  }

  /**
   * Récupérer les données corporelles (HR, SpO2, etc.)
   */
  async getBodyData(
    terraUserId: string,
    startDate: string,
    endDate?: string
  ): Promise<TerraBodyData[]> {
    let url = `/body?user_id=${terraUserId}&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await this.request<{ data: TerraBodyData[] }>(url);
    return response.data || [];
  }

  /**
   * Récupérer le résumé quotidien
   */
  async getDailyData(
    terraUserId: string,
    startDate: string,
    endDate?: string
  ): Promise<any[]> {
    let url = `/daily?user_id=${terraUserId}&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await this.request<{ data: any[] }>(url);
    return response.data || [];
  }

  // ============================================
  // WEBHOOK HANDLING
  // ============================================

  /**
   * Valider la signature d'un webhook
   */
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return signature === expectedSignature;
  }

  /**
   * Parser un webhook
   */
  parseWebhook(payload: any): TerraWebhookPayload {
    return payload as TerraWebhookPayload;
  }
}

// Export singleton
export const terraService = new TerraService();

// ============================================
// HELPERS: Sync avec Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';

/**
 * Mapper un provider Terra vers notre format
 */
function mapTerraProvider(terraProvider: TerraProvider): string {
  const mapping: Record<TerraProvider, string> = {
    APPLE: 'apple_health',
    OURA: 'oura',
    WHOOP: 'whoop',
    FITBIT: 'fitbit',
    GARMIN: 'garmin',
    SAMSUNG: 'samsung',
    POLAR: 'polar',
    COROS: 'coros',
    SUUNTO: 'suunto',
    WITHINGS: 'withings',
    GOOGLE: 'google_fit',
  };
  return mapping[terraProvider] || terraProvider.toLowerCase();
}

/**
 * Sauvegarder une connexion wearable
 */
export async function saveWearableConnection(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  terraUser: TerraUser
): Promise<void> {
  await supabase.from('wearable_connections').upsert(
    {
      user_id: userId,
      terra_user_id: terraUser.user_id,
      terra_reference_id: terraUser.reference_id,
      provider: mapTerraProvider(terraUser.provider),
      is_connected: terraUser.active,
      connection_status: terraUser.active ? 'active' : 'disconnected',
      scopes_granted: terraUser.scopes?.split(',') || [],
      last_sync_at: terraUser.last_webhook_update,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,provider' }
  );
}

/**
 * Sauvegarder les données biométriques quotidiennes
 */
export async function saveBiometricSummary(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  date: string,
  provider: string,
  sleepData?: TerraSleepData,
  activityData?: TerraActivityData,
  bodyData?: TerraBodyData
): Promise<void> {
  const summary: any = {
    user_id: userId,
    date,
    provider,
    updated_at: new Date().toISOString(),
  };

  // Sleep data
  if (sleepData) {
    const sleepDurations = sleepData.sleep_durations_data;
    const sleepStages = sleepData.sleep_stages_data?.sleep_stage_durations;
    const hrvData = sleepData.hrv_data?.summary;
    const heartData = sleepData.heart_rate_data?.summary;
    const readiness = sleepData.readiness_data;
    const respiration = sleepData.respiration_data?.breaths_data;
    const temp = sleepData.temperature_data;

    if (sleepDurations?.asleep?.duration_asleep_state_seconds) {
      summary.sleep_duration_min = Math.round(sleepDurations.asleep.duration_asleep_state_seconds / 60);
    }
    if (sleepDurations?.sleep_efficiency) {
      summary.sleep_efficiency = sleepDurations.sleep_efficiency;
    }
    if (sleepStages?.duration_deep_sleep_state_seconds) {
      summary.deep_sleep_min = Math.round(sleepStages.duration_deep_sleep_state_seconds / 60);
    }
    if (sleepStages?.duration_light_sleep_state_seconds) {
      summary.light_sleep_min = Math.round(sleepStages.duration_light_sleep_state_seconds / 60);
    }
    if (sleepStages?.duration_rem_sleep_state_seconds) {
      summary.rem_sleep_min = Math.round(sleepStages.duration_rem_sleep_state_seconds / 60);
    }
    if (hrvData?.avg_hrv_rmssd) {
      summary.hrv_avg = hrvData.avg_hrv_rmssd;
      summary.hrv_rmssd = hrvData.avg_hrv_rmssd;
    }
    if (hrvData?.avg_hrv_sdnn) {
      summary.hrv_sdnn = hrvData.avg_hrv_sdnn;
    }
    if (heartData?.resting_hr_bpm) {
      summary.resting_hr = heartData.resting_hr_bpm;
    }
    if (readiness?.readiness) {
      summary.readiness_score = readiness.readiness;
    }
    if (readiness?.recovery_level) {
      summary.recovery_score = readiness.recovery_level;
    }
    if (respiration?.avg_breaths_per_min) {
      summary.respiratory_rate = respiration.avg_breaths_per_min;
    }
    if (temp?.delta) {
      summary.skin_temp_deviation = temp.delta;
    }
  }

  // Activity data
  if (activityData) {
    const calories = activityData.calories_data;
    const distance = activityData.distance_data?.summary;
    const strain = activityData.strain_data;
    const heartRate = activityData.heart_rate_data?.summary;
    const duration = activityData.active_durations_data;

    if (calories?.net_activity_calories) {
      summary.active_calories = Math.round(calories.net_activity_calories);
    }
    if (calories?.total_burned_calories) {
      summary.total_calories = Math.round(calories.total_burned_calories);
    }
    if (distance?.steps) {
      summary.steps = distance.steps;
    }
    if (distance?.distance_meters) {
      summary.distance_meters = Math.round(distance.distance_meters);
    }
    if (strain?.strain_level) {
      summary.strain_score = strain.strain_level;
    }
    if (heartRate?.avg_hr_bpm) {
      summary.hr_avg = heartRate.avg_hr_bpm;
    }
    if (heartRate?.max_hr_bpm) {
      summary.hr_max = heartRate.max_hr_bpm;
    }
    if (heartRate?.min_hr_bpm) {
      summary.hr_min = heartRate.min_hr_bpm;
    }
    if (duration?.activity_seconds) {
      summary.active_minutes = Math.round(duration.activity_seconds / 60);
    }
  }

  // Body data
  if (bodyData) {
    const bloodOxygen = bodyData.blood_oxygen_data;
    
    if (bloodOxygen?.avg_saturation_percentage) {
      summary.spo2_avg = bloodOxygen.avg_saturation_percentage;
    }
  }

  // Calculer le sleep_score si on a assez de données
  if (summary.sleep_efficiency && summary.sleep_duration_min) {
    // Score simplifié basé sur durée et efficacité
    const durationScore = Math.min(100, (summary.sleep_duration_min / 480) * 100); // 8h = 100%
    const efficiencyScore = summary.sleep_efficiency;
    summary.sleep_score = Math.round((durationScore + efficiencyScore) / 2);
  }

  await supabase.from('biometric_daily_summary').upsert(summary, {
    onConflict: 'user_id,date,provider',
  });
}

/**
 * Traiter un webhook Terra
 */
export async function processTerraWebhook(
  supabase: ReturnType<typeof createClient>,
  payload: TerraWebhookPayload
): Promise<void> {
  const { type, user, data } = payload;
  const terraUserId = user.user_id;
  const provider = mapTerraProvider(user.provider);

  // Trouver l'utilisateur Nokta
  const { data: connection } = await supabase
    .from('wearable_connections')
    .select('user_id')
    .eq('terra_user_id', terraUserId)
    .single();

  if (!connection) {
    console.error('No user found for Terra user:', terraUserId);
    return;
  }

  const userId = connection.user_id;

  // Mettre à jour le last_sync
  await supabase
    .from('wearable_connections')
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: 'success',
    })
    .eq('terra_user_id', terraUserId);

  // Traiter selon le type
  for (const item of data) {
    const date = item.metadata?.start_time?.split('T')[0] || new Date().toISOString().split('T')[0];

    switch (type) {
      case 'sleep':
        await saveBiometricSummary(supabase, userId, date, provider, item as TerraSleepData);
        break;
      case 'activity':
        await saveBiometricSummary(supabase, userId, date, provider, undefined, item as TerraActivityData);
        break;
      case 'body':
        await saveBiometricSummary(supabase, userId, date, provider, undefined, undefined, item as TerraBodyData);
        break;
      case 'daily':
        // Le daily combine souvent sleep + activity
        await saveBiometricSummary(
          supabase,
          userId,
          date,
          provider,
          item.sleep as TerraSleepData,
          item.activity as TerraActivityData
        );
        break;
    }
  }
}
