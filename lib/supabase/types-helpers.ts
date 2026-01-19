// ============================================
// NOKTA ONE - Types & Interfaces
// ============================================
// Fichier: lib/supabase/types-helpers.ts
// ============================================

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type SkaneState = 'HIGH_ACTIVATION' | 'LOW_ENERGY' | 'REGULATED';

export type MicroActionCategory = 'relax' | 'activate' | 'center' | 'breath' | 'posture' | 'sensory';

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'paused' 
  | 'unpaid';

export type WearableProvider = 
  | 'apple_health' 
  | 'oura' 
  | 'whoop' 
  | 'fitbit' 
  | 'garmin' 
  | 'samsung' 
  | 'polar' 
  | 'coros' 
  | 'suunto' 
  | 'withings';

export type UserPlan = 'free' | 'premium' | 'pro' | 'lifetime';

export type AccountStatus = 'active' | 'suspended' | 'banned' | 'deleted';

export type ShareChannel = 'tiktok' | 'instagram' | 'twitter' | 'whatsapp' | 'other';

export type AffiliateTier = 'standard' | 'silver' | 'gold' | 'vip';

// ============================================
// INTERFACES
// ============================================

export interface NotificationPreferences {
  daily_reminder: boolean;
  streak_alerts: boolean;
  weekly_summary: boolean;
  marketing: boolean;
  reminder_time: string; // HH:mm format
}

export interface SignalComponents {
  activation?: number;
  energy?: number;
  tension?: number;
  focus?: number;
}

export interface MicroActionInstruction {
  step: number;
  type: 'intro' | 'inhale' | 'exhale' | 'hold' | 'action' | 'breathe' | 'repeat';
  text_key: string;
  duration?: number;
  count?: number;
}

export interface DeviceInfo {
  os?: string;
  os_version?: string;
  device_model?: string;
  browser?: string;
  browser_version?: string;
  screen_width?: number;
  screen_height?: number;
  is_pwa?: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface SkaneAnalysisResult {
  success: boolean;
  internal_state: SkaneState;
  signal_label: string;
  skane_index: number;
  confidence: number;
  micro_action: {
    id: string;
    name: string;
    duration_seconds: number;
    category: MicroActionCategory;
  };
  signal_components?: SignalComponents;
  landmarks?: any;
}

export interface UserStats {
  total_skanes: number;
  total_micro_actions: number;
  current_streak: number;
  best_streak: number;
  total_time_minutes: number;
  avg_mood_improvement: number;
  favorite_action?: string;
}

export interface BiometricSummary {
  date: string;
  sleep_score?: number;
  recovery_score?: number;
  hrv_avg?: number;
  resting_hr?: number;
  strain_score?: number;
  steps?: number;
  provider: WearableProvider;
}

// ============================================
// WEBHOOK PAYLOADS
// ============================================

// FirstPromoter Webhook
export interface FirstPromoterWebhookPayload {
  event: 'referral_created' | 'conversion_created' | 'commission_created' | 'reward_approved' | 'reward_denied';
  data: {
    id: string;
    promoter_id: string;
    referral_id?: string;
    conversion_id?: string;
    commission_amount?: number;
    currency?: string;
    status?: string;
    created_at: string;
  };
}

// Stripe Webhook Events
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

// Terra Webhook
export interface TerraWebhookPayload {
  user: {
    user_id: string;
    provider: string;
    reference_id: string;
  };
  type: 'activity' | 'body' | 'daily' | 'sleep' | 'nutrition';
  data: any[];
}

// OneSignal Webhook
export interface OneSignalWebhookPayload {
  event: 'notification.delivered' | 'notification.clicked' | 'subscription.created';
  app_id: string;
  data: {
    player_id?: string;
    notification_id?: string;
    external_user_id?: string;
  };
}

// ============================================
// ANALYTICS EVENTS
// ============================================

export type AnalyticsEventName =
  // Onboarding
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  // Skane
  | 'skane_started'
  | 'skane_camera_accessed'
  | 'skane_captured'
  | 'skane_analyzing'
  | 'skane_completed'
  | 'skane_failed'
  // Micro-actions
  | 'micro_action_started'
  | 'micro_action_step_completed'
  | 'micro_action_completed'
  | 'micro_action_abandoned'
  // Feedback
  | 'feedback_before_submitted'
  | 'feedback_after_submitted'
  // Share
  | 'share_modal_opened'
  | 'share_generated'
  | 'share_clicked'
  | 'share_downloaded'
  // Subscription
  | 'paywall_viewed'
  | 'subscription_started'
  | 'subscription_completed'
  | 'subscription_failed'
  | 'subscription_canceled'
  // General
  | 'page_viewed'
  | 'button_clicked'
  | 'error_occurred';

export interface AnalyticsEventProperties {
  // Common
  page?: string;
  source?: string;
  // Skane specific
  skane_index?: number;
  state?: SkaneState;
  // Micro-action specific
  action_id?: string;
  action_category?: MicroActionCategory;
  duration_sec?: number;
  completed?: boolean;
  // Subscription specific
  plan?: string;
  price?: number;
  currency?: string;
  // Error specific
  error_code?: string;
  error_message?: string;
  // Custom
  [key: string]: any;
}

// ============================================
// FEATURE FLAGS
// ============================================

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rollout_percentage: number;
}

export const FEATURE_FLAGS = {
  SKANE_V2: 'skane_v2',
  WEARABLES_INTEGRATION: 'wearables_integration',
  PREMIUM_MICRO_ACTIONS: 'premium_micro_actions',
  REFERRAL_PROGRAM: 'referral_program',
  SHARE_TO_STORIES: 'share_to_stories',
  VIRAL_TEMPLATES_V2: 'viral_templates_v2',
  PUSH_NOTIFICATIONS: 'push_notifications',
  SMART_REMINDERS: 'smart_reminders',
  AB_TEST_ONBOARDING: 'ab_test_onboarding',
  NEW_UI_HOME: 'new_ui_home',
  ENHANCED_ANALYTICS: 'enhanced_analytics',
} as const;

// ============================================
// HELPER FUNCTIONS TYPE GUARDS
// ============================================

export function isValidSkaneState(state: string): state is SkaneState {
  return ['HIGH_ACTIVATION', 'LOW_ENERGY', 'REGULATED'].includes(state);
}

export function isValidSubscriptionStatus(status: string): status is SubscriptionStatus {
  return ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'paused', 'unpaid'].includes(status);
}

export function isValidWearableProvider(provider: string): provider is WearableProvider {
  return ['apple_health', 'oura', 'whoop', 'fitbit', 'garmin', 'samsung', 'polar', 'coros', 'suunto', 'withings'].includes(provider);
}

// ============================================
// API ROUTE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}
