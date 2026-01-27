/**
 * NOKTA ONE - Système viral & engagement
 * Exports centralisés
 */

export { useNotificationSystem } from "./useNotificationSystem";
export {
  NOTIFICATION_MESSAGES,
  getRandomMessage,
  getNotificationContext,
} from "./notificationMessages";
export {
  SHARE_TEMPLATES,
  generateShareText,
  downloadImage,
} from "./shareTemplates";
export type { ShareTextData } from "./shareTemplates";
export type {
  NotificationMessage,
  UseNotificationSystemParams,
  ReminderSetupModalProps,
  ShareCardProps,
  ShareFlowData,
  ShareFlowProps,
} from "./types";
