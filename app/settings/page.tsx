"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, Globe, Smartphone, UserPlus, HelpCircle, ChevronRight, BookOpen, 
  Edit2, MoreHorizontal, ChevronDown, MessageCircle, Shield, LogOut, Users, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useSwipe } from "@/lib/hooks/useSwipe";
import i18n from "@/lib/i18n";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { LANGUAGES } from "@/lib/i18n/languages";
import ComingSoonModal from "@/components/modals/ComingSoonModal";
import ConnectedDevicesModal from "@/components/modals/ConnectedDevicesModal";
import InvitationsModal from "@/components/modals/InvitationsModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import { ReminderSetupModalViral } from "@/components/engagement";
import { SupportModal } from "@/components/modals/SupportModal";
import TeslaSettingsLayout from "@/components/settings/TeslaSettingsLayout";
import { supabase } from "@/lib/supabase/client";
import { calculateStreak, getMemberSince } from "@/lib/utils/profile-stats";

const REMINDER_TIMES_KEY = "nokta_reminder_times";

type ReminderTimesStored = { morning?: string; afternoon?: string; evening?: string };

function getInitialReminderSchedule(): { morning: string; noon: string; evening: string } {
  if (typeof window === "undefined")
    return { morning: "08:00", noon: "13:00", evening: "20:00" };
  const raw = localStorage.getItem(REMINDER_TIMES_KEY);
  if (!raw) return { morning: "08:00", noon: "13:00", evening: "20:00" };
  try {
    const parsed = JSON.parse(raw) as ReminderTimesStored;
    return {
      morning: parsed.morning ?? "08:00",
      noon: parsed.afternoon ?? "13:00",
      evening: parsed.evening ?? "20:00",
    };
  } catch {
    return { morning: "08:00", noon: "13:00", evening: "20:00" };
  }
}

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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      return result === "granted";
    }
    return false;
  }, []);
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
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [reminderSchedule, setReminderSchedule] = useState<{ morning: string; noon: string; evening: string }>(() =>
    typeof window !== "undefined" ? getInitialReminderSchedule() : { morning: "08:00", noon: "13:00", evening: "20:00" }
  );
  const [copied, setCopied] = useState(false);
  const [invitationsCount] = useState(3); // Mock pour l'instant, plus tard : calculer depuis skanesLast24h
  const [streakDays, setStreakDays] = useState(0);
  const [memberSince, setMemberSince] = useState('Jan 2026');
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

    // Calculer le streak et la date d'inscription
    setStreakDays(calculateStreak());
    setMemberSince(getMemberSince());
    setReminderSchedule(getInitialReminderSchedule());
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
        <div className="w-full max-w-[430px] mx-auto">
          <TeslaSettingsLayout
            user={{
              username: userProfile.username,
              email: userProfile.email,
              streak: streakDays,
              memberSince,
            }}
            rappelsEnabled={notificationsEnabled}
            onToggleRappels={setNotificationsEnabled}
            reminderTimes={reminderSchedule}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={() => void requestNotificationPermission()}
            onEditProfile={() => setIsEditProfileModalOpen(true)}
            onPersonnaliserHoraires={() => setShowScheduleModal(true)}
            onDevices={() => setIsDevicesModalOpen(true)}
            onInvite={() => setIsInvitationsModalOpen(true)}
            onFaq={() => router.push("/faq")}
            onContact={() => setIsSupportModalOpen(true)}
            onTerms={() => router.push("/terms")}
            onPrivacy={() => router.push("/privacy")}
            onLicenses={() => setIsComingSoonModalOpen(true)}
            onPrivacyData={() => setIsComingSoonModalOpen(true)}
            onLogout={handleLogOut}
            languageLabel={LANGUAGES.find(l => l.code === currentLanguage)?.name ?? "Français"}
            languages={LANGUAGES}
            currentLanguageCode={currentLanguage || "fr"}
            onSelectLanguage={handleLanguageSelect}
            showBottomNav={false}
          />
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

      <ReminderSetupModalViral
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        initialTimes={{ morning: reminderSchedule.morning, midday: reminderSchedule.noon, evening: reminderSchedule.evening }}
        onSave={(times) => {
          const payload: ReminderTimesStored = {
            morning: times.morning ?? getInitialReminderSchedule().morning,
            afternoon: times.midday ?? getInitialReminderSchedule().noon,
            evening: times.evening ?? getInitialReminderSchedule().evening,
          };
          localStorage.setItem(REMINDER_TIMES_KEY, JSON.stringify(payload));
          setReminderSchedule({
            morning: payload.morning ?? "08:00",
            noon: payload.afternoon ?? "13:00",
            evening: payload.evening ?? "20:00",
          });
          if (userId) {
            supabase
              .from("profiles")
              .update({ reminder_times: payload })
              .eq("id", userId)
              .then(({ error }) => {
                if (error) console.error("Error saving reminder times:", error);
              });
          }
        }}
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
