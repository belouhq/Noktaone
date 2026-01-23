/**
 * API Route: Send Daily SMS Reminders
 * 
 * GET /api/cron/send-reminders
 * 
 * À appeler via Vercel Cron ou service externe
 * Envoie les rappels de reset aux utilisateurs consentants
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vérifier que c'est bien le cron qui appelle
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;
  return authHeader === expectedSecret;
}

// Messages de rappel variés (évite la lassitude)
const REMINDER_MESSAGES = {
  morning: [
    "Bonjour ! Un reset de 30 secondes pour bien démarrer ? → nokta.app",
    "Nouvelle journée, nouveau reset. Scannez votre état → nokta.app",
    "30 secondes pour être au top ce matin → nokta.app",
  ],
  afternoon: [
    "Pause reset ? 30 sec pour recharger → nokta.app",
    "Mi-journée = moment idéal pour un reset rapide → nokta.app",
    "Besoin d'un coup de boost ? Skane rapide → nokta.app",
  ],
  evening: [
    "Reset du soir pour bien terminer → nokta.app",
    "30 secondes pour décompresser avant la soirée → nokta.app",
    "Un dernier reset pour clôturer en beauté → nokta.app",
  ],
};

// Déterminer le moment de la journée selon le timezone
function getTimeOfDay(timezone: string): "morning" | "afternoon" | "evening" {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(now), 10);

  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

// Obtenir le timezone approximatif depuis le pays
function getTimezoneFromCountry(country: string): string {
  const timezoneMap: Record<string, string> = {
    FR: "Europe/Paris",
    US: "America/New_York",
    GB: "Europe/London",
    DE: "Europe/Berlin",
    ES: "Europe/Madrid",
    IT: "Europe/Rome",
    BE: "Europe/Brussels",
    CH: "Europe/Zurich",
    CA: "America/Toronto",
    MA: "Africa/Casablanca",
    SN: "Africa/Dakar",
    CI: "Africa/Abidjan",
    MG: "Indian/Antananarivo",
    BR: "America/Sao_Paulo",
    MX: "America/Mexico_City",
    JP: "Asia/Tokyo",
    KR: "Asia/Seoul",
    IN: "Asia/Kolkata",
    AE: "Asia/Dubai",
  };
  return timezoneMap[country] || "UTC";
}

// Sélectionner un message aléatoire
function getRandomMessage(timeOfDay: "morning" | "afternoon" | "evening"): string {
  const messages = REMINDER_MESSAGES[timeOfDay];
  return messages[Math.floor(Math.random() * messages.length)];
}

export async function GET(request: NextRequest) {
  // Vérifier l'authentification cron
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const stats = {
    total: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    unsubscribed: 0,
  };

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Récupérer les utilisateurs éligibles
    // - sms_consent = true
    // - sms_frequency != 'none'
    // - pas de SMS envoyé dans les dernières 12h (pour daily)
    // - téléphone non dans la liste des désabonnés
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    const { data: users, error: fetchError } = await supabase
      .from("user_profiles")
      .select("user_id, phone, country, sms_frequency, last_sms_sent_at")
      .eq("sms_consent", true)
      .neq("sms_frequency", "none")
      .not("phone", "is", null)
      .or(`last_sms_sent_at.is.null,last_sms_sent_at.lt.${twelveHoursAgo}`);

    if (fetchError) {
      throw fetchError;
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to notify",
        stats,
        duration: Date.now() - startTime,
      });
    }

    // Récupérer la liste des désabonnés
    const { data: unsubscribed } = await supabase
      .from("sms_unsubscribes")
      .select("phone");

    const unsubscribedPhones = new Set(unsubscribed?.map(u => u.phone) || []);

    stats.total = users.length;

    // Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Twilio credentials not configured");
    }

    // Envoyer les SMS (en batch, avec délai pour éviter rate limits)
    for (const user of users) {
      // Vérifier si désabonné
      if (unsubscribedPhones.has(user.phone)) {
        stats.unsubscribed++;
        continue;
      }

      try {
        // Déterminer le message selon le timezone
        const timezone = getTimezoneFromCountry(user.country || "FR");
        const timeOfDay = getTimeOfDay(timezone);
        const message = getRandomMessage(timeOfDay);

        // Envoyer via Twilio
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            },
            body: new URLSearchParams({
              To: user.phone,
              From: fromNumber,
              Body: message,
            }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          stats.sent++;

          // Mettre à jour last_sms_sent_at
          await supabase
            .from("user_profiles")
            .update({ last_sms_sent_at: new Date().toISOString() })
            .eq("user_id", user.user_id);

          // Log
          await supabase.from("sms_logs").insert({
            user_id: user.user_id,
            phone: user.phone,
            message_type: "reminder",
            message_id: result.sid,
            status: "sent",
            sent_at: new Date().toISOString(),
          });
        } else {
          stats.failed++;
          console.error(`SMS failed for ${user.phone}:`, result.message);

          // Log l'erreur
          await supabase.from("sms_logs").insert({
            user_id: user.user_id,
            phone: user.phone,
            message_type: "reminder",
            status: "failed",
            error_message: result.message,
            sent_at: new Date().toISOString(),
          });
        }

        // Délai entre les envois (évite le rate limiting Twilio)
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err: any) {
        stats.failed++;
        console.error(`Error sending to ${user.phone}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;

    console.log(`[Cron] Reminders sent:`, stats);

    return NextResponse.json({
      success: true,
      stats,
      duration,
    });

  } catch (error: any) {
    console.error("[Cron Error]", error);
    return NextResponse.json(
      { 
        error: error.message,
        stats,
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
