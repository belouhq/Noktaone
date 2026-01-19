// ============================================
// NOKTA ONE - OneSignal Service
// ============================================
// Fichier: lib/services/onesignal.ts
// ============================================

import { createClient } from '@supabase/supabase-js';

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!;
const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1';

// ============================================
// TYPES
// ============================================

interface SendNotificationParams {
  userId?: string;
  playerIds?: string[];
  externalUserIds?: string[];
  segment?: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  url?: string;
  smallIcon?: string;
  largeIcon?: string;
  bigPicture?: string;
  buttons?: { id: string; text: string; icon?: string }[];
  scheduledTime?: Date;
  ttl?: number; // Time to live in seconds
}

interface NotificationResponse {
  id: string;
  recipients: number;
  external_id?: string;
}

interface PlayerInfo {
  id: string;
  identifier?: string;
  session_count: number;
  language: string;
  timezone: number;
  game_version: string;
  device_os: string;
  device_type: number;
  device_model: string;
  tags: Record<string, string>;
  last_active: number;
  playtime: number;
  amount_spent: number;
  created_at: number;
  invalid_identifier: boolean;
  badge_count: number;
  sdk: string;
  test_type: number;
  ip: string;
  external_user_id?: string;
}

// ============================================
// ONESIGNAL CLIENT
// ============================================

class OneSignalService {
  private appId: string;
  private apiKey: string;

  constructor() {
    this.appId = ONESIGNAL_APP_ID;
    this.apiKey = ONESIGNAL_REST_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const response = await fetch(`${ONESIGNAL_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OneSignal API Error: ${response.status} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  /**
   * Envoyer une notification push
   */
  async sendNotification(params: SendNotificationParams): Promise<NotificationResponse> {
    const payload: any = {
      app_id: this.appId,
      headings: { en: params.title, fr: params.title },
      contents: { en: params.message, fr: params.message },
    };

    // Ciblage
    if (params.playerIds && params.playerIds.length > 0) {
      payload.include_player_ids = params.playerIds;
    } else if (params.externalUserIds && params.externalUserIds.length > 0) {
      payload.include_external_user_ids = params.externalUserIds;
      payload.channel_for_external_user_ids = 'push';
    } else if (params.segment) {
      payload.included_segments = [params.segment];
    } else if (params.userId) {
      payload.include_external_user_ids = [params.userId];
      payload.channel_for_external_user_ids = 'push';
    } else {
      throw new Error('Must specify playerIds, externalUserIds, segment, or userId');
    }

    // Options
    if (params.data) {
      payload.data = params.data;
    }
    if (params.url) {
      payload.url = params.url;
    }
    if (params.smallIcon) {
      payload.small_icon = params.smallIcon;
    }
    if (params.largeIcon) {
      payload.large_icon = params.largeIcon;
    }
    if (params.bigPicture) {
      payload.big_picture = params.bigPicture;
    }
    if (params.buttons) {
      payload.buttons = params.buttons;
    }
    if (params.scheduledTime) {
      payload.send_after = params.scheduledTime.toISOString();
    }
    if (params.ttl) {
      payload.ttl = params.ttl;
    }

    return this.request<NotificationResponse>('/notifications', 'POST', payload);
  }

  /**
   * Envoyer un rappel quotidien
   */
  async sendDailyReminder(userId: string, locale: string = 'fr'): Promise<NotificationResponse> {
    const messages: Record<string, { title: string; message: string }> = {
      fr: {
        title: '🧘 Temps de reset',
        message: 'Prends 30 secondes pour toi. Ton corps te remerciera.',
      },
      en: {
        title: '🧘 Time to reset',
        message: 'Take 30 seconds for yourself. Your body will thank you.',
      },
      es: {
        title: '🧘 Hora de resetear',
        message: 'Tómate 30 segundos para ti. Tu cuerpo te lo agradecerá.',
      },
    };

    const content = messages[locale] || messages.en;

    return this.sendNotification({
      userId,
      title: content.title,
      message: content.message,
      data: { type: 'daily_reminder', action: 'open_skane' },
      url: '/skane',
    });
  }

  /**
   * Envoyer une alerte streak
   */
  async sendStreakAlert(
    userId: string,
    streakDays: number,
    locale: string = 'fr'
  ): Promise<NotificationResponse> {
    const messages: Record<string, { title: string; message: string }> = {
      fr: {
        title: '🔥 Ne casse pas ta série !',
        message: `Tu as ${streakDays} jours consécutifs. Continue comme ça !`,
      },
      en: {
        title: "🔥 Don't break your streak!",
        message: `You have ${streakDays} consecutive days. Keep it up!`,
      },
    };

    const content = messages[locale] || messages.en;

    return this.sendNotification({
      userId,
      title: content.title,
      message: content.message,
      data: { type: 'streak_alert', streak_days: streakDays },
    });
  }

  /**
   * Envoyer une notification de milestone
   */
  async sendMilestoneNotification(
    userId: string,
    milestone: string,
    locale: string = 'fr'
  ): Promise<NotificationResponse> {
    const milestones: Record<string, Record<string, { title: string; message: string }>> = {
      first_skane: {
        fr: { title: '🎉 Premier Skane !', message: 'Tu as complété ton premier reset. Bienvenue !' },
        en: { title: '🎉 First Skane!', message: 'You completed your first reset. Welcome!' },
      },
      streak_7: {
        fr: { title: '🔥 7 jours de suite !', message: "Tu as créé une habitude. C'est le début !" },
        en: { title: '🔥 7 days in a row!', message: "You've built a habit. This is just the beginning!" },
      },
      streak_30: {
        fr: { title: '🏆 30 jours de suite !', message: 'Tu es un maître du reset. Félicitations !' },
        en: { title: '🏆 30 days in a row!', message: "You're a reset master. Congratulations!" },
      },
    };

    const content = milestones[milestone]?.[locale] || milestones[milestone]?.en;
    if (!content) {
      throw new Error(`Unknown milestone: ${milestone}`);
    }

    return this.sendNotification({
      userId,
      title: content.title,
      message: content.message,
      data: { type: 'milestone', milestone },
    });
  }

  // ============================================
  // PLAYER MANAGEMENT
  // ============================================

  /**
   * Récupérer les infos d'un player
   */
  async getPlayer(playerId: string): Promise<PlayerInfo> {
    return this.request<PlayerInfo>(`/players/${playerId}?app_id=${this.appId}`);
  }

  /**
   * Mettre à jour les tags d'un player
   */
  async updatePlayerTags(playerId: string, tags: Record<string, string | null>): Promise<void> {
    await this.request(`/players/${playerId}`, 'PUT', {
      app_id: this.appId,
      tags,
    });
  }

  /**
   * Lier un external_user_id à un player
   */
  async setExternalUserId(playerId: string, externalUserId: string): Promise<void> {
    await this.request(`/players/${playerId}`, 'PUT', {
      app_id: this.appId,
      external_user_id: externalUserId,
    });
  }

  /**
   * Supprimer un player (RGPD)
   */
  async deletePlayer(playerId: string): Promise<void> {
    await this.request(`/players/${playerId}?app_id=${this.appId}`, 'DELETE');
  }

  // ============================================
  // SEGMENTS
  // ============================================

  /**
   * Envoyer à un segment
   */
  async sendToSegment(
    segment: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<NotificationResponse> {
    return this.sendNotification({
      segment,
      title,
      message,
      data,
    });
  }

  /**
   * Envoyer à tous les utilisateurs actifs
   */
  async sendToAllActive(title: string, message: string, data?: Record<string, any>): Promise<NotificationResponse> {
    return this.sendToSegment('Active Users', title, message, data);
  }
}

// Export singleton
export const oneSignalService = new OneSignalService();

// ============================================
// HELPER: Sync user avec OneSignal
// ============================================

export async function syncUserWithOneSignal(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  playerId: string
): Promise<void> {
  try {
    // Lier external_user_id
    await oneSignalService.setExternalUserId(playerId, userId);

    // Récupérer les infos user pour les tags
    const { data: profile } = await supabase
      .from('user_profile')
      .select('plan, locale, timezone, current_streak_days:user_streaks(current_streak_days)')
      .eq('user_id', userId)
      .single();

    if (profile) {
      // Mettre à jour les tags
      await oneSignalService.updatePlayerTags(playerId, {
        plan: profile.plan,
        locale: profile.locale,
        timezone: profile.timezone,
        // streak_days: profile.current_streak_days?.toString() || '0',
      });
    }

    // Sauvegarder le player_id dans Supabase
    await supabase
      .from('user_profile')
      .update({
        onesignal_player_id: playerId,
        onesignal_external_user_id: userId,
      })
      .eq('user_id', userId);

    // Ajouter le device
    const playerInfo = await oneSignalService.getPlayer(playerId);
    await supabase.from('notification_devices').upsert(
      {
        user_id: userId,
        onesignal_player_id: playerId,
        device_type: playerInfo.device_type === 0 ? 'ios' : playerInfo.device_type === 1 ? 'android' : 'web',
        device_model: playerInfo.device_model,
        os_version: playerInfo.device_os,
        app_version: playerInfo.game_version,
        is_active: true,
        push_enabled: !playerInfo.invalid_identifier,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,onesignal_player_id' }
    );
  } catch (error) {
    console.error('Error syncing user with OneSignal:', error);
    throw error;
  }
}
