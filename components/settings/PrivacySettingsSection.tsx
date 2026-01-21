"use client";

/**
 * PrivacySettingsSection - Gestion des consentements dans Settings
 * 
 * Permet de modifier les consentements et d'exporter/supprimer les données
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { exportUserData, deleteUserAccount } from "@/lib/hooks/useConsent";

interface PrivacySettingsSectionProps {
  userId: string;
  currentConsents: {
    analytics: boolean;
    marketing: boolean;
  };
  onUpdateConsents: (consents: { analytics: boolean; marketing: boolean }) => Promise<void>;
}

export default function PrivacySettingsSection({
  userId,
  currentConsents,
  onUpdateConsents,
}: PrivacySettingsSectionProps) {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(currentConsents.analytics);
  const [marketing, setMarketing] = useState(currentConsents.marketing);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportUserData(userId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nokta-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert(t("consent.settings.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount(userId);
      window.location.href = "/";
    } catch (error) {
      console.error("Delete error:", error);
      alert(t("consent.settings.deleteError"));
      setIsDeleting(false);
    }
  };

  const handleToggle = async (key: "analytics" | "marketing", value: boolean) => {
    if (key === "analytics") {
      setAnalytics(value);
    } else {
      setMarketing(value);
    }

    await onUpdateConsents({
      analytics: key === "analytics" ? value : analytics,
      marketing: key === "marketing" ? value : marketing,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">
        {t("consent.settings.title")}
      </h3>

      {/* Analytics Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-medium">
            {t("consent.settings.analytics")}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {t("consent.settings.analyticsDescription")}
          </p>
        </div>
        <button
          onClick={() => handleToggle("analytics", !analytics)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            analytics ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          <motion.div
            animate={{ x: analytics ? 24 : 0 }}
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
          />
        </button>
      </div>

      {/* Marketing Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-medium">
            {t("consent.settings.marketing")}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {t("consent.settings.marketingDescription")}
          </p>
        </div>
        <button
          onClick={() => handleToggle("marketing", !marketing)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            marketing ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          <motion.div
            animate={{ x: marketing ? 24 : 0 }}
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
          />
        </button>
      </div>

      <div className="border-t border-white/10 pt-6 space-y-4">
        {/* Export Data */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          {isExporting ? t("consent.settings.exporting") : t("consent.settings.export")}
        </button>

        {/* Delete Account */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={18} />
            {t("consent.settings.delete")}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="text-red-400 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-400 font-medium text-sm mb-2">
                  {t("consent.settings.deleteWarning")}
                </p>
                <p className="text-gray-400 text-xs">
                  {t("consent.settings.deleteDescription")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? t("consent.settings.deleting") : t("consent.settings.confirmDelete")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
