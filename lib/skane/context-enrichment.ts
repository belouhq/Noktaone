/**
 * ENRICHISSEMENT DU CONTEXTE - NOKTA ONE
 * 
 * Récupère et enrichit le contexte utilisateur pour l'analyse GPT-4 Vision
 */

import { supabaseAdmin } from '@/lib/supabase/server';

export interface UserContext {
  localTime: string;
  timeOfDay: string;
  lastScanTime?: string;
  recentHistory?: string;
  hrv?: number;
  sleepHours?: number;
  sleepQuality?: number;
  activityLevel?: string;
  stepsToday?: number;
  weather?: {
    temp: number;
    condition: string;
  };
  timezone?: string;
  avgStressLast7Days?: number;
  preferredActions?: string[];
}

export async function getUserContext(userId: string | null): Promise<UserContext> {
  const now = new Date();
  const context: UserContext = {
    localTime: now.toISOString(),
    timeOfDay: getTimeOfDay(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  if (!userId) return context;

  try {
    const supabase = supabaseAdmin;

    // 1. Récupérer les derniers scans
    const { data: recentScans } = await supabase
      .from('skane_sessions')
      .select('created_at, internal_state, stress_level, selected_action_id, feedback')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentScans && recentScans.length > 0) {
      context.lastScanTime = recentScans[0].created_at;
      
      // Résumé de l'historique récent
      const stressLevels = recentScans
        .map(s => s.stress_level)
        .filter((level): level is number => level !== null && level !== undefined);
      
      if (stressLevels.length > 0) {
        context.avgStressLast7Days = Math.round(
          stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length
        );
      }
      
      // Actions préférées (celles avec feedback positif)
      context.preferredActions = recentScans
        .filter(s => s.feedback === 'better' && s.selected_action_id)
        .map(s => s.selected_action_id!)
        .filter(Boolean)
        .slice(0, 5); // Top 5
      
      // Historique textuel pour le prompt
      context.recentHistory = recentScans.slice(0, 3)
        .map(s => `${s.internal_state || 'UNKNOWN'} (stress: ${s.stress_level || 'N/A'})`)
        .join(', ');
    }

    // 2. Récupérer données biométriques (Terra API ou autres sources)
    const { data: terraData } = await supabase
      .from('user_biometrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (terraData) {
      context.hrv = terraData.hrv ?? undefined;
      context.sleepHours = terraData.sleep_hours ?? undefined;
      context.sleepQuality = terraData.sleep_quality ?? undefined;
      context.stepsToday = terraData.steps ?? undefined;
      context.activityLevel = categorizeActivity(terraData.steps ?? 0);
    }

    // 3. Récupérer météo (si disponible)
    const { data: weatherData } = await supabase
      .from('user_weather_cache')
      .select('temperature, condition')
      .eq('user_id', userId)
      .gt('fetched_at', new Date(Date.now() - 3600000).toISOString()) // Cache 1h
      .maybeSingle();

    if (weatherData) {
      context.weather = {
        temp: weatherData.temperature,
        condition: weatherData.condition || 'unknown',
      };
    }
  } catch (error) {
    console.error('Error enriching context:', error);
    // Continue avec le contexte de base en cas d'erreur
  }

  return context;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function categorizeActivity(steps: number): string {
  if (steps < 2000) return 'sedentary';
  if (steps < 5000) return 'light';
  if (steps < 10000) return 'moderate';
  return 'active';
}
