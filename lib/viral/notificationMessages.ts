/**
 * Messages de notification contextuels — système viral NOKTA ONE
 */

import type { NotificationMessage } from "./types";

export const NOTIFICATION_MESSAGES: Record<
  string,
  Record<string, NotificationMessage[]>
> = {
  morning: {
    default: [
      { title: "Bonjour", body: "Ton système se prépare. Un check rapide ?" },
      { title: "Nouveau jour", body: "30 secondes pour bien démarrer." },
      { title: "Matin", body: "Calibre ton système avant la journée." },
    ],
    afterBadSleep: [
      {
        title: "Nuit courte détectée",
        body: "Un reset peut aider ton système à s'ajuster.",
      },
      {
        title: "Récupération",
        body: "Ton corps a besoin d'attention ce matin.",
      },
    ],
    streak: [{ title: "Jour {streak}", body: "Continue ta série. 30 secondes." }],
  },
  midday: {
    default: [
      { title: "Pause idéale", body: "Moment parfait pour un reset." },
      { title: "Mi-journée", body: "Ton système a accumulé. Libère." },
      { title: "Check rapide", body: "45 secondes avant de reprendre." },
    ],
    highStress: [
      { title: "Tension détectée", body: "Ton corps demande une pause." },
    ],
  },
  afternoon: {
    default: [
      {
        title: "Fin d'après-midi",
        body: "Transition vers le soir. Reset ?",
      },
      {
        title: "Avant la soirée",
        body: "Décharge la journée en 30 secondes.",
      },
    ],
  },
  evening: {
    default: [
      {
        title: "Dernier check",
        body: "Prépare ton système pour la nuit.",
      },
      { title: "Soir", body: "Relâche les tensions de la journée." },
      {
        title: "Avant de dormir",
        body: "Un reset pour mieux récupérer.",
      },
    ],
  },
  timeBased: {
    after8h: [
      { title: "8 heures", body: "Ton système a évolué. Un check ?" },
    ],
    after24h: [
      { title: "24 heures", body: "Ton corps attend un signal." },
    ],
    after48h: [
      {
        title: "2 jours",
        body: "Quand tu veux. Nokta est là.",
      },
    ],
  },
};

export function getRandomMessage(
  messages: NotificationMessage[]
): NotificationMessage {
  return messages[Math.floor(Math.random() * messages.length)]!;
}

export function getNotificationContext(
  hour: number,
  _lastSkaneHoursAgo: number,
  streak: number,
  sleepQuality: string | null
): NotificationMessage | null {
  let timeOfDay: "morning" | "midday" | "afternoon" | "evening";
  if (hour >= 6 && hour < 11) timeOfDay = "morning";
  else if (hour >= 11 && hour < 14) timeOfDay = "midday";
  else if (hour >= 14 && hour < 18) timeOfDay = "afternoon";
  else if (hour >= 18 && hour < 22) timeOfDay = "evening";
  else return null;

  const slot = NOTIFICATION_MESSAGES[timeOfDay] as Record<
    string,
    NotificationMessage[]
  >;
  if (!slot) return null;

  if (
    timeOfDay === "morning" &&
    sleepQuality === "bad" &&
    slot.afterBadSleep?.length
  ) {
    return getRandomMessage(slot.afterBadSleep);
  }

  if (streak >= 3 && slot.streak?.length) {
    const msg = getRandomMessage(slot.streak);
    return {
      title: msg.title.replace("{streak}", String(streak)),
      body: msg.body,
    };
  }

  return slot.default?.length ? getRandomMessage(slot.default) : null;
}
