"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import AffiliatePanel from "@/components/settings/AffiliatePanel";
import PartnershipAccessModal from "@/components/modals/PartnershipAccessModal";

interface PartnershipSectionProps {
  userId: string;
  locale?: string;
}

export default function PartnershipSection({
  userId,
  locale = "fr",
}: PartnershipSectionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Vérifier si l'accès a déjà été accordé dans cette session
  useEffect(() => {
    const accessGranted = sessionStorage.getItem("partnership_access_granted") === "true";
    setHasAccess(accessGranted);
  }, []);

  const handleExpand = () => {
    if (!hasAccess) {
      // Si pas d'accès, ouvrir le modal d'authentification
      setIsAccessModalOpen(true);
    } else {
      // Si accès déjà accordé, juste expand/collapse
      setIsExpanded(!isExpanded);
    }
  };

  const handleAccessSuccess = () => {
    setHasAccess(true);
    setIsExpanded(true);
    setIsAccessModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Menu Button - Expandable */}
      <motion.button
        onClick={handleExpand}
        className="glass-card w-full p-4 flex items-center justify-between"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <Users size={20} className="text-nokta-one-white" />
          <span className="text-white font-medium text-sm">
            {t("partnership.title") || "Gestion des partenariats"}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded && hasAccess ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Expanded Content - Affiliate Panel */}
      <AnimatePresence>
        {isExpanded && hasAccess && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              <AffiliatePanel userId={userId} locale={locale} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Modal */}
      <PartnershipAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onSuccess={handleAccessSuccess}
      />
    </div>
  );
}
