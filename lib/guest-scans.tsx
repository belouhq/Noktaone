'use client';

// NOKTA ONE - SYSTÈME DE SCANS INVITÉS

import React, { useState, useEffect, useCallback } from "react";

export interface GuestScanState {
  deviceId: string;
  scansUsed: number;
  maxScans: number;
  lastScanAt: string | null;
  isBlocked: boolean;
}

export interface UserSubscription {
  isPremium: boolean;
  planId: string | null;
  expiresAt: string | null;
}

export interface ScanPermission {
  canScan: boolean;
  reason: "allowed" | "premium" | "guest_limit_reached" | "error";
  scansRemaining: number | "unlimited";
  showPaywall: boolean;
}

const DEVICE_ID_KEY = "nokta_device_id";
const GUEST_SCANS_KEY = "nokta_guest_scans";
const MAX_GUEST_SCANS = 3;

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getDeviceId(): string {
  const ls = safeLocalStorage();
  if (!ls) return "device_anon";
  let deviceId = ls.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateDeviceFingerprint();
    ls.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

function generateDeviceFingerprint(): string {
  const components: string[] = [];
  if (typeof navigator !== "undefined") {
    components.push(navigator.userAgent || "");
    components.push(navigator.language || "");
    components.push((navigator as any).platform || "");
    components.push(String((navigator as any).hardwareConcurrency || 0));
    components.push(String((navigator as any).deviceMemory || 0));
    components.push(String((navigator as any).maxTouchPoints || 0));
  }
  if (typeof Intl !== "undefined") {
    components.push(
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    );
  }
  if (typeof screen !== "undefined") {
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  }
  const ls = safeLocalStorage();
  const nowStr = Date.now().toString();
  const firstVisit = (ls && ls.getItem("nokta_first_visit")) || nowStr;
  if (ls) ls.setItem("nokta_first_visit", firstVisit);
  components.push(firstVisit);
  const fingerprint = components.join("|");
  return (
    "device_" +
    Math.abs(hashString(fingerprint)).toString(16) +
    "_" +
    nowStr.toString(36)
  );
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export function getGuestScanState(): GuestScanState {
  const ls = safeLocalStorage();
  const deviceId = getDeviceId();
  if (ls) {
    const stored = ls.getItem(GUEST_SCANS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.deviceId === deviceId) {
          return {
            ...parsed,
            maxScans: MAX_GUEST_SCANS,
            isBlocked: parsed.scansUsed >= MAX_GUEST_SCANS,
          };
        }
      } catch (e) {
        console.error("Error parsing guest scan state:", e);
      }
    }
  }
  return {
    deviceId,
    scansUsed: 0,
    maxScans: MAX_GUEST_SCANS,
    lastScanAt: null,
    isBlocked: false,
  };
}

export function incrementGuestScan(): GuestScanState {
  const ls = safeLocalStorage();
  const state = getGuestScanState();
  const newState: GuestScanState = {
    ...state,
    scansUsed: state.scansUsed + 1,
    lastScanAt: new Date().toISOString(),
    isBlocked: state.scansUsed + 1 >= MAX_GUEST_SCANS,
  };
  if (ls) ls.setItem(GUEST_SCANS_KEY, JSON.stringify(newState));
  return newState;
}

export function resetGuestScans(): void {
  const ls = safeLocalStorage();
  if (ls) ls.removeItem(GUEST_SCANS_KEY);
}

export function checkScanPermission(
  user: { id: string } | null,
  subscription: UserSubscription | null
): ScanPermission {
  if (user && subscription?.isPremium) {
    return {
      canScan: true,
      reason: "premium",
      scansRemaining: "unlimited",
      showPaywall: false,
    };
  }
  const guestState = getGuestScanState();
  if (guestState.isBlocked) {
    return {
      canScan: false,
      reason: "guest_limit_reached",
      scansRemaining: 0,
      showPaywall: true,
    };
  }
  return {
    canScan: true,
    reason: "allowed",
    scansRemaining: MAX_GUEST_SCANS - guestState.scansUsed,
    showPaywall: false,
  };
}

export function useGuestScans(
  user: { id: string } | null,
  subscription: UserSubscription | null
) {
  const [guestState, setGuestState] = useState<GuestScanState | null>(null);
  const [permission, setPermission] = useState<ScanPermission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const state = getGuestScanState();
    setGuestState(state);
    setPermission(checkScanPermission(user, subscription));
    setLoading(false);
  }, [user, subscription]);

  const useScan = useCallback((): ScanPermission => {
    if (subscription?.isPremium) {
      const perm: ScanPermission = {
        canScan: true,
        reason: "premium",
        scansRemaining: "unlimited",
        showPaywall: false,
      };
      setPermission(perm);
      return perm;
    }
    const newState = incrementGuestScan();
    setGuestState(newState);
    const newPerm = checkScanPermission(user, subscription);
    setPermission(newPerm);
    return newPerm;
  }, [user, subscription]);

  const canScan = useCallback((): boolean => {
    return permission?.canScan ?? false;
  }, [permission]);

  return {
    guestState,
    permission,
    loading,
    useScan,
    canScan,
    scansRemaining: permission?.scansRemaining ?? 0,
    isPremium: subscription?.isPremium ?? false,
    showPaywall: permission?.showPaywall ?? false,
  };
}

export async function syncGuestScansWithServer(
  userId: string | null
): Promise<void> {
  if (!userId) return;
  const deviceId = getDeviceId();
  const guestState = getGuestScanState();
  try {
    await fetch("/api/guest-scans/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        deviceId,
        scansUsed: guestState.scansUsed,
      }),
    });
  } catch (error) {
    console.error("Error syncing guest scans:", error);
  }
}

interface GuestPaywallProps {
  scansUsed: number;
  maxScans: number;
  onSubscribe: () => void;
  onClose: () => void;
}

export function GuestPaywall({
  scansUsed,
  maxScans,
  onSubscribe,
  onClose,
}: GuestPaywallProps) {
  return (
    <div style={paywallStyles.overlay}>
      <div style={paywallStyles.modal}>
        <div style={paywallStyles.header}>
          <div style={paywallStyles.iconContainer}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0A84FF"
              strokeWidth="1.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h2 style={paywallStyles.title}>Tes 3 scans gratuits sont utilisés</h2>
          <p style={paywallStyles.subtitle}>
            Tu as découvert ton Skane Index. Maintenant, suis ta progression.
          </p>
        </div>
        <div style={paywallStyles.progressContainer}>
          <div style={paywallStyles.progressBar}>
            <div
              style={{
                ...paywallStyles.progressFill,
                width: `${(scansUsed / maxScans) * 100}%`,
              }}
            />
          </div>
          <p style={paywallStyles.progressText}>
            {scansUsed}/{maxScans} scans utilisés
          </p>
        </div>
        <div style={paywallStyles.benefits}>
          <div style={paywallStyles.benefit}>
            <span style={paywallStyles.benefitIcon}>∞</span>
            <span>Scans illimités</span>
          </div>
          <div style={paywallStyles.benefit}>
            <span style={paywallStyles.benefitIcon}>📊</span>
            <span>Historique complet</span>
          </div>
          <div style={paywallStyles.benefit}>
            <span style={paywallStyles.benefitIcon}>🧘</span>
            <span>Toutes les micro-actions</span>
          </div>
          <div style={paywallStyles.benefit}>
            <span style={paywallStyles.benefitIcon}>👥</span>
            <span>Mode invité illimité</span>
          </div>
        </div>
        <button style={paywallStyles.ctaButton} onClick={onSubscribe}>
          Passer Premium · 18,99€/mois
        </button>
        <button style={paywallStyles.secondaryButton} onClick={onClose}>
          Plus tard
        </button>
        <p style={paywallStyles.footer}>
          Annulable à tout moment · Sans engagement
        </p>
      </div>
    </div>
  );
}

const paywallStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "24px",
  },
  modal: {
    width: "100%",
    maxWidth: "380px",
    backgroundColor: "#1C1C1E",
    borderRadius: "24px",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
  },
  iconContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "40px",
    backgroundColor: "rgba(10, 132, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#FFFFFF",
    margin: "0 0 8px 0",
    lineHeight: "1.3",
  },
  subtitle: {
    fontSize: "15px",
    color: "#8E8E93",
    margin: 0,
    lineHeight: "1.4",
  },
  progressContainer: {
    width: "100%",
    marginBottom: "24px",
  },
  progressBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF9500",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "13px",
    color: "#8E8E93",
    margin: "8px 0 0 0",
  },
  benefits: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  benefit: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    fontSize: "15px",
    color: "#FFFFFF",
  },
  benefitIcon: {
    fontSize: "20px",
    width: "28px",
    textAlign: "center",
  },
  ctaButton: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#0A84FF",
    border: "none",
    borderRadius: "14px",
    color: "#FFFFFF",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "12px",
  },
  secondaryButton: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    border: "none",
    color: "#8E8E93",
    fontSize: "15px",
    cursor: "pointer",
  },
  footer: {
    fontSize: "12px",
    color: "#636366",
    margin: "16px 0 0 0",
  },
};

interface ScansRemainingBadgeProps {
  scansRemaining: number | "unlimited";
  isPremium: boolean;
}

export function ScansRemainingBadge({
  scansRemaining,
  isPremium,
}: ScansRemainingBadgeProps) {
  if (isPremium) {
    return (
      <div style={badgeStyles.premium}>
        <span style={badgeStyles.premiumIcon}>⭐</span>
        <span>Premium</span>
      </div>
    );
  }

  const isLow = typeof scansRemaining === "number" && scansRemaining <= 1;

  return (
    <div
      style={{
        ...badgeStyles.guest,
        backgroundColor: isLow
          ? "rgba(255, 69, 58, 0.15)"
          : "rgba(255, 255, 255, 0.1)",
        color: isLow ? "#FF453A" : "#FFFFFF",
      }}
    >
      <span>
        {scansRemaining} scan
        {scansRemaining !== 1 ? "s" : ""} restant
        {scansRemaining !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

const badgeStyles: { [key: string]: React.CSSProperties } = {
  premium: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "rgba(10, 132, 255, 0.15)",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#0A84FF",
  },
  premiumIcon: {
    fontSize: "14px",
  },
  guest: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 500,
  },
};

