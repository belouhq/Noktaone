/**
 * Messages contextuels pour rappels — système viral NOKTA ONE
 * Utilisable par cron, service worker ou API (pas de React).
 * Respecte : quiet hours 22h–6h, rappel doux >24h, moins insistant >48h.
 */

import {
  getNotificationContext,
  getRandomMessage,
  NOTIFICATION_MESSAGES,
} from "@/lib/viral/notificationMessages";
import type { NotificationMessage } from "@/lib/viral";

export const QUIET_HOURS_START = 22; // 22h
export const QUIET_HOURS_END = 6; // 6h

export interface ContextualReminderParams {
  /** Heure locale (0–23) */
  hour: number;
  /** Heures depuis le dernier Skane (pour rappel doux >24h, moins insistant >48h) */
  lastSkaneHoursAgo: number;
  streak?: number;
  sleepQuality?: string | null;
}

/**
 * Retourne un message contextuel pour une notification de rappel,
 * ou null si outside créneaux (quiet hours 22h–6h) ou pas de message.
 * >48h sans Skane : message moins insistant ("Quand tu veux. Nokta est là.").
 * >24h : rappel doux ("Ton corps attend un signal.").
 */
export function getContextualReminderMessage(
  params: ContextualReminderParams
): NotificationMessage | null {
  const { hour, lastSkaneHoursAgo, streak = 0, sleepQuality = null } = params;

  if (hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END) {
    return null;
  }

  const timeBased = NOTIFICATION_MESSAGES.timeBased as Record<
    string,
    NotificationMessage[]
  >;
  if (timeBased?.after48h?.length && lastSkaneHoursAgo >= 48) {
    return getRandomMessage(timeBased.after48h);
  }
  if (timeBased?.after24h?.length && lastSkaneHoursAgo >= 24) {
    return getRandomMessage(timeBased.after24h);
  }

  return getNotificationContext(hour, lastSkaneHoursAgo, streak, sleepQuality);
}
