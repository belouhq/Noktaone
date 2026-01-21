"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Download, 
  Trash2, 
  ChevronRight, 
  AlertTriangle,
  Check,
  X,
  Loader2
} from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PrivacySettingsSectionProps {
  userId: string;
  currentConsents: {
    analytics: boolean;
    marketing: boolean;
  };
  onUpdateConsents: (consents: { analytics: boolean; marketing: boolean }) => Promise<void>;
  onExportData: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export default function PrivacySettingsSection({
  userId,
  currentConsents,
  onUpdateConsents,
  onExportData,
  onDeleteAccount,
}: PrivacySettingsSectionProps) {
  const { t } = useTranslation();
  
  const [consents, setConsents] = useState(currentConsents);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleAnalytics = async () => {
    const newConsents = { ...consents, analytics: !consents.analytics };
    setConsents(newConsents);
    setIsSaving(true);
    try {
      await onUpdateConsents(newConsents);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      // Revert on error
      setConsents(consents);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMarketing = async () => {
    const newConsents = { ...consents, marketing: !consents.marketing };
    setConsents(newConsents);
    setIsSaving(true);
    try {
      await onUpdateConsents(newConsents);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      setConsents(consents);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await onExportData();
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-2">
        <Shield size={18} className="text-blue-500" />
        <h3 className="text-sm uppercase text-gray-400 tracking-wider">
          {t("privacy.sectionTitle") || t("consent.settings.title")}
        </h3>
        {saveSuccess && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-green-400 ml-auto"
          >
            {t("privacy.saved") || "Saved"}
          </motion.span>
        )}
      </div>

      {/* Consent Toggles */}
      <div
        className="p-4 rounded-xl space-y-4"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Analytics Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">
              {t("privacy.analyticsTitle") || t("consent.settings.analytics")}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("privacy.analyticsDescription") || t("consent.settings.analyticsDescription")}
            </p>
          </div>
          <motion.button
            onClick={handleToggleAnalytics}
            disabled={isSaving}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              consents.analytics ? "bg-blue-500" : "bg-gray-600"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
              animate={{ x: consents.analytics ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {/* Marketing Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <p className="text-white font-medium text-sm">
              {t("privacy.marketingTitle") || t("consent.settings.marketing")}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("privacy.marketingDescription") || t("consent.settings.marketingDescription")}
            </p>
          </div>
          <motion.button
            onClick={handleToggleMarketing}
            disabled={isSaving}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              consents.marketing ? "bg-blue-500" : "bg-gray-600"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
              animate={{ x: consents.marketing ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </div>

      {/* Export Data Button */}
      <motion.button
        onClick={handleExportData}
        disabled={isExporting}
        className="w-full p-4 rounded-xl flex items-center justify-between transition-colors"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          {isExporting ? (
            <Loader2 size={20} className="text-blue-500 animate-spin" />
          ) : (
            <Download size={20} className="text-blue-500" />
          )}
          <div className="text-left">
            <p className="text-white font-medium text-sm">
              {t("privacy.exportTitle") || t("consent.settings.export")}
            </p>
            <p className="text-xs text-gray-400">
              {t("privacy.exportDescription") || "Download all your data"}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </motion.button>

      {/* Delete Account Button */}
      <motion.button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full p-4 rounded-xl flex items-center justify-between transition-colors"
        style={{
          background: "rgba(239, 68, 68, 0.05)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        }}
        whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <Trash2 size={20} className="text-red-400" />
          <div className="text-left">
            <p className="text-red-400 font-medium text-sm">
              {t("privacy.deleteTitle") || t("consent.settings.delete")}
            </p>
            <p className="text-xs text-gray-400">
              {t("privacy.deleteDescription") || t("consent.settings.deleteDescription")}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-red-400/50" />
      </motion.button>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              style={{ zIndex: 60 }}
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 61 }}
            >
              <div
                className="w-full max-w-[380px] p-6 rounded-2xl relative"
                style={{
                  background: "linear-gradient(145deg, rgba(30, 20, 20, 0.98), rgba(20, 15, 15, 0.99))",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.2)",
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
                >
                  <X size={18} className="text-gray-400" />
                </button>

                {/* Warning Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <AlertTriangle size={28} className="text-red-400" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white text-center mb-2">
                  {t("privacy.deleteConfirmTitle") || t("consent.settings.deleteWarning")}
                </h3>
                <p className="text-sm text-gray-400 text-center mb-4">
                  {t("privacy.deleteConfirmDescription") || t("consent.settings.deleteDescription")}
                </p>

                {/* Confirmation Input */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-400 mb-2">
                    {t("privacy.deleteConfirmLabel") || "Type DELETE to confirm"}
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                    placeholder="DELETE"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-red-500/30 focus:border-red-500 focus:outline-none text-white text-center font-mono tracking-widest"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-xl text-white font-medium"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("privacy.cancel") || t("common.cancel")}
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                    className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: deleteConfirmText === "DELETE" 
                        ? "linear-gradient(135deg, #EF4444, #DC2626)"
                        : "rgba(239, 68, 68, 0.3)",
                    }}
                    whileHover={deleteConfirmText === "DELETE" ? { scale: 1.02 } : {}}
                    whileTap={deleteConfirmText === "DELETE" ? { scale: 0.98 } : {}}
                  >
                    {isDeleting ? (
                      <Loader2 size={18} className="animate-spin mx-auto" />
                    ) : (
                      t("privacy.confirmDelete") || t("consent.settings.confirmDelete")
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
