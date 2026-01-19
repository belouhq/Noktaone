"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Globe, Smartphone, Gift, Copy, UserPlus, HelpCircle, ChevronRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useSwipe } from "@/lib/hooks/useSwipe";
import i18n from "@/lib/i18n";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import ProfileCard from "@/components/settings/ProfileCard";
import SettingItem from "@/components/settings/SettingItem";
import LanguageModal from "@/components/modals/LanguageModal";
import { LANGUAGES } from "@/lib/i18n/languages";
import ComingSoonModal from "@/components/modals/ComingSoonModal";
import ConnectedDevicesModal from "@/components/modals/ConnectedDevicesModal";
import InvitationsModal from "@/components/modals/InvitationsModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import { SupportModal } from "@/components/modals/SupportModal";
import AffiliatePanel from "@/components/settings/AffiliatePanel";

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
  const router = useRouter();
  const { t, changeLanguage, currentLanguage, isClient } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [, forceUpdate] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  
  // Éviter les erreurs d'hydratation en chargeant uniquement côté client
  useEffect(() => {
    // Attendre que le client soit prêt ET que i18n soit synchronisé
    if (isClient) {
      // Utiliser requestAnimationFrame pour s'assurer que l'hydratation est complète
      requestAnimationFrame(() => {
        setMounted(true);
      });
    }
  }, [isClient]);
  
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
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invitationsCount] = useState(3); // Mock pour l'instant, plus tard : calculer depuis skanesLast24h
  const [userProfile, setUserProfile] = useState({
    ...mockUser,
    language: currentLanguage || "fr", // Synchroniser avec i18n
  });
  const [userId, setUserId] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notificationsEnabled");
    const savedLanguage = localStorage.getItem("language");
    const savedProfile = localStorage.getItem("userProfile");
    const savedUser = localStorage.getItem("user");

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
    
    // Récupérer le userId depuis localStorage ou utiliser username comme fallback
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Utiliser user_id si disponible, sinon username, sinon email
        setUserId(user.user_id || user.id || user.username || user.email || mockUser.username);
      } catch (e) {
        console.error("Error parsing saved user:", e);
        setUserId(mockUser.username);
      }
    } else {
      setUserId(mockUser.username);
    }
  }, []);

  // Attacher les event listeners pour tous les boutons
  useEffect(() => {
    const attachListeners = () => {
      // Language est maintenant géré directement par le select React, pas besoin d'event listener

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

      // Toggle Notifications - maintenant géré directement par onClick React, pas besoin d'addEventListener

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

  const handleLanguageSelect = async (newLang: string) => {
    if (newLang === currentLanguage || isChangingLanguage) return;
    
    // Sauvegarder dans localStorage et recharger
    // Le I18nProvider va automatiquement charger la nouvelle langue depuis localStorage au rechargement
    localStorage.setItem('language', newLang);
    window.location.reload();
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

  // Swipe gestures pour naviguer entre les pages
  const swipeRef = useSwipe({
    onSwipeLeft: () => {
      // Swipe vers la gauche = aller vers Home
      router.push("/");
    },
    onSwipeRight: () => {
      // Swipe vers la droite = aller vers Skane
      router.push("/skane");
    },
    threshold: 50,
    velocityThreshold: 0.3,
  });

  // Forcer le re-render complet quand la langue change
  if (!mounted) {
    return (
      <SafeAreaContainer currentPage="settings">
        <main className="relative min-h-screen-safe bg-nokta-one-black">
          <div className="px-4 pt-8 pb-8">
            <div className="animate-pulse text-white text-center">Loading...</div>
          </div>
        </main>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer currentPage="settings" key={`settings-${currentLanguage}-${Date.now()}`}>
      <main 
        ref={swipeRef}
        className="relative min-h-screen-safe bg-nokta-one-black"
      >
        <div className="px-4 pt-8 pb-8">
        {/* Header */}
        <h1 
          className="text-center text-2xl font-light text-nokta-one-white tracking-widest mb-8"
          suppressHydrationWarning
        >
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
        <h2 
          className="text-lg font-semibold text-nokta-one-white mt-8 mb-4"
          suppressHydrationWarning
        >
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNotificationsEnabled(!notificationsEnabled);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? "bg-nokta-one-blue" : "bg-gray-600"
                }`}
                whileTap={{ scale: 0.95 }}
                style={{ pointerEvents: "auto", zIndex: 10 }}
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
          <div 
            className="w-full p-4 rounded-xl flex items-center justify-between"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-nokta-one-white" />
              <span className="text-nokta-one-white" suppressHydrationWarning>
                {t("settings.language")}
              </span>
            </div>
            <div className="relative flex-shrink-0" style={{ zIndex: 100 }}>
              {mounted ? (
                <>
                  <select
                    value={currentLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      handleLanguageSelect(newLang).catch(console.error);
                    }}
                    disabled={isChangingLanguage}
                    className="p-2 pr-10 rounded-lg text-nokta-one-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-nokta-one-blue bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      fontSize: "16px",
                      border: "none",
                      position: "relative",
                      zIndex: 100,
                    }}
                  >
                    {LANGUAGES.map((lang) => {
                      const isSelected = lang.code === currentLanguage;
                      return (
                        <option
                          key={lang.code}
                          value={lang.code}
                          style={{
                            background: "#000000",
                            color: "#FFFFFF",
                            padding: "12px",
                          }}
                        >
                          {isSelected ? "✓ " : ""}{lang.flag} {lang.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 1 }}>
                    <ChevronRight size={20} className="text-gray-400 rotate-90" />
                  </div>
                </>
              ) : (
                <div className="p-2 pr-10 text-nokta-one-white" style={{ fontSize: "16px" }}>
                  {LANGUAGES.find(l => l.code === "fr")?.flag} {LANGUAGES.find(l => l.code === "fr")?.name}
                </div>
              )}
            </div>
          </div>

          {/* Connected Devices */}
          <SettingItem
            icon={Smartphone}
            label={t("settings.connectedDevices")}
            onClick={() => setIsDevicesModalOpen(true)}
            showChevron
          />

          {/* Programme Ambassadeur - Section complète */}
          {userId && (
            <div className="mt-6">
              <AffiliatePanel 
                userId={userId} 
                locale={currentLanguage || 'fr'} 
              />
            </div>
          )}

          {/* Invitations */}
          <SettingItem
            icon={UserPlus}
            label={t("settings.invitations")}
            dataSetting="invitations"
            showChevron
          />

          {/* FAQ */}
          <SettingItem
            icon={HelpCircle}
            label={t("faq.title")}
            onClick={() => router.push("/faq")}
            showChevron
          />

          {/* Nokta Dictionary */}
          <SettingItem
            icon={BookOpen}
            label="Nokta Dictionary"
            onClick={() => router.push("/dictionary")}
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
              <span className="text-nokta-one-white" suppressHydrationWarning>
                {t("support.contactUs")}
              </span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </motion.button>
        </div>

        {/* Log Out Button */}
        <motion.button
          data-setting="logout"
          className="glass-button-secondary w-full mt-10 py-4 font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          suppressHydrationWarning
        >
          {t("settings.logOut")}
        </motion.button>
      </div>

      {/* Modals */}

      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
      />

      <ConnectedDevicesModal
        isOpen={isDevicesModalOpen}
        onClose={() => setIsDevicesModalOpen(false)}
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
          // Synchroniser la langue avec i18n si elle a changé
          if (data.language && data.language !== currentLanguage) {
            changeLanguage(data.language);
          }
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
