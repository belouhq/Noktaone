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

export {
  getContextualReminderMessage,
  QUIET_HOURS_START,
  QUIET_HOURS_END,
} from './contextual';
export type { ContextualReminderParams } from './contextual';
