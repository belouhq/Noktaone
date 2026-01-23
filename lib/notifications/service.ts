// ============================================
// NOKTA NOTIFICATION SERVICE
// Version: 1.0.0
// Pour OneSignal Push Notifications
// ============================================

import { NOTIFICATION_TEMPLATES, LOCALE_PRICING } from './constants';
import { interpolateTemplate } from './utils';
import { formatPrice } from '@/lib/utils/formatPrice';
import type { 
  NotificationType, 
  SupportedLocale,
} from './types';
import type { TrialProgress } from '@/lib/paywall/types';

// ===================
// TYPES
// ===================

interface SendNotificationParams {
  playerId: string; // OneSignal player ID
  type: NotificationType;
  variables?: Record<string, string | number>;
  scheduleAt?: Date;
}

interface ScheduleTrialNotificationsParams {
  userId: string;
  playerId: string;
  firstName: string;
  trialStartDate: Date;
  locale: SupportedLocale;
}

// ===================
// ONESIGNAL CLIENT
// ===================

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '';
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY || '';

async function sendOneSignalNotification(params: {
  playerIds: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sendAfter?: string; // ISO date string
}): Promise<{ id: string; success: boolean }> {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.warn('OneSignal not configured, skipping notification');
    return { id: '', success: false };
  }

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: params.playerIds,
      headings: { en: params.title, fr: params.title },
      contents: { en: params.body, fr: params.body },
      data: params.data || {},
      send_after: params.sendAfter,
      // iOS specific
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      // Android specific
      android_channel_id: process.env.ONESIGNAL_ANDROID_CHANNEL_ID,
      // TTL
      ttl: 86400, // 24h
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('OneSignal error:', error);
    throw new Error(`OneSignal API error: ${error.errors?.[0] || 'Unknown'}`);
  }
  
  const result = await response.json();
  return { id: result.id, success: true };
}

// ===================
// NOTIFICATION SENDING
// ===================

/**
 * Envoie une notification immédiate
 */
export async function sendNotification({
  playerId,
  type,
  variables = {},
  scheduleAt,
}: SendNotificationParams): Promise<{ success: boolean; notificationId?: string }> {
  const template = NOTIFICATION_TEMPLATES[type];
  
  if (!template) {
    console.error(`Unknown notification type: ${type}`);
    return { success: false };
  }
  
  const title = interpolateTemplate(template.title, variables);
  const body = interpolateTemplate(template.body, variables);
  
  try {
    const result = await sendOneSignalNotification({
      playerIds: [playerId],
      title,
      body,
      data: {
        type,
        ...variables,
      },
      sendAfter: scheduleAt?.toISOString(),
    });
    
    return { success: true, notificationId: result.id };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { success: false };
  }
}

/**
 * Envoie une notification à plusieurs utilisateurs
 */
export async function sendBulkNotification(
  playerIds: string[],
  type: NotificationType,
  variables: Record<string, string | number> = {}
): Promise<{ success: boolean; notificationId?: string }> {
  const template = NOTIFICATION_TEMPLATES[type];
  
  if (!template) {
    return { success: false };
  }
  
  const title = interpolateTemplate(template.title, variables);
  const body = interpolateTemplate(template.body, variables);
  
  try {
    const result = await sendOneSignalNotification({
      playerIds,
      title,
      body,
      data: { type, ...variables },
    });
    
    return { success: true, notificationId: result.id };
  } catch (error) {
    console.error('Failed to send bulk notification:', error);
    return { success: false };
  }
}

// ===================
// TRIAL NOTIFICATION SEQUENCE
// ===================

/**
 * Planifie toute la séquence de notifications pour un nouveau trial
 */
export async function scheduleTrialNotifications({
  userId,
  playerId,
  firstName,
  trialStartDate,
  locale,
}: ScheduleTrialNotificationsParams): Promise<void> {
  const pricing = LOCALE_PRICING[locale] || LOCALE_PRICING.fr;
  const monthlyPrice = formatPrice(pricing.monthly, pricing.currency);
  
  const baseVariables = {
    firstName,
    monthlyPrice,
  };
  
  // Définir la séquence de notifications
  const schedule: Array<{
    day: number;
    hour: number;
    type: NotificationType;
    extraVariables?: Record<string, string | number>;
  }> = [
    // Jour 0 - Welcome (immédiat)
    { day: 0, hour: 0, type: 'trial_welcome' },
    
    // Jours 1-6 - Rappels quotidiens (8h du matin)
    { day: 1, hour: 8, type: 'trial_day_reminder' },
    { day: 2, hour: 8, type: 'trial_day_reminder' },
    { day: 3, hour: 8, type: 'streak_celebration' },
    { day: 4, hour: 8, type: 'trial_day_reminder' },
    { day: 5, hour: 8, type: 'feature_unlock' },
    { day: 6, hour: 8, type: 'trial_day_reminder' },
    
    // Jours 7-10 - Séquence conversion
    { day: 7, hour: 10, type: 'trial_day_7_warning' },
    { day: 8, hour: 10, type: 'trial_day_8_offer' },
    { day: 9, hour: 10, type: 'trial_day_9_urgency' },
    { day: 10, hour: 8, type: 'trial_day_10_final' },
    { day: 10, hour: 20, type: 'trial_day_10_final' }, // Rappel soir
  ];
  
  // Planifier chaque notification
  for (const item of schedule) {
    const scheduleDate = new Date(trialStartDate);
    scheduleDate.setDate(scheduleDate.getDate() + item.day);
    scheduleDate.setHours(item.hour, 0, 0, 0);
    
    // Ne pas planifier dans le passé
    if (scheduleDate <= new Date()) {
      continue;
    }
    
    await sendNotification({
      playerId,
      type: item.type,
      variables: { ...baseVariables, ...item.extraVariables },
      scheduleAt: scheduleDate,
    });
  }
}

/**
 * Annule toutes les notifications planifiées pour un utilisateur
 * (appelé quand l'utilisateur convertit)
 */
export async function cancelScheduledNotifications(playerId: string): Promise<void> {
  // OneSignal ne permet pas d'annuler par player_id directement
  // On doit stocker les notification IDs en DB et les annuler un par un
  // Pour l'instant, on ne fait rien - les notifications sont ignorées si l'user est premium
  console.log(`Would cancel notifications for player: ${playerId}`);
}

// ===================
// WINBACK SEQUENCE
// ===================

/**
 * Planifie la séquence de winback après expiration du trial
 */
export async function scheduleWinbackNotifications(
  playerId: string,
  firstName: string,
  trialExpiredDate: Date,
  locale: SupportedLocale
): Promise<void> {
  const pricing = LOCALE_PRICING[locale] || LOCALE_PRICING.fr;
  
  const schedule: Array<{
    daysAfterExpiry: number;
    type: NotificationType;
  }> = [
    { daysAfterExpiry: 3, type: 'winback_day_3' },
    { daysAfterExpiry: 7, type: 'winback_day_7' },
    { daysAfterExpiry: 14, type: 'winback_day_14' },
    { daysAfterExpiry: 30, type: 'winback_day_30' },
  ];
  
  for (const item of schedule) {
    const scheduleDate = new Date(trialExpiredDate);
    scheduleDate.setDate(scheduleDate.getDate() + item.daysAfterExpiry);
    scheduleDate.setHours(10, 0, 0, 0); // 10h du matin
    
    await sendNotification({
      playerId,
      type: item.type,
      variables: {
        firstName,
        monthlyPrice: formatPrice(pricing.monthly, pricing.currency),
      },
      scheduleAt: scheduleDate,
    });
  }
}

// ===================
// STREAK NOTIFICATIONS
// ===================

/**
 * Envoie une notification de streak en danger
 */
export async function sendStreakAtRiskNotification(
  playerId: string,
  currentStreak: number
): Promise<void> {
  await sendNotification({
    playerId,
    type: 'streak_at_risk',
    variables: { streak: currentStreak },
  });
}

/**
 * Envoie une notification de célébration de streak
 */
export async function sendStreakCelebrationNotification(
  playerId: string,
  firstName: string,
  streak: number
): Promise<void> {
  // Célébrer à 5, 7, 14, 21, 30 jours
  const milestones = [5, 7, 14, 21, 30];
  if (!milestones.includes(streak)) return;
  
  const typeMap: Record<number, NotificationType> = {
    5: 'streak_5',
    7: 'streak_7',
    14: 'streak_14',
    21: 'streak_21',
    30: 'streak_30',
  };
  
  const type = typeMap[streak] || 'streak_celebration';
  
  await sendNotification({
    playerId,
    type,
    variables: { firstName, streak },
  });
}

// ===================
// DYNAMIC NOTIFICATIONS
// ===================

/**
 * Met à jour les notifications de trial avec les stats actuelles
 * (appelé quand on récupère le trial progress)
 */
export async function updateTrialNotificationVariables(
  playerId: string,
  progress: TrialProgress,
  locale: SupportedLocale
): Promise<void> {
  // Les notifications J7-J10 peuvent être personnalisées avec les stats
  // On ne peut pas modifier les notifications déjà planifiées dans OneSignal
  // Donc on stocke les stats en DB et on les récupère au moment de l'envoi
  // via un webhook ou une cloud function
  console.log('Trial progress for notifications:', {
    playerId,
    totalSkanes: progress.totalSkanes,
    avgImprovement: progress.averageImprovement,
  });
}
