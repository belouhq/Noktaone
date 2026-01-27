"use client";

import React from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// MODAL APPAREILS CONNECTÉS - NOKTA ONE
// Style Tesla épuré
// ============================================

interface ConnectedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppleHealthIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="#FF2D55"
    />
  </svg>
);

const HealthConnectIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M16 6l2.29 2.29-4.88 4.88-4-4L3 15.59 4.41 17l6-6 4 4 6.3-6.29L23 11V6h-5z"
      fill="#4285F4"
    />
    <path d="M3 18h18v2H3v-2z" fill="#4285F4" />
  </svg>
);

const DEVICE_KEYS = [
  { id: "apple-health", nameKey: "devices.appleHealth", descKey: "devices.appleHealthDescription", Icon: AppleHealthIcon },
  { id: "health-connect", nameKey: "devices.healthConnect", descKey: "devices.healthConnectDescription", Icon: HealthConnectIcon },
] as const;

export default function ConnectedDevicesModal({ isOpen, onClose }: ConnectedDevicesModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>{t("devices.title")}</h2>
          <button
            type="button"
            style={styles.closeButton}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={styles.notice}>
          <InfoIcon />
          <p style={styles.noticeText}>{t("devices.pwaNote")}</p>
        </div>

        <div style={styles.devicesList}>
          {DEVICE_KEYS.map(({ id, nameKey, descKey, Icon }) => (
            <div key={id} style={styles.deviceCard}>
              <div style={styles.deviceLeft}>
                <div style={styles.deviceIcon}>
                  <Icon />
                </div>
                <div style={styles.deviceInfo}>
                  <span style={styles.deviceName}>{t(nameKey)}</span>
                  <span style={styles.deviceDescription}>{t(descKey)}</span>
                </div>
              </div>
              <div style={styles.deviceStatus}>
                <span style={styles.statusBadge}>{t("devices.comingSoon")}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>{t("devices.footerMoreIntegrations")}</span>
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

const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#8E8E93"
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
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#2C2C2E",
    margin: "16px 20px",
    borderRadius: "12px",
  },
  noticeText: {
    fontSize: "14px",
    color: "#8E8E93",
    lineHeight: 1.5,
    margin: 0,
  },
  devicesList: {
    padding: "0 20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  deviceCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    backgroundColor: "#2C2C2E",
    borderRadius: "14px",
    gap: "16px",
  },
  deviceLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
  },
  deviceIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#3C3C3E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  deviceName: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  deviceDescription: {
    fontSize: "13px",
    color: "#6E6E73",
  },
  deviceStatus: {
    flexShrink: 0,
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#8E8E93",
    padding: "6px 12px",
    backgroundColor: "#3C3C3E",
    borderRadius: "8px",
  },
  footer: {
    padding: "20px",
    borderTop: "1px solid #2C2C2E",
    marginTop: "16px",
  },
  footerText: {
    fontSize: "13px",
    color: "#6E6E73",
    textAlign: "center",
    display: "block",
  },
};
