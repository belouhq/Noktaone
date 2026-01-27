"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotificationContext } from "./notificationMessages";
import type { UseNotificationSystemParams } from "./types";

export function useNotificationSystem({
  userId: _userId,
  lastSkaneTimestamp,
  streak = 0,
  sleepQuality = null,
  preferredTimes: _preferredTimes = {
    morning: "08:00",
    midday: "13:00",
    evening: "20:00",
  },
}: UseNotificationSystemParams) {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    }
    return false;
  }, []);

  const scheduleNotification = useCallback(
    (title: string, body: string, delay = 0) => {
      if (permission !== "granted") return;

      setTimeout(() => {
        new Notification(title, {
          body,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          tag: "nokta-reminder",
          renotify: true,
          vibrate: [100, 50, 100],
        });
      }, delay);
    },
    [permission]
  );

  const getContextualMessage = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const lastSkaneHoursAgo = lastSkaneTimestamp
      ? Math.floor(
          (now.getTime() - new Date(lastSkaneTimestamp).getTime()) /
            (1000 * 60 * 60)
        )
      : 999;

    return getNotificationContext(
      hour,
      lastSkaneHoursAgo,
      streak,
      sleepQuality
    );
  }, [lastSkaneTimestamp, streak, sleepQuality]);

  return {
    permission,
    requestPermission,
    scheduleNotification,
    getContextualMessage,
  };
}
