/**
 * Stockage des sessions Nokta dans Supabase
 * Adapté pour Next.js : utilise supabaseAdmin, tables nokta_sessions / nokta_user_stats
 */

import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  NoktaSession,
  InternalScore,
  ActivationSignal,
  UserFeedback,
  MicroAction,
  DeviceInfo,
} from "./types";

interface NoktaSessionInsert {
  user_id: string;
  signal_before: ActivationSignal;
  signal_after: ActivationSignal;
  internal_score_before: InternalScore;
  internal_score_after: InternalScore;
  micro_action_id: string;
  micro_action_name: string;
  action_duration: number;
  feedback: UserFeedback;
  was_shared: boolean;
  device_info: DeviceInfo;
  action_completed_at: string;
  feedback_at: string;
  shared_at: string | null;
}

async function updateUserStats(userId: string, wasShared: boolean): Promise<void> {
  try {
    await supabaseAdmin.rpc("increment_user_session_count", {
      p_user_id: userId,
      p_was_shared: wasShared,
    });
  } catch (e) {
    console.warn("[Nokta] increment_user_session_count failed", e);
  }
}

export async function saveNoktaSession(
  session: Omit<NoktaSession, "id" | "createdAt">
): Promise<string | null> {
  try {
    const row: NoktaSessionInsert = {
      user_id: session.userId,
      signal_before: session.signalBefore,
      signal_after: session.signalAfter,
      internal_score_before: session.internalScoreBefore,
      internal_score_after: session.internalScoreAfter,
      micro_action_id: session.microAction.id,
      micro_action_name: session.microAction.name,
      action_duration: session.actionDuration,
      feedback: session.feedback,
      was_shared: session.wasShared,
      device_info: session.deviceInfo,
      action_completed_at: session.actionCompletedAt.toISOString(),
      feedback_at: session.feedbackAt.toISOString(),
      shared_at: session.sharedAt?.toISOString() ?? null,
    };

    const { data, error } = await (supabaseAdmin as any)
      .from("nokta_sessions")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error("[Nokta] saveSession error", error);
      return null;
    }

    await updateUserStats(session.userId, session.wasShared);
    return data?.id ?? null;
  } catch (e) {
    console.error("[Nokta] saveSession exception", e);
    return null;
  }
}

export async function markNoktaSessionShared(sessionId: string): Promise<boolean> {
  try {
    const { error } = await (supabaseAdmin as any)
      .from("nokta_sessions")
      .update({ was_shared: true, shared_at: new Date().toISOString() })
      .eq("id", sessionId);
    return !error;
  } catch {
    return false;
  }
}
