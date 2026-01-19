"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Activity } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface ConnectedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeviceStatus = "connected" | "disconnected" | "pwa_unavailable" | null;

/**
 * Bridge optionnel : si la PWA est embarquée dans l'app native (WebView),
 * le natif peut exposer window.__NOKTA_HEALTH__ avec getHealthKitStatus / getHealthConnectStatus.
 * En PWA pure (Vercel, navigateur), ce bridge n'existe pas → statut "pwa_unavailable".
 */
function useHealthBridge(isOpen: boolean) {
  const [healthKitStatus, setHealthKitStatus] = useState<DeviceStatus>(null);
  const [healthConnectStatus, setHealthConnectStatus] = useState<DeviceStatus>(null);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    const bridge = (window as unknown as { __NOKTA_HEALTH__?: { getHealthKitStatus?: () => string; getHealthConnectStatus?: () => string } }).__NOKTA_HEALTH__;
    if (bridge?.getHealthKitStatus) {
      const hk = bridge.getHealthKitStatus();
      setHealthKitStatus(hk === "authorized" || hk === "connected" ? "connected" : "disconnected");
    } else {
      setHealthKitStatus("pwa_unavailable");
    }
    if (bridge?.getHealthConnectStatus) {
      const hc = bridge.getHealthConnectStatus();
      setHealthConnectStatus(hc === "authorized" || hc === "connected" ? "connected" : "disconnected");
    } else {
      setHealthConnectStatus("pwa_unavailable");
    }
  }, [isOpen]);

  return { healthKitStatus, healthConnectStatus };
}

function StatusBadge({ status }: { status: DeviceStatus }) {
  const { t } = useTranslation();
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {t("devices.statusConnected")}
      </span>
    );
  }
  if (status === "disconnected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-white/10 text-white/70">
        {t("devices.statusDisconnected")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/10 text-white/60">
      {t("devices.statusPwaUnavailable")}
    </span>
  );
}

export default function ConnectedDevicesModal({ isOpen, onClose }: ConnectedDevicesModalProps) {
  const { t } = useTranslation();
  const { healthKitStatus, healthConnectStatus } = useHealthBridge(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-[400px] rounded-3xl p-6"
              style={{
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-nokta-one-white" />
              </button>

              <h2 className="text-lg font-semibold text-nokta-one-white mb-2">
                {t("devices.title")}
              </h2>
              <p className="text-sm text-white/60 mb-6">
                {t("devices.pwaNote")}
              </p>

              <div className="space-y-4">
                {/* Apple Health (HealthKit) */}
                <div
                  className="flex items-center justify-between gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Heart size={22} className="text-nokta-one-white flex-shrink-0" />
                    <div>
                      <div className="text-nokta-one-white font-medium">
                        {t("devices.appleHealth")}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">
                        {t("devices.hintIos")}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={healthKitStatus} />
                </div>

                {/* Health Connect */}
                <div
                  className="flex items-center justify-between gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Activity size={22} className="text-nokta-one-white flex-shrink-0" />
                    <div>
                      <div className="text-nokta-one-white font-medium">
                        {t("devices.healthConnect")}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">
                        {t("devices.hintAndroid")}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={healthConnectStatus} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
