"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import EditProfileScreen, { type EditProfileFormData } from "@/components/profile/EditProfileScreen";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    language?: string;
    occupation?: string;
    avatar?: string;
  };
}

function genderCodeToLabel(
  code: string,
  t: (k: string) => string
): string {
  switch (code) {
    case "male":
      return t("profile.genderMale");
    case "female":
      return t("profile.genderFemale");
    case "other":
      return t("profile.genderOther");
    case "prefer_not":
      return t("profile.genderPreferNotToSay");
    default:
      return code;
  }
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditProfileModalProps) {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();

  const handleNav = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleSave = (data: EditProfileFormData & { dateOfBirth: string; language?: string }) => {
    const genderLabel = genderCodeToLabel(data.gender, t);
    const payload: Record<string, unknown> = {
      ...data,
      gender: genderLabel,
      language: initialData?.language ?? currentLanguage ?? "fr",
    };
    localStorage.setItem("userProfile", JSON.stringify(payload));
    onSave(payload);
    onClose();
  };

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
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-[430px] h-[90vh] sm:h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden bg-black flex flex-col min-h-0"
              style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.5)" }}
            >
              <EditProfileScreen
                initialData={initialData as Record<string, unknown>}
                onSave={handleSave}
                onCancel={onClose}
                onClose={onClose}
                showBottomNav
                embeddedInModal
                activeNav="settings"
                onHome={() => handleNav("/home")}
                onSkane={() => handleNav("/skane")}
                onSettings={() => handleNav("/settings")}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
