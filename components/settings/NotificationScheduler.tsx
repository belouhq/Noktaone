"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { supabase } from "@/lib/supabase/client";

interface NotificationSchedulerProps {
  userId: string | null;
  notificationsEnabled: boolean;
}

interface ReminderTimes {
  morning: string; // Format HH:mm
  afternoon: string;
  evening: string;
}

const DEFAULT_TIMES: ReminderTimes = {
  morning: "08:00",
  afternoon: "13:00",
  evening: "20:00",
};

const STORAGE_KEY = "nokta_reminder_times";

export default function NotificationScheduler({
  userId,
  notificationsEnabled,
}: NotificationSchedulerProps) {
  const { t } = useTranslation();
  const [times, setTimes] = useState<ReminderTimes>(DEFAULT_TIMES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les horaires depuis localStorage et Supabase
  useEffect(() => {
    const loadTimes = async () => {
      setIsLoading(true);
      
      // 1. Essayer localStorage (accès rapide)
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTimes({
            morning: parsed.morning || DEFAULT_TIMES.morning,
            afternoon: parsed.afternoon || DEFAULT_TIMES.afternoon,
            evening: parsed.evening || DEFAULT_TIMES.evening,
          });
        } catch {
          // Ignore invalid JSON
        }
      }

      // 2. Si userId, charger depuis Supabase (source de vérité)
      if (userId) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("reminder_times")
            .eq("id", userId)
            .single();

          if (!error && data?.reminder_times) {
            const dbTimes = data.reminder_times as ReminderTimes;
            setTimes({
              morning: dbTimes.morning || DEFAULT_TIMES.morning,
              afternoon: dbTimes.afternoon || DEFAULT_TIMES.afternoon,
              evening: dbTimes.evening || DEFAULT_TIMES.evening,
            });
            // Synchroniser localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dbTimes));
          }
        } catch (error) {
          console.error("Error loading reminder times:", error);
        }
      }

      setIsLoading(false);
    };

    if (notificationsEnabled) {
      loadTimes();
    }
  }, [userId, notificationsEnabled]);

  // Sauvegarder les horaires
  const saveTimes = async (newTimes: ReminderTimes) => {
    setIsSaving(true);

    // 1. Sauvegarder dans localStorage (accès rapide)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTimes));

    // 2. Si userId, sauvegarder dans Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ reminder_times: newTimes })
          .eq("id", userId);

        if (error) {
          console.error("Error saving reminder times:", error);
        }
      } catch (error) {
        console.error("Error saving reminder times:", error);
      }
    }

    setIsSaving(false);
  };

  // Gérer le changement d'horaires
  const handleTimeChange = (period: keyof ReminderTimes, value: string) => {
    const newTimes = { ...times, [period]: value };
    setTimes(newTimes);
    saveTimes(newTimes);
  };

  // Ne pas afficher si les notifications sont désactivées
  if (!notificationsEnabled) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
        <div className="animate-pulse text-gray-400 text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-nokta-one-blue" />
        <h3 className="text-nokta-one-white font-medium text-sm">
          {t("settings.notificationSchedule") || "Horaires de rappel"}
        </h3>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-xs mb-4">
        {t("settings.scheduleDescription") || 
          "Les rappels t'aident à maintenir ton rythme de skane."}
      </p>

      {/* Time Pickers */}
      <div className="space-y-3">
        {/* Matin */}
        <div className="flex items-center justify-between">
          <label className="text-nokta-one-white text-sm">
            {t("settings.morningReminder") || "Matin"}
          </label>
          <input
            type="time"
            value={times.morning}
            onChange={(e) => handleTimeChange("morning", e.target.value)}
            disabled={isSaving}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-nokta-one-white text-sm focus:outline-none focus:border-nokta-one-blue transition-colors disabled:opacity-50"
          />
        </div>

        {/* Journée */}
        <div className="flex items-center justify-between">
          <label className="text-nokta-one-white text-sm">
            {t("settings.afternoonReminder") || "Journée"}
          </label>
          <input
            type="time"
            value={times.afternoon}
            onChange={(e) => handleTimeChange("afternoon", e.target.value)}
            disabled={isSaving}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-nokta-one-white text-sm focus:outline-none focus:border-nokta-one-blue transition-colors disabled:opacity-50"
          />
        </div>

        {/* Soir */}
        <div className="flex items-center justify-between">
          <label className="text-nokta-one-white text-sm">
            {t("settings.eveningReminder") || "Soir"}
          </label>
          <input
            type="time"
            value={times.evening}
            onChange={(e) => handleTimeChange("evening", e.target.value)}
            disabled={isSaving}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-nokta-one-white text-sm focus:outline-none focus:border-nokta-one-blue transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-400 text-xs mt-3 text-center"
        >
          {t("common.save") || "Enregistré"}
        </motion.p>
      )}
    </motion.div>
  );
}
