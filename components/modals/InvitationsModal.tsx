"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// MODAL INVITATIONS - NOKTA ONE
// Style Tesla épuré
// ============================================

interface InvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationsCount: number;
  referralCode: string;
  onCopyLink?: () => void;
}

export default function InvitationsModal({
  isOpen,
  onClose,
  invitationsCount,
  referralCode,
  onCopyLink = () => {},
}: InvitationsModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://noktaone.app/invite?code=${referralCode}`;

  const handleCopyLink = async () => {
    if (navigator.vibrate) navigator.vibrate(10);
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      onCopyLink();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.vibrate) navigator.vibrate(10);
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("invitationsModal.shareTitle"),
          text: t("invitationsModal.shareText"),
          url: inviteLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  const counterLabel = t("invitationsModal.counterLabel", { count: invitationsCount });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <ShareIcon />
            <span style={styles.headerTitle}>{t("invitationsModal.title")}</span>
          </div>
          <button
            type="button"
            style={styles.closeButton}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.counterSection}>
            <div style={styles.counterNumber}>{invitationsCount}</div>
            <div style={styles.counterLabel}>{counterLabel}</div>
          </div>

          <p style={styles.description}>{t("invitationsModal.description")}</p>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={handleShare}
              disabled={invitationsCount === 0}
            >
              <ShareArrowIcon />
              <span>{t("invitationsModal.shareInvitation")}</span>
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handleCopyLink}
              disabled={invitationsCount === 0}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span>
                {copied
                  ? t("invitationsModal.linkCopied")
                  : t("invitationsModal.copyLink")}
              </span>
            </button>
          </div>

          <div style={styles.bonusInfo}>
            <GiftIcon />
            <span style={styles.bonusText}>
              {t("invitationsModal.earnPerFriend")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ShareIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFFFFF"
    strokeWidth="1.5"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

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

const ShareArrowIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    <polyline points="16,6 12,2 8,6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const CopyIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#30D158"
    strokeWidth="2"
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const GiftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6E6E73"
    strokeWidth="1.5"
  >
    <rect x="3" y="8" width="18" height="14" rx="2" />
    <path d="M12 8v14" />
    <path d="M3 12h18" />
    <path d="M12 8c-2-2-5-2.5-5 0s3 2.5 5 0" />
    <path d="M12 8c2-2 5-2.5 5 0s-3 2.5-5 0" />
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
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerTitle: {
    fontSize: "17px",
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
    cursor: "pointer",
    borderRadius: "50%",
    transition: "background-color 0.2s ease",
  },
  content: {
    padding: "24px 20px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  counterSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  counterNumber: {
    fontSize: "56px",
    fontWeight: 700,
    color: "#FFFFFF",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  counterLabel: {
    fontSize: "15px",
    color: "#8E8E93",
    fontWeight: 500,
  },
  description: {
    fontSize: "15px",
    color: "#6E6E73",
    textAlign: "center",
    lineHeight: 1.5,
    margin: 0,
    maxWidth: "280px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
  },
  primaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "16px",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  secondaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "14px",
    backgroundColor: "transparent",
    color: "#FFFFFF",
    border: "1px solid #3C3C3E",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  bonusInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    backgroundColor: "#2C2C2E",
    borderRadius: "12px",
    width: "100%",
  },
  bonusText: {
    fontSize: "13px",
    color: "#8E8E93",
    lineHeight: 1.4,
  },
};
