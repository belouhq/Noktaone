"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { ReminderSetupModalProps } from "@/lib/viral/types";

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SunriseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
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
}

function SunIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
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
}

function MoonIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

const slotConfig = [
  {
    key: "morning" as const,
    labelKey: "engagement.reminderMorning",
    descKey: "engagement.reminderMorningDesc",
    icon: SunriseIcon,
    color: "#FF9500",
  },
  {
    key: "midday" as const,
    labelKey: "engagement.reminderMidday",
    descKey: "engagement.reminderMiddayDesc",
    icon: SunIcon,
    color: "#FFCC00",
  },
  {
    key: "evening" as const,
    labelKey: "engagement.reminderEvening",
    descKey: "engagement.reminderEveningDesc",
    icon: MoonIcon,
    color: "#AF52DE",
  },
];

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  container: {
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "#1C1C1E",
    borderRadius: "20px 20px 0 0",
    padding: "24px 20px 40px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  closeButton: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    color: "#6E6E73",
    cursor: "pointer",
  },
  description: {
    fontSize: "15px",
    color: "#8E8E93",
    marginBottom: "24px",
    lineHeight: 1.4,
  },
  slotsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  slotCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: "12px",
    padding: "16px",
  },
  slotHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slotLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  slotIcon: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  slotInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  slotLabel: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#FFFFFF",
  },
  slotDescription: {
    fontSize: "13px",
    color: "#6E6E73",
  },
  toggle: {
    position: "relative" as const,
    width: "51px",
    height: "31px",
    flexShrink: 0,
    cursor: "pointer",
    display: "block",
  },
  timeInput: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#1C1C1E",
    border: "1px solid #3A3A3C",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "16px",
    fontFamily: "-apple-system, sans-serif",
  },
  info: {
    fontSize: "13px",
    color: "#6E6E73",
    marginTop: "20px",
    textAlign: "center",
  },
  saveButton: {
    width: "100%",
    padding: "16px",
    marginTop: "24px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    color: "#000000",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export function ReminderSetupModalViral({
  isOpen,
  onClose,
  onSave,
  initialTimes = { morning: "08:00", midday: "13:00", evening: "20:00" },
}: ReminderSetupModalProps) {
  const { t } = useTranslation();
  const [times, setTimes] = useState<
    Record<"morning" | "midday" | "evening", string>
  >({
    morning: initialTimes.morning ?? "08:00",
    midday: initialTimes.midday ?? "13:00",
    evening: initialTimes.evening ?? "20:00",
  });
  const [enabledSlots, setEnabledSlots] = useState({
    morning: true,
    midday: true,
    evening: true,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    const enabledTimes: Record<string, string> = {};
    (["morning", "midday", "evening"] as const).forEach((slot) => {
      if (enabledSlots[slot]) enabledTimes[slot] = times[slot];
    });
    onSave(enabledTimes);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>{t("engagement.reminderTitle")}</span>
          <button
            type="button"
            style={styles.closeButton}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <CloseIcon />
          </button>
        </div>

        <p style={styles.description}>{t("engagement.reminderDescription")}</p>

        <div style={styles.slotsContainer}>
          {slotConfig.map((slot) => {
            const Icon = slot.icon;
            return (
              <div key={slot.key} style={styles.slotCard}>
                <div style={styles.slotHeader}>
                  <div style={styles.slotLeft}>
                    <div
                      style={{
                        ...styles.slotIcon,
                        color: slot.color,
                      }}
                    >
                      <Icon />
                    </div>
                    <div style={styles.slotInfo}>
                      <span style={styles.slotLabel}>
                        {t(slot.labelKey)}
                      </span>
                      <span style={styles.slotDescription}>
                        {t(slot.descKey)}
                      </span>
                    </div>
                  </div>
                  <label style={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={enabledSlots[slot.key]}
                      onChange={(e) =>
                        setEnabledSlots({
                          ...enabledSlots,
                          [slot.key]: e.target.checked,
                        })
                      }
                      style={{
                        opacity: 0,
                        width: 0,
                        height: 0,
                        position: "absolute",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: "31px",
                        backgroundColor: enabledSlots[slot.key]
                          ? "#FFFFFF"
                          : "#3A3A3C",
                        transition: "background-color 0.2s",
                      }}
                    />
                  </label>
                </div>

                {enabledSlots[slot.key] && (
                  <input
                    type="time"
                    value={times[slot.key]}
                    onChange={(e) =>
                      setTimes({ ...times, [slot.key]: e.target.value })
                    }
                    style={styles.timeInput}
                  />
                )}
              </div>
            );
          })}
        </div>

        <p style={styles.info}>{t("engagement.reminderInfo")}</p>

        <button type="button" style={styles.saveButton} onClick={handleSave}>
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}
