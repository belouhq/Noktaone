/**
 * Types pour le système viral & engagement NOKTA ONE
 */

export interface NotificationMessage {
  title: string;
  body: string;
}

export type NotificationContext =
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | null;

export interface UseNotificationSystemParams {
  userId?: string;
  lastSkaneTimestamp?: string | number | null;
  streak?: number;
  sleepQuality?: "good" | "bad" | null;
  preferredTimes?: { morning?: string; midday?: string; evening?: string };
}

export interface ReminderSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (times: Record<string, string>) => void;
  initialTimes?: { morning?: string; midday?: string; evening?: string };
}

export interface ShareCardProps {
  beforeScore?: { min: number; max: number };
  afterScore?: { min: number; max: number };
  microAction?: string;
  duration?: number;
  userPhoto?: string | null;
  onShare?: () => void;
  onDownload?: () => void;
}

export interface ShareFlowData {
  imageBlob: Blob;
  beforeScore: string;
  afterScore: string;
  duration: number;
  delta: number;
  microAction?: string;
}

export interface ShareFlowProps {
  shareData: ShareFlowData;
  onClose: () => void;
}
