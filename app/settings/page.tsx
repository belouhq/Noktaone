"use client";

import { useState, useEffect } from "react";
import { Bell, Globe, Smartphone, Gift, Copy, UserPlus, HelpCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import i18n from "@/lib/i18n";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import ProfileCard from "@/components/settings/ProfileCard";
import SettingItem from "@/components/settings/SettingItem";
import LanguageModal from "@/components/modals/LanguageModal";
import ComingSoonModal from "@/components/modals/ComingSoonModal";
import InvitationsModal from "@/components/modals/InvitationsModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import { SupportModal } from "@/components/modals/SupportModal";

// Mock user data
const mockUser = {
  username: "nokta_one_user",
  email: "user@noktaone.app",
  referralCode: "@nokta_one_user-1234",
  firstName: "Benjamin",
  lastName: "Bel",
  dateOfBirth: "1993-01-15",
  gender: "Homme",
  phone: "+33612345678",
  address: "12 Rue de la République",
  postalCode: "75001",
  city: "Paris",
  country: "FR",
  language: "fr",
  occupation: "Entrepreneur",
  avatar: "",
};

export default function SettingsPage() {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [, forceUpdate] = useState(0);
  
  // Forcer le re-render quand la langue change
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invitationsCount] = useState(3); // Mock pour l'instant, plus tard : calculer depuis skanesLast24h
  const [userProfile, setUserProfile] = useState(mockUser);

  // Load from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notificationsEnabled");
    const savedLanguage = localStorage.getItem("language");
    const savedProfile = localStorage.getItem("userProfile");

    if (savedLanguage && currentLanguage !== savedLanguage) {
      // S'assurer que la langue est bien chargée dans i18n
      changeLanguage(savedLanguage);
    }

    if (savedNotifications !== null) {
      setNotificationsEnabled(savedNotifications === "true");
    }
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile((prev) => ({ ...prev, ...profile }));
      } catch (e) {
        console.error("Error parsing saved profile:", e);
      }
    }
  }, []);

  // Attacher les event listeners pour tous les boutons
  useEffect(() => {
    const attachListeners = () => {
      // Bouton Language
      const languageBtn = document.querySelector('[data-setting="language"]');
      if (languageBtn && !languageBtn.hasAttribute('data-listener-attached')) {
        languageBtn.setAttribute('data-listener-attached', 'true');
        languageBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLanguageModalOpen(true);
        });
      }

      // Bouton Connected Devices
      const devicesBtn = document.querySelector('[data-setting="devices"]');
      if (devicesBtn && !devicesBtn.hasAttribute('data-listener-attached')) {
        devicesBtn.setAttribute('data-listener-attached', 'true');
        devicesBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsComingSoonModalOpen(true);
        });
      }

      // Bouton Invitations
      const invitationsBtn = document.querySelector('[data-setting="invitations"]');
      if (invitationsBtn && !invitationsBtn.hasAttribute('data-listener-attached')) {
        invitationsBtn.setAttribute('data-listener-attached', 'true');
        invitationsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsInvitationsModalOpen(true);
        });
      }

      // Bouton Support
      const supportBtn = document.querySelector('[data-setting="support"]');
      if (supportBtn && !supportBtn.hasAttribute('data-listener-attached')) {
        supportBtn.setAttribute('data-listener-attached', 'true');
        supportBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsSupportModalOpen(true);
        });
      }

      // Bouton Log Out
      const logOutBtn = document.querySelector('[data-setting="logout"]');
      if (logOutBtn && !logOutBtn.hasAttribute('data-listener-attached')) {
        logOutBtn.setAttribute('data-listener-attached', 'true');
        logOutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleLogOut();
        });
      }

      // Bouton Copy Referral
      const copyBtn = document.querySelector('[data-setting="copy-referral"]');
      if (copyBtn && !copyBtn.hasAttribute('data-listener-attached')) {
        copyBtn.setAttribute('data-listener-attached', 'true');
        copyBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCopyReferral();
        });
      }

      // Toggle Notifications
      const notificationsToggle = document.querySelector('[data-setting="notifications-toggle"]');
      if (notificationsToggle && !notificationsToggle.hasAttribute('data-listener-attached')) {
        notificationsToggle.setAttribute('data-listener-attached', 'true');
        notificationsToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setNotificationsEnabled(!notificationsEnabled);
        });
      }

      // Bouton Edit Profile
      const editProfileBtn = document.querySelector('[data-profile="edit"]');
      if (editProfileBtn && !editProfileBtn.hasAttribute('data-listener-attached')) {
        editProfileBtn.setAttribute('data-listener-attached', 'true');
        editProfileBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditProfileModalOpen(true);
        });
      }
    };

    attachListeners();
    setTimeout(attachListeners, 100);
    setTimeout(attachListeners, 500);
  }, [notificationsEnabled]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem("notificationsEnabled", notificationsEnabled.toString());
  }, [notificationsEnabled]);

  const handleLanguageSelect = async (language: string) => {
    await changeLanguage(language);
    // Forcer un re-render immédiat
    forceUpdate(prev => prev + 1);
  };

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(mockUser.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleAvatarClick = () => {
    console.log("Upload photo");
  };

  const handleLogOut = () => {
    console.log("Logging out...");
  };

  return (
    <SafeAreaContainer currentPage="settings">
      <main className="relative min-h-screen-safe bg-nokta-one-black">
        <div className="px-4 pt-8 pb-8">
        {/* Header */}
        <h1 className="text-center text-2xl font-light text-nokta-one-white tracking-widest mb-8">
          {t("settings.profile")}
        </h1>

        {/* Profile Card */}
        <ProfileCard
          username={userProfile.username}
          email={userProfile.email}
          avatar={userProfile.avatar}
          onAvatarClick={handleAvatarClick}
          onEditClick={() => setIsEditProfileModalOpen(true)}
        />

        {/* Settings Title */}
        <h2 className="text-lg font-semibold text-nokta-one-white mt-8 mb-4">
          {t("settings.settingsSection")}
        </h2>

        {/* Settings List */}
        <div className="space-y-3">
          {/* Notifications */}
          <SettingItem
            icon={Bell}
            label={t("settings.notifications")}
            rightElement={
              <motion.button
                data-setting="notifications-toggle"
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? "bg-nokta-one-blue" : "bg-gray-600"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                  animate={{
                    x: notificationsEnabled ? 24 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            }
          />

          {/* Language */}
          <SettingItem
            icon={Globe}
            label={t("settings.language")}
            dataSetting="language"
            showChevron
          />

          {/* Connected Devices */}
          <SettingItem
            icon={Smartphone}
            label={t("settings.connectedDevices")}
            dataSetting="devices"
            showChevron
          />

          {/* Referral Code */}
          <SettingItem
            icon={Gift}
            label={t("settings.referralCode")}
            rightElement={
              <div className="flex items-center gap-2">
                <span className="text-sm text-nokta-one-white">
                  {mockUser.referralCode}
                </span>
                <motion.button
                  data-setting="copy-referral"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Copy
                    size={16}
                    className={copied ? "text-nokta-one-blue" : "text-nokta-one-white"}
                  />
                </motion.button>
              </div>
            }
          />

          {/* Invitations */}
          <SettingItem
            icon={UserPlus}
            label={t("settings.invitations")}
            dataSetting="invitations"
            showChevron
          />

          {/* Support */}
          <motion.button
            data-setting="support"
            className="w-full p-4 rounded-xl flex items-center justify-between transition-colors"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-nokta-one-white" />
              <span className="text-nokta-one-white">{t("support.contactUs")}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </motion.button>
        </div>

        {/* Log Out Button */}
        <motion.button
          data-setting="logout"
          className="w-full mt-10 py-4 rounded-xl text-nokta-one-white font-medium"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("settings.logOut")}
        </motion.button>
      </div>

      {/* Modals */}
        <LanguageModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
          selectedLanguage={currentLanguage}
          onSelectLanguage={handleLanguageSelect}
        />

      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
      />

      <InvitationsModal
        isOpen={isInvitationsModalOpen}
        onClose={() => setIsInvitationsModalOpen(false)}
        invitationsCount={invitationsCount}
        referralCode={mockUser.referralCode}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={(data) => {
          setUserProfile((prev) => ({ ...prev, ...data }));
          // Show toast notification
          console.log("Profil mis à jour !");
        }}
        initialData={userProfile}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        userEmail={userProfile.email}
        username={userProfile.username}
        userId={userProfile.username}
      />

      </main>
    </SafeAreaContainer>
  );
}
