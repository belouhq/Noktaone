"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// NOKTA ONE - PAGE PARAMÈTRES COMPLÈTE
// - Profil éditable
// - Notifications avec rappels personnalisables
// - Confidentialité & Données enterrée (sous-page)
// Style Apple - Dark Mode
// ============================================

// Types
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  dateOfBirth: string;
  country: string;
  avatarUrl?: string;
  language: string;
  referralCode: string;
  createdAt: string;
}

interface ReminderSettings {
  morning: { enabled: boolean; time: string };
  midday: { enabled: boolean; time: string };
  evening: { enabled: boolean; time: string };
}

// ============================================
// COMPOSANT PRINCIPAL - PAGE SETTINGS
// ============================================

const FAQ_ITEM_KEYS = [
  "whatIsNokta",
  "whenUseful",
  "whyOffButOk",
  "differentFromOthers",
  "analyzeEmotions",
  "replaceProfessional",
  "whyBodyNotMind",
  "howOften",
  "forAthletesOnly",
  "dontBelieveBreathing",
  "whySoShort",
  "dataPrivacy",
  "allLanguages",
  "whoIsItFor",
  "whyNow",
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { t, changeLanguage, currentLanguage } = useTranslation();

  // États - données mockées, pas de chargement réseau
  const [user, setUser] = useState<UserProfile | null>({
    id: "user_123",
    firstName: "Benjamin",
    lastName: "de Beaupuis",
    username: "benjamin",
    email: "benjamin@nokta.app",
    dateOfBirth: "1993-05-15",
    country: "FR",
    avatarUrl: undefined,
    language: "fr",
    referralCode: "@benjamin-4521",
    createdAt: "2026-01-15",
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Rappels
  const [reminders, setReminders] = useState<ReminderSettings>({
    morning: { enabled: true, time: "08:00" },
    midday: { enabled: false, time: "12:30" },
    evening: { enabled: true, time: "21:00" },
  });

  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Modales
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Page Confidentialité (sous-page)
  const [showPrivacyPage, setShowPrivacyPage] = useState(false);

  // Langues disponibles
  const LANGUAGES = [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "en", name: "English (US)", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  ];

  const COUNTRIES = [
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "US", name: "États-Unis", flag: "🇺🇸" },
    { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
    { code: "DE", name: "Allemagne", flag: "🇩🇪" },
    { code: "ES", name: "Espagne", flag: "🇪🇸" },
    { code: "IT", name: "Italie", flag: "🇮🇹" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "BE", name: "Belgique", flag: "🇧🇪" },
    { code: "CH", name: "Suisse", flag: "🇨🇭" },
    { code: "JP", name: "Japon", flag: "🇯🇵" },
    { code: "CN", name: "Chine", flag: "🇨🇳" },
    { code: "BR", name: "Brésil", flag: "🇧🇷" },
    { code: "AU", name: "Australie", flag: "🇦🇺" },
    { code: "IN", name: "Inde", flag: "🇮🇳" },
    { code: "MX", name: "Mexique", flag: "🇲🇽" },
    { code: "OTHER", name: "Autre", flag: "🌍" },
  ];

  // Restaurer les rappels depuis localStorage
  useEffect(() => {
    try {
      const savedReminders = localStorage.getItem("reminderSettings");
      if (savedReminders) setReminders(JSON.parse(savedReminders));
    } catch {
      // ignore invalid localStorage data
    }
  }, []);

  // Handlers
  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
    if (user) setUser({ ...user, language: langCode });
    setShowLanguageModal(false);
  };

  const handleRemindersChange = (newReminders: ReminderSettings) => {
    setReminders(newReminders);
    localStorage.setItem("reminderSettings", JSON.stringify(newReminders));
  };

  const handleProfileUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setShowEditProfile(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) window.location.href = url;
        else setShowSubscriptionModal(true);
      } else {
        setShowSubscriptionModal(true);
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      setShowSubscriptionModal(true);
    }
  };

  // Si on affiche la sous-page Confidentialité
  if (showPrivacyPage) {
    return (
      <SafeAreaContainer currentPage="settings">
        <PrivacyDataPage
          onBack={() => setShowPrivacyPage(false)}
          user={user}
        />
      </SafeAreaContainer>
    );
  }

  const currentLang = LANGUAGES.find((l) => l.code === currentLanguage);
  const activeRemindersCount = Object.values(reminders).filter((r) => r.enabled).length;

  return (
    <SafeAreaContainer currentPage="settings">
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>{t("settings.settingsSection")}</h1>
        </header>

        <div style={styles.content}>
          {/* SECTION PROFIL */}
          <section style={styles.section}>
            <div style={styles.profileCard}>
              <div style={styles.avatarContainer}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {user?.firstName?.charAt(0) || "?"}
                  </div>
                )}
                <button style={styles.editAvatarButton}>
                  <CameraIcon />
                </button>
              </div>
              <div style={styles.profileInfo}>
                <p style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p style={styles.profileUsername}>@{user?.username}</p>
              </div>
              <button
                style={styles.editProfileButton}
                onClick={() => setShowEditProfile(true)}
              >
                {t("settings.edit")}
              </button>
            </div>
          </section>

          {/* SECTION NOTIFICATIONS */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{t("settings.sectionNotifications")}</h2>
            <div style={styles.settingsGroup}>
              <SettingsRow
                icon={<BellIcon />}
                label={t("settings.pushNotifications")}
                description={t("settings.enableNotificationsShort")}
                trailing={
                  <Toggle
                    checked={notificationsEnabled}
                    onChange={setNotificationsEnabled}
                  />
                }
              />
              {notificationsEnabled && (
                <>
                  <Divider />
                  <SettingsRow
                    icon={<ClockIcon />}
                    label={t("settings.dailyReminders")}
                    description={
                      activeRemindersCount > 0
                        ? t("settings.remindersActive", { count: activeRemindersCount })
                        : t("settings.noRemindersConfigured")
                    }
                    onClick={() => setShowRemindersModal(true)}
                    hasArrow
                  />
                </>
              )}
            </div>
          </section>

          {/* SECTION PRÉFÉRENCES */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{t("settings.sectionPreferences")}</h2>
            <div style={styles.settingsGroup}>
              <SettingsRow
                icon={<GlobeIcon />}
                label={t("settings.language")}
                value={`${currentLang?.flag} ${currentLang?.name}`}
                onClick={() => setShowLanguageModal(true)}
                hasArrow
              />
              <Divider />
              <SettingsRow
                icon={<WatchIcon />}
                label={t("settings.connectedDevices")}
                description={t("settings.devicesShortDescription")}
                onClick={() => setShowDevicesModal(true)}
                hasArrow
              />
            </div>
          </section>

          {/* SECTION PARTAGER */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{t("settings.sectionShare")}</h2>
            <div style={styles.settingsGroup}>
              <SettingsRow
                icon={<GiftIcon />}
                label={t("settings.referralCode")}
                value={user?.referralCode || ""}
                trailing={
                  <button
                    style={{
                      ...styles.copyButton,
                      backgroundColor: copiedFeedback ? "rgba(48, 209, 88, 0.2)" : "rgba(255,255,255,0.1)",
                    }}
                    onClick={copyReferralCode}
                  >
                    {copiedFeedback ? <CheckIconSmall /> : <CopyIcon />}
                  </button>
                }
              />
              <Divider />
              <SettingsRow
                icon={<UsersIcon />}
                label={t("settings.inviteFriends")}
                onClick={() => {
                  if (navigator.share && user?.referralCode) {
                    navigator.share({
                      title: "Nokta One",
                      text: t("settings.shareInviteText", { code: user.referralCode }),
                      url: "https://nokta.app",
                    });
                  }
                }}
                hasArrow
                highlight
              />
            </div>
          </section>

          {/* SECTION ABONNEMENT */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{t("settings.sectionSubscription")}</h2>
            <div style={styles.settingsGroup}>
              <div style={styles.subscriptionCard}>
                <div style={styles.subscriptionInfo}>
                  <div style={styles.subscriptionBadge}>{t("settings.premium")}</div>
                  <p style={styles.subscriptionPlan}>{t("settings.premiumPlan")}</p>
                  <p style={styles.subscriptionPrice}>{t("settings.premiumPrice")}</p>
                  <p style={styles.subscriptionStatus}>
                    <span style={styles.statusDot} />
                    {t("settings.subscriptionActiveRenewal", { date: "15 fév. 2026" })}
                  </p>
                </div>
              </div>
              <Divider />
              <SettingsRow
                icon={<CreditCardIcon />}
                label={t("settings.manageSubscription")}
                description={t("settings.manageSubscriptionDesc")}
                onClick={handleManageSubscription}
                hasArrow
              />
              <Divider />
              <SettingsRow
                icon={<ReceiptIcon />}
                label={t("settings.paymentHistory")}
                onClick={handleManageSubscription}
                hasArrow
              />
            </div>
          </section>

          {/* SECTION AIDE */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{t("settings.sectionHelp")}</h2>
            <div style={styles.settingsGroup}>
              <SettingsRow
                icon={<HelpIcon />}
                label={t("settings.faq")}
                onClick={() => setShowFAQModal(true)}
                hasArrow
              />
              <Divider />
              <SettingsRow
                icon={<MessageIcon />}
                label={t("settings.contactUs")}
                onClick={() => setShowContactModal(true)}
                hasArrow
              />
            </div>
          </section>

          {/* LIEN LÉGAL */}
          <section style={styles.legalSection}>
            <button
              style={styles.legalLink}
              onClick={() => setShowPrivacyPage(true)}
            >
              Confidentialité & Données
            </button>
          </section>

          {/* DÉCONNEXION */}
          <section style={styles.logoutSection}>
            <button style={styles.logoutButton} onClick={handleLogout}>
              <LogoutIcon />
              <span>{t("settings.logOut")}</span>
            </button>
            <p style={styles.versionText}>v1.0.0 · Nokta One</p>
          </section>
        </div>

        {/* MODALES */}
        {showEditProfile && user && (
          <EditProfileModal
            user={user}
            countries={COUNTRIES}
            onSave={handleProfileUpdate}
            onClose={() => setShowEditProfile(false)}
          />
        )}

        {showLanguageModal && (
          <Modal onClose={() => setShowLanguageModal(false)} title={t("settings.language")}>
            <div style={styles.languageList}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  style={{
                    ...styles.languageOption,
                    backgroundColor:
                      currentLanguage === lang.code
                        ? "rgba(10, 132, 255, 0.15)"
                        : "transparent",
                  }}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span style={styles.languageFlag}>{lang.flag}</span>
                  <span style={styles.languageName}>{lang.name}</span>
                  {currentLanguage === lang.code && (
                    <CheckIcon style={{ marginLeft: "auto" }} />
                  )}
                </button>
              ))}
            </div>
          </Modal>
        )}

        {showRemindersModal && (
          <RemindersModal
            reminders={reminders}
            onChange={handleRemindersChange}
            onClose={() => setShowRemindersModal(false)}
          />
        )}

        {showDevicesModal && (
          <Modal onClose={() => setShowDevicesModal(false)} title={t("settings.connectedDevices")}>
            <div style={styles.comingSoonContent}>
              <WatchIcon style={{ width: 48, height: 48, color: "#636366" }} />
              <p style={styles.comingSoonText}>{t("settings.comingSoonDevices")}</p>
              <p style={styles.comingSoonDescription}>
                {t("settings.comingSoonDevicesDesc")}
              </p>
            </div>
          </Modal>
        )}

        {showFAQModal && (
          <Modal onClose={() => setShowFAQModal(false)} title={t("faq.title")}>
            <div style={styles.faqContent}>
              {FAQ_ITEM_KEYS.map((key) => (
                <FAQItem
                  key={key}
                  question={t(`faq.${key}.question`)}
                  answer={t(`faq.${key}.answer`)}
                />
              ))}
            </div>
          </Modal>
        )}

        {showContactModal && (
          <Modal onClose={() => setShowContactModal(false)} title={t("settings.contactModalTitle")}>
            <div style={styles.contactContent}>
              <p style={styles.contactDescription}>
                {t("settings.contactModalDescription")}
              </p>
              <a href="mailto:support@nokta.app" style={styles.contactOption}>
                <MailIcon />
                <div>
                  <p style={styles.contactLabel}>Email</p>
                  <p style={styles.contactValue}>support@nokta.app</p>
                </div>
              </a>
              <a
                href="https://twitter.com/noktaapp"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.contactOption}
              >
                <TwitterIcon />
                <div>
                  <p style={styles.contactLabel}>Twitter / X</p>
                  <p style={styles.contactValue}>@noktaapp</p>
                </div>
              </a>
            </div>
          </Modal>
        )}

        {showSubscriptionModal && (
          <Modal
            onClose={() => setShowSubscriptionModal(false)}
            title={t("settings.subscriptionModalTitle")}
          >
            <div style={styles.subscriptionModalContent}>
              <div style={styles.subscriptionModalCard}>
                <div style={styles.subscriptionBadgeLarge}>Premium</div>
                <p style={styles.subscriptionModalPlan}>Nokta One Premium</p>
                <p style={styles.subscriptionModalPrice}>
                  18,99 €<span style={styles.subscriptionModalPeriod}>/mois</span>
                </p>
              </div>

              <div style={styles.subscriptionDetails}>
                <div style={styles.subscriptionDetailRow}>
                  <span style={styles.subscriptionDetailLabel}>Statut</span>
                  <span style={styles.subscriptionDetailValue}>
                    <span style={styles.statusDotGreen} /> Actif
                  </span>
                </div>
                <div style={styles.subscriptionDetailRow}>
                  <span style={styles.subscriptionDetailLabel}>{t("settings.nextPayment")}</span>
                  <span style={styles.subscriptionDetailValue}>15 février 2026</span>
                </div>
                <div style={styles.subscriptionDetailRow}>
                  <span style={styles.subscriptionDetailLabel}>{t("settings.paymentMethod")}</span>
                  <span style={styles.subscriptionDetailValue}>•••• 4242</span>
                </div>
              </div>

              <div style={styles.subscriptionActions}>
                <button
                  style={styles.subscriptionActionButton}
                  onClick={() =>
                    window.open("https://billing.stripe.com/p/login/test", "_blank")
                  }
                >
                  <CreditCardIcon />
                  {t("settings.changePaymentMethod")}
                </button>
                <button
                  style={styles.subscriptionActionButton}
                  onClick={() =>
                    window.open("https://billing.stripe.com/p/login/test", "_blank")
                  }
                >
                  <ReceiptIcon />
                  {t("settings.viewInvoices")}
                </button>
                <button
                  style={styles.subscriptionCancelButton}
                  onClick={() => {
                    if (confirm(t("settings.cancelSubscriptionConfirm"))) {
                      alert(t("settings.contactToCancel"));
                    }
                  }}
                >
                  {t("settings.cancelSubscription")}
                </button>
              </div>

              <p style={styles.subscriptionNote}>
                {t("settings.subscriptionQuestion")}
              </p>
            </div>
          </Modal>
        )}
      </div>
    </SafeAreaContainer>
  );
}

// ============================================
// SOUS-PAGE CONFIDENTIALITÉ & DONNÉES
// ============================================

function PrivacyDataPage({
  onBack,
  user,
}: {
  onBack: () => void;
  user: UserProfile | null;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [consent, setConsent] = useState({
    analytics: true,
    marketing: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem("consentPreferences");
    if (savedConsent) setConsent(JSON.parse(savedConsent));
  }, []);

  const handleConsentChange = (key: "analytics" | "marketing", value: boolean) => {
    const newConsent = { ...consent, [key]: value };
    setConsent(newConsent);
    localStorage.setItem("consentPreferences", JSON.stringify(newConsent));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = {
        user,
        consent,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nokta-data-${user?.username || "user"}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } catch (e) {
      alert(t("consent.settings.exportError"));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      localStorage.clear();
      router.push("/");
    } catch (e) {
      alert(t("consent.settings.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.subPageHeader}>
        <button style={styles.backButton} onClick={onBack}>
          <ChevronLeftIcon />
          <span>{t("common.back")}</span>
        </button>
        <h1 style={styles.subPageTitle}>{t("settings.privacyAndData")}</h1>
      </header>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{t("consent.settings.sectionConsents")}</h2>
          <div style={styles.settingsGroup}>
            <SettingsRow
              icon={<ChartIcon />}
              label={t("consent.settings.analyticsAnonymous")}
              description={t("consent.settings.analyticsHelp")}
              trailing={
                <Toggle
                  checked={consent.analytics}
                  onChange={(v) => handleConsentChange("analytics", v)}
                />
              }
            />
            <Divider />
            <SettingsRow
              icon={<MailIcon />}
              label={t("consent.settings.marketingEmails")}
              description={t("consent.settings.marketingHelp")}
              trailing={
                <Toggle
                  checked={consent.marketing}
                  onChange={(v) => handleConsentChange("marketing", v)}
                />
              }
            />
          </div>
          {saved && <p style={styles.savedText}>{t("consent.settings.saved")}</p>}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{t("consent.settings.sectionYourData")}</h2>
          <div style={styles.settingsGroup}>
            <SettingsRow
              icon={<DownloadIcon />}
              label={t("consent.settings.export")}
              description={t("consent.settings.exportJsonDesc")}
              onClick={handleExport}
              trailing={
                exporting ? (
                  <div style={styles.miniSpinner} />
                ) : (
                  <ChevronRightIcon />
                )
              }
            />
            <Divider />
            <SettingsRow
              icon={<TrashIcon />}
              label={t("consent.settings.delete")}
              description={t("consent.settings.deleteDesc")}
              onClick={() => setShowDeleteModal(true)}
              danger
              hasArrow
            />
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{t("consent.settings.sectionLegalDocuments")}</h2>
          <div style={styles.settingsGroup}>
            <SettingsRow
              icon={<ShieldIcon />}
              label={t("settings.privacyPolicy")}
              onClick={() => window.open("https://nokta.app/privacy", "_blank")}
              hasArrow
            />
            <Divider />
            <SettingsRow
              icon={<FileIcon />}
              label={t("settings.termsOfUse")}
              onClick={() => window.open("https://nokta.app/terms", "_blank")}
              hasArrow
            />
          </div>
        </section>

        <section style={styles.rgpdInfo}>
          <p style={styles.rgpdText}>
            {t("privacy.rgpdNotice")}
          </p>
        </section>
      </div>

      {showDeleteModal && (
        <Modal
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteConfirmText("");
          }}
          title={t("privacy.deleteConfirmTitle")}
        >
          <div style={styles.deleteModalContent}>
            <div style={styles.warningBanner}>
              <WarningIcon />
              <p>{t("privacy.deleteConfirmWarning")}</p>
            </div>
            <p style={styles.deleteDescription}>
              {t("privacy.deleteConfirmDetails")}
            </p>
            <div style={styles.deleteInputGroup}>
              <label style={styles.deleteLabel}>
                {t("privacy.deleteConfirmLabel")} :
              </label>
              <input
                type="text"
                style={styles.deleteInput}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div style={styles.deleteActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                {t("privacy.cancel")}
              </button>
              <button
                style={{
                  ...styles.deleteConfirmButton,
                  opacity: deleteConfirmText === "DELETE" ? 1 : 0.5,
                }}
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE" || deleting}
              >
                {deleting ? t("consent.settings.deleting") : t("privacy.confirmDelete")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================
// MODAL ÉDITION PROFIL
// ============================================

function EditProfileModal({
  user,
  countries,
  onSave,
  onClose,
}: {
  user: UserProfile;
  countries: { code: string; name: string; flag: string }[];
  onSave: (user: UserProfile) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    country: user.country,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ ...user, ...formData });
      setSaving(false);
    }, 500);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContentFull} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <button style={styles.modalCloseText} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <h2 style={styles.modalTitle}>{t("settings.editProfile")}</h2>
          <button
            style={styles.modalSaveText}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "..." : t("common.save")}
          </button>
        </div>

        <div style={styles.editProfileContentScroll}>
          <div style={styles.editAvatarSection}>
            <div style={styles.avatarLarge}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={styles.avatarLargeImg} />
              ) : (
                <span style={styles.avatarLargeInitial}>
                  {formData.firstName.charAt(0)}
                </span>
              )}
            </div>
            <button style={styles.changePhotoButton}>{t("profile.changePhoto")}</button>
          </div>

          <div style={styles.formFields}>
            <div style={styles.formField}>
              <label style={styles.formLabel}>Prénom</label>
              <input
                type="text"
                style={styles.formInput}
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>Nom</label>
              <input
                type="text"
                style={styles.formInput}
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>@ (non modifiable)</label>
              <input
                type="text"
                style={{ ...styles.formInput, color: "#636366" }}
                value={`@${user.username}`}
                disabled
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>Email</label>
              <input
                type="email"
                style={styles.formInput}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>Date de naissance</label>
              <input
                type="date"
                style={styles.formInput}
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>Pays</label>
              <select
                style={styles.formSelect}
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MODAL RAPPELS
// ============================================

function RemindersModal({
  reminders,
  onChange,
  onClose,
}: {
  reminders: ReminderSettings;
  onChange: (r: ReminderSettings) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [local, setLocal] = useState(reminders);

  const handleToggle = (key: "morning" | "midday" | "evening") => {
    const updated = {
      ...local,
      [key]: { ...local[key], enabled: !local[key].enabled },
    };
    setLocal(updated);
    onChange(updated);
  };

  const handleTimeChange = (
    key: "morning" | "midday" | "evening",
    time: string
  ) => {
    const updated = {
      ...local,
      [key]: { ...local[key], time },
    };
    setLocal(updated);
    onChange(updated);
  };

  return (
    <Modal onClose={onClose} title={t("settings.dailyReminders")}>
      <div style={styles.remindersContent}>
        <p style={styles.remindersDescription}>
          {t("settings.remindersModalDescription")}
        </p>

        {(["morning", "midday", "evening"] as const).map((key) => {
          const emoji = { morning: "🌅", midday: "☀️", evening: "🌙" }[key];
          const label = t(`settings.reminder${key === "morning" ? "Morning" : key === "midday" ? "Noon" : "Evening"}`);
          return (
            <div key={key} style={styles.reminderRow}>
              <div style={styles.reminderInfo}>
                <span style={styles.reminderEmoji}>{emoji}</span>
                <div>
                  <p style={styles.reminderLabel}>{label}</p>
                  {!local[key].enabled && (
                    <p style={styles.reminderTime}>{local[key].time}</p>
                  )}
                </div>
              </div>
              <div style={styles.reminderControls}>
                {local[key].enabled && (
                  <input
                    type="time"
                    style={styles.timeInput}
                    value={local[key].time}
                    onChange={(e) => handleTimeChange(key, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <Toggle
                  checked={local[key].enabled}
                  onChange={() => handleToggle(key)}
                />
              </div>
            </div>
          );
        })}

        <p style={styles.remindersNote}>
          {t("settings.remindersNightNote")}
        </p>
      </div>
    </Modal>
  );
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    style={{
      ...styles.toggle,
      backgroundColor: checked ? "#0A84FF" : "rgba(255,255,255,0.2)",
    }}
    onClick={() => onChange(!checked)}
  >
    <div
      style={{
        ...styles.toggleKnob,
        transform: checked ? "translateX(20px)" : "translateX(0)",
      }}
    />
  </button>
);

const SettingsRow = ({
  icon,
  label,
  description,
  value,
  trailing,
  onClick,
  hasArrow,
  highlight,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  hasArrow?: boolean;
  highlight?: boolean;
  danger?: boolean;
}) => {
  const isClickable = Boolean(onClick);
  const rowStyle = {
    ...styles.settingsRow,
    backgroundColor: highlight ? "rgba(10, 132, 255, 0.1)" : "transparent",
    cursor: isClickable ? "pointer" : "default",
  };
  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      style={rowStyle}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick?.() : undefined}
    >
      <div style={styles.settingsRowLeft}>
        <div
          style={{
            ...styles.settingsRowIcon,
            color: danger ? "#FF453A" : highlight ? "#0A84FF" : "#8E8E93",
          }}
        >
          {icon}
        </div>
        <div style={styles.settingsRowText}>
          <span
            style={{
              ...styles.settingsRowLabel,
              color: danger ? "#FF453A" : "#FFFFFF",
            }}
          >
            {label}
          </span>
          {description && (
            <span style={styles.settingsRowDescription}>{description}</span>
          )}
        </div>
      </div>
      <div
        style={styles.settingsRowRight}
        onClick={(e) => trailing && e.stopPropagation()}
      >
        {value && <span style={styles.settingsRowValue}>{value}</span>}
        {trailing}
        {hasArrow && !trailing && <ChevronRightIcon />}
      </div>
    </div>
  );
};

const Divider = () => <div style={styles.divider} />;

const Modal = ({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h2 style={styles.modalTitle}>{title}</h2>
        <button style={styles.modalClose} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div style={styles.modalBody}>{children}</div>
    </div>
  </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={styles.faqItem}>
      <button style={styles.faqQuestion} onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <ChevronRightIcon
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0)",
            transition: "0.2s",
          }}
        />
      </button>
      {open && <p style={styles.faqAnswer}>{answer}</p>}
    </div>
  );
};

// ============================================
// ICÔNES
// ============================================

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);
const WatchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="12" r="7" />
    <polyline points="12,9 12,12 13.5,13.5" />
    <path d="M16.51 17.35l-.35 3.83a2 2 0 01-2 1.82H9.83a2 2 0 01-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 019.83 1h4.35a2 2 0 012 1.82l.35 3.83" />
  </svg>
);
const GiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="20,12 20,22 4,22 4,12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);
const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2" {...props}>
    <polyline points="9,18 15,12 9,6" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="2">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="2" {...props}>
    <polyline points="20,6 9,17 4,12" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF453A" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const ReceiptIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" />
    <path d="M8 10h8" />
    <path d="M8 14h4" />
  </svg>
);
const CheckIconSmall = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="2.5">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

// ============================================
// STYLES
// ============================================

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    maxWidth: "430px",
    margin: "0 auto",
    paddingBottom: "100px",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#0A84FF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    padding: "60px 24px 24px",
    position: "sticky",
    top: 0,
    backgroundColor: "#000000",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: "34px",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subPageHeader: {
    padding: "60px 24px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    color: "#0A84FF",
    fontSize: "17px",
    cursor: "pointer",
    padding: 0,
  },
  subPageTitle: { fontSize: "28px", fontWeight: "700", margin: 0 },
  content: { padding: "0 24px" },
  section: { marginBottom: "32px" },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "12px",
    paddingLeft: "4px",
  },
  settingsGroup: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  settingsRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    WebkitTapHighlightColor: "transparent",
  },
  settingsRowLeft: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
  settingsRowIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsRowText: { display: "flex", flexDirection: "column", gap: "2px" },
  settingsRowLabel: { fontSize: "16px", fontWeight: "400" },
  settingsRowDescription: { fontSize: "12px", color: "#636366" },
  settingsRowRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 1,
    minWidth: 0,
  },
  settingsRowValue: {
    fontSize: "14px",
    color: "#636366",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
    flex: 1,
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginLeft: "52px",
  },
  toggle: {
    width: "50px",
    height: "30px",
    borderRadius: "15px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.2s",
    WebkitTapHighlightColor: "transparent",
  },
  toggleKnob: {
    width: "26px",
    height: "26px",
    borderRadius: "13px",
    backgroundColor: "#FFFFFF",
    position: "absolute",
    top: "2px",
    left: "2px",
    transition: "transform 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "36px",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "72px",
    height: "72px",
    borderRadius: "36px",
    backgroundColor: "rgba(10,132,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "600",
    color: "#0A84FF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "28px",
    height: "28px",
    borderRadius: "14px",
    backgroundColor: "#0A84FF",
    border: "2px solid #000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#FFF",
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: "20px", fontWeight: "600", margin: "0 0 4px 0" },
  profileUsername: { fontSize: "15px", color: "#0A84FF", margin: 0 },
  editProfileButton: {
    padding: "8px 16px",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "8px",
    color: "#0A84FF",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
  },
  copyButton: {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    flexShrink: 0,
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#8E8E93",
  },
  legalSection: { marginTop: "24px", textAlign: "center" },
  legalLink: {
    background: "none",
    border: "none",
    color: "#636366",
    fontSize: "13px",
    cursor: "pointer",
    textDecoration: "underline",
    padding: "8px",
  },
  logoutSection: { marginTop: "40px", textAlign: "center" },
  logoutButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "transparent",
    border: "none",
    color: "#636366",
    fontSize: "15px",
    cursor: "pointer",
  },
  versionText: { marginTop: "16px", fontSize: "12px", color: "#48484A" },
  savedText: { marginTop: "12px", fontSize: "13px", color: "#30D158", textAlign: "center" },
  miniSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.1)",
    borderTopColor: "#0A84FF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "100%",
    maxWidth: "430px",
    maxHeight: "80vh",
    backgroundColor: "#1C1C1E",
    borderRadius: "20px 20px 0 0",
    overflow: "hidden",
  },
  modalContentFull: {
    width: "100%",
    maxWidth: "430px",
    height: "100vh",
    backgroundColor: "#000",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    flexShrink: 0,
  },
  modalTitle: { fontSize: "18px", fontWeight: "600", margin: 0 },
  modalClose: {
    width: "32px",
    height: "32px",
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  modalCloseText: { background: "none", border: "none", color: "#0A84FF", fontSize: "17px", cursor: "pointer" },
  modalSaveText: {
    background: "none",
    border: "none",
    color: "#0A84FF",
    fontSize: "17px",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalBody: { padding: "24px", overflowY: "auto", maxHeight: "calc(80vh - 80px)" },
  languageList: { display: "flex", flexDirection: "column", gap: "4px" },
  languageOption: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "none",
    background: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  },
  languageFlag: { fontSize: "24px" },
  languageName: { fontSize: "16px", color: "#FFFFFF" },
  comingSoonContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "40px 0",
    gap: "16px",
  },
  comingSoonText: { fontSize: "20px", fontWeight: "600", color: "#FFFFFF", margin: 0 },
  comingSoonDescription: {
    fontSize: "14px",
    color: "#8E8E93",
    lineHeight: "1.5",
    margin: 0,
    maxWidth: "280px",
  },
  faqContent: { display: "flex", flexDirection: "column", gap: "8px" },
  faqItem: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden" },
  faqQuestion: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
  },
  faqAnswer: {
    padding: "0 16px 16px",
    fontSize: "14px",
    color: "#8E8E93",
    lineHeight: "1.5",
    margin: 0,
    whiteSpace: "pre-line",
  },
  contactContent: { display: "flex", flexDirection: "column", gap: "16px" },
  contactDescription: { fontSize: "14px", color: "#8E8E93", margin: 0 },
  contactOption: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#FFFFFF",
  },
  contactLabel: { fontSize: "12px", color: "#8E8E93", margin: "0 0 2px 0" },
  contactValue: { fontSize: "15px", color: "#FFFFFF", margin: 0 },
  editProfileContent: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  editProfileContentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  editAvatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  avatarLarge: {
    width: "100px",
    height: "100px",
    borderRadius: "50px",
    backgroundColor: "rgba(10,132,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarLargeImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarLargeInitial: { fontSize: "40px", fontWeight: "600", color: "#0A84FF" },
  changePhotoButton: { background: "none", border: "none", color: "#0A84FF", fontSize: "15px", cursor: "pointer" },
  formFields: { display: "flex", flexDirection: "column", gap: "20px" },
  formField: { display: "flex", flexDirection: "column", gap: "8px" },
  formLabel: { fontSize: "13px", color: "#8E8E93" },
  formInput: {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#FFFFFF",
    fontSize: "16px",
    outline: "none",
  },
  formSelect: {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#FFFFFF",
    fontSize: "16px",
    outline: "none",
  },
  remindersContent: { display: "flex", flexDirection: "column", gap: "20px" },
  remindersDescription: { fontSize: "14px", color: "#8E8E93", margin: 0 },
  reminderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
  },
  reminderInfo: { display: "flex", alignItems: "center", gap: "12px" },
  reminderEmoji: { fontSize: "24px" },
  reminderLabel: { fontSize: "16px", fontWeight: "500", color: "#FFFFFF", margin: 0 },
  reminderTime: { fontSize: "13px", color: "#636366", margin: 0 },
  reminderControls: { display: "flex", alignItems: "center", gap: "12px" },
  timeInput: {
    padding: "8px 12px",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "14px",
  },
  remindersNote: { fontSize: "12px", color: "#636366", textAlign: "center", marginTop: "8px" },
  rgpdInfo: {
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "12px",
  },
  rgpdText: { fontSize: "12px", color: "#636366", lineHeight: "1.5", margin: 0 },
  deleteModalContent: { display: "flex", flexDirection: "column", gap: "20px" },
  warningBanner: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "rgba(255,69,58,0.1)",
    borderRadius: "12px",
    color: "#FF453A",
    fontWeight: "500",
  },
  deleteDescription: {
    fontSize: "14px",
    color: "#8E8E93",
    lineHeight: "1.5",
    margin: 0,
  },
  deleteInputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  deleteLabel: { fontSize: "14px", color: "#FFFFFF" },
  deleteInput: {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#FFFFFF",
    fontSize: "16px",
    outline: "none",
  },
  deleteActions: { display: "flex", gap: "12px", marginTop: "8px" },
  cancelButton: {
    flex: 1,
    padding: "14px",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "12px",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteConfirmButton: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#FF453A",
    border: "none",
    borderRadius: "12px",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  subscriptionCard: { padding: "16px" },
  subscriptionInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  subscriptionBadge: {
    display: "inline-block",
    padding: "4px 10px",
    backgroundColor: "rgba(10, 132, 255, 0.2)",
    color: "#0A84FF",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "6px",
    alignSelf: "flex-start",
    marginBottom: "8px",
  },
  subscriptionPlan: { fontSize: "17px", fontWeight: "600", color: "#FFFFFF", margin: 0 },
  subscriptionPrice: { fontSize: "14px", color: "#8E8E93", margin: "4px 0 0 0" },
  subscriptionStatus: {
    fontSize: "13px",
    color: "#30D158",
    margin: "8px 0 0 0",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  statusDot: { width: "6px", height: "6px", borderRadius: "3px", backgroundColor: "#30D158" },
  statusDotGreen: {
    width: "8px",
    height: "8px",
    borderRadius: "4px",
    backgroundColor: "#30D158",
    display: "inline-block",
  },
  subscriptionModalContent: { display: "flex", flexDirection: "column", gap: "24px" },
  subscriptionModalCard: {
    textAlign: "center",
    padding: "24px",
    backgroundColor: "rgba(10, 132, 255, 0.1)",
    borderRadius: "16px",
  },
  subscriptionBadgeLarge: {
    display: "inline-block",
    padding: "6px 16px",
    backgroundColor: "#0A84FF",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  subscriptionModalPlan: { fontSize: "20px", fontWeight: "600", color: "#FFFFFF", margin: 0 },
  subscriptionModalPrice: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: "8px 0 0 0",
  },
  subscriptionModalPeriod: { fontSize: "16px", fontWeight: "400", color: "#8E8E93" },
  subscriptionDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
  },
  subscriptionDetailRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  subscriptionDetailLabel: { fontSize: "14px", color: "#8E8E93" },
  subscriptionDetailValue: {
    fontSize: "14px",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  subscriptionActions: { display: "flex", flexDirection: "column", gap: "8px" },
  subscriptionActionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "none",
    borderRadius: "12px",
    color: "#FFFFFF",
    fontSize: "15px",
    cursor: "pointer",
  },
  subscriptionCancelButton: {
    padding: "14px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "12px",
    color: "#FF453A",
    fontSize: "15px",
    cursor: "pointer",
  },
  subscriptionNote: { fontSize: "12px", color: "#636366", textAlign: "center" },
};
