/**
 * Notification Service Exports
 */

export {
  sendNotification,
  sendBulkNotification,
  scheduleTrialNotifications,
  cancelScheduledNotifications,
  scheduleWinbackNotifications,
  sendStreakAtRiskNotification,
  sendStreakCelebrationNotification,
  updateTrialNotificationVariables,
} from './service';

export { NOTIFICATION_TEMPLATES, LOCALE_PRICING } from './constants';
export type { NotificationType } from './constants';
