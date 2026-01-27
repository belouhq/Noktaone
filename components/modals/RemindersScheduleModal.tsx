"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// MODAL HORAIRES DES RAPPELS - NOKTA ONE
// Style Tesla épuré
// ============================================

export interface ReminderSchedule {
  morning: string;
  noon: string;
  evening: string;
}

const DEFAULT_SCHEDULE: ReminderSchedule = {
  morning: "08:00",
  noon: "13:00",
  evening: "20:00",
};

const SunriseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" strokeWidth="1.5">
    <path d="M17 18a5 5 0 00-10 0" />
    <line x1="12" y1="2" x2="12" y2="9" />
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
    <line x1="1" y1="18" x2="3" y2="18" />
    <line x1="21" y1="18" x2="23" y2="18" />
    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
    <line x1="23" y1="22" x2="1" y2="22" />
    <polyline points="8,6 12,2 16,6" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="1.5">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" strokeWidth="1.5">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const SLOT_KEYS = [
  { id: "morning" as const, labelKey: "settings.reminderMorning", Icon: SunriseIcon },
  { id: "noon" as const, labelKey: "settings.reminderNoon", Icon: SunIcon },
  { id: "evening" as const, labelKey: "settings.reminderEvening", Icon: MoonIcon },
] as const;

interface RemindersScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (schedule: ReminderSchedule) => void;
  initialSchedule?: ReminderSchedule;
}

export default function RemindersScheduleModal({
  isOpen,
  onClose,
  onSave = () => {},
  initialSchedule = DEFAULT_SCHEDULE,
}: RemindersScheduleModalProps) {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState<ReminderSchedule>(initialSchedule);

  const handleTimeChange = (slotId: keyof ReminderSchedule, time: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setSchedule((prev) => ({ ...prev, [slotId]: time }));
  };

  const handleSave = () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    onSave(schedule);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>{t("settings.remindersScheduleTitle")}</h2>
          <button
            type="button"
            style={styles.closeButton}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={styles.description}>
          <p style={styles.descriptionText}>
            {t("settings.remindersScheduleDescription")}
          </p>
        </div>

        <div style={styles.scheduleList}>
          {SLOT_KEYS.map(({ id, labelKey, Icon }) => (
            <div key={id} style={styles.scheduleItem}>
              <div style={styles.scheduleLeft}>
                <div style={styles.scheduleIcon}>
                  <Icon />
                </div>
                <span style={styles.scheduleLabel}>{t(labelKey)}</span>
              </div>
              <div style={styles.timeInputWrapper}>
                <input
                  type="time"
                  value={schedule[id]}
                  onChange={(e) => handleTimeChange(id, e.target.value)}
                  style={styles.timeInput}
                  aria-label={t(labelKey)}
                />
                <ClockIcon />
              </div>
            </div>
          ))}
        </div>

        <div style={styles.infoSection}>
          <InfoIcon />
          <span style={styles.infoText}>{t("settings.remindersScheduleInfo")}</span>
        </div>

        <div style={styles.footer}>
          <button type="button" style={styles.saveButton} onClick={handleSave}>
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6E6E73"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6E6E73"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6E6E73"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#1C1C1E",
    borderRadius: "20px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    borderBottom: "1px solid #2C2C2E",
  },
  headerTitle: {
    fontSize: "17px",
    fontWeight: 600,
    color: "#FFFFFF",
    margin: 0,
  },
  closeButton: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
  },
  description: {
    padding: "16px 20px 8px",
  },
  descriptionText: {
    fontSize: "14px",
    color: "#8E8E93",
    lineHeight: 1.5,
    margin: 0,
  },
  scheduleList: {
    padding: "8px 20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  scheduleItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    backgroundColor: "#2C2C2E",
    borderRadius: "14px",
  },
  scheduleLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  scheduleIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#3C3C3E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleLabel: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#FFFFFF",
  },
  timeInputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "#3C3C3E",
    borderRadius: "10px",
  },
  timeInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "17px",
    fontWeight: 600,
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    width: "60px",
    textAlign: "center",
  },
  infoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 20px 16px",
  },
  infoText: {
    fontSize: "13px",
    color: "#6E6E73",
  },
  footer: {
    padding: "16px 20px 24px",
    borderTop: "1px solid #2C2C2E",
  },
  saveButton: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
