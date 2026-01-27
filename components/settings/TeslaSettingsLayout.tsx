"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Edit2,
  Bell,
  Globe,
  Smartphone,
  Share2,
  HelpCircle,
  MessageCircle,
  MoreHorizontal,
  Shield,
  LogOut,
  ChevronRight,
  ChevronDown,
  Home,
  ScanFace,
  Settings,
} from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Style Tesla épuré pour Nokta Settings
// Fond noir pur, icônes outline, séparateurs fins, espacement généreux

export interface TeslaSettingsUser {
  username: string;
  email: string;
  streak: number;
  memberSince: string;
}

export interface TeslaSettingsLayoutProps {
  user: TeslaSettingsUser;
  rappelsEnabled: boolean;
  onToggleRappels: (enabled: boolean) => void;
  /** Horaires actuels des rappels (morning / noon / evening) pour affichage */
  reminderTimes?: { morning: string; noon: string; evening: string };
  /** État de la permission notifications (pour ré-offre si refus) */
  notificationPermission?: NotificationPermission;
  /** Appelé pour demander à nouveau la permission depuis les paramètres */
  onRequestNotificationPermission?: () => void;
  onEditProfile?: () => void;
  onPersonnaliserHoraires?: () => void;
  onLanguage?: () => void;
  onDevices?: () => void;
  onInvite?: () => void;
  onFaq?: () => void;
  onContact?: () => void;
  onTerms?: () => void;
  onPrivacy?: () => void;
  onLicenses?: () => void;
  onPrivacyData?: () => void;
  onLogout?: () => void;
  languageLabel?: string;
  /** Si true, affiche la nav Tesla intégrée ; si false, on est déjà dans SafeAreaContainer avec BottomNav */
  showBottomNav?: boolean;
  /** Liste des langues pour ouvrir le choix au niveau de la ligne Langue (expansion inline) */
  languages?: Array<{ code: string; name: string; flag: string }>;
  /** Code langue actuel */
  currentLanguageCode?: string;
  /** Appelé au choix d’une langue (affiche la liste sous la ligne Langue) */
  onSelectLanguage?: (code: string) => void;
}

const TeslaSettingsLayout = ({
  user,
  rappelsEnabled,
  onToggleRappels,
  reminderTimes,
  notificationPermission,
  onRequestNotificationPermission,
  onEditProfile,
  onPersonnaliserHoraires,
  onLanguage,
  onDevices,
  onInvite,
  onFaq,
  onContact,
  onTerms,
  onPrivacy,
  onLicenses,
  onPrivacyData,
  onLogout,
  languageLabel = "Français",
  showBottomNav = false,
  languages,
  currentLanguageCode,
  onSelectLanguage,
}: TeslaSettingsLayoutProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [plusExpanded, setPlusExpanded] = useState(false);
  const [languageExpanded, setLanguageExpanded] = useState(false);
  const [rappelsExpanded, setRappelsExpanded] = useState(false);

  const hasInlineLanguage =
    languages && languages.length > 0 && typeof currentLanguageCode === "string" && onSelectLanguage;
  const handleLanguageRowClick = () => {
    if (hasInlineLanguage) {
      setLanguageExpanded((prev) => !prev);
    } else {
      onLanguage?.();
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>{t("settings.profile")}</h1>
      </header>

      <main style={styles.content}>
        <section style={styles.profileSection}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              <User size={28} strokeWidth={1.5} stroke="#6E6E73" />
            </div>
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.usernameRow}>
              <span style={styles.username}>@{user.username}</span>
              <button
                type="button"
                style={styles.editButton}
                aria-label={t("settings.editProfileAria")}
                onClick={() => onEditProfile?.()}
              >
                <Edit2 size={16} strokeWidth={1.5} stroke="#6E6E73" />
              </button>
            </div>
            <span style={styles.email}>{user.email}</span>
          </div>
        </section>

        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statIcon}>🔥</span>
            <span style={styles.statText}>{user.streak} {t("profile.streakDays")}</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statIcon}>✓</span>
            <span style={styles.statText}>{t("profile.memberSince")} {user.memberSince}</span>
          </div>
        </div>

        <div style={styles.separator} />

        <div style={styles.menuList}>
          <button
            type="button"
            style={styles.menuItemButton}
            onClick={() => setRappelsExpanded((prev) => !prev)}
            aria-expanded={rappelsExpanded}
          >
            <div style={styles.menuItemLeft}>
              <Bell size={22} strokeWidth={1.5} stroke="#8E8E93" />
              <span style={styles.menuItemTitle}>{t("settings.dailyReminders")}</span>
            </div>
            <ChevronRight
              size={20}
              strokeWidth={2}
              stroke="#48484A"
              style={{ transform: rappelsExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          </button>

          {rappelsExpanded && (
            <>
              <div style={styles.separator} />
              <div style={styles.expandedContent}>
                <p style={styles.rappelsSubtitle}>{t("settings.dailyRemindersDescription")}</p>
                <div style={styles.rappelsToggleRow}>
                  <span style={styles.expandedItemText}>{t("settings.enableReminders")}</span>
                  <Toggle
                    enabled={rappelsEnabled}
                    onToggle={() => onToggleRappels(!rappelsEnabled)}
                  />
                </div>
                {rappelsEnabled && (
                  <>
                    {notificationPermission === "denied" && onRequestNotificationPermission && (
                      <>
                        <p style={styles.rappelsSubtitle}>
                          {t("settings.notificationPermissionDeniedDesc")}
                        </p>
                        <button
                          type="button"
                          style={styles.expandedItem}
                          onClick={onRequestNotificationPermission}
                        >
                          <span style={styles.expandedItemText}>{t("settings.enableNotifications")}</span>
                          <ChevronRight size={20} strokeWidth={2} stroke="#48484A" />
                        </button>
                        <div style={styles.separator} />
                      </>
                    )}
                    {reminderTimes && (
                      <p style={styles.rappelsSubtitle}>
                        {t("settings.reminderMorning")} {reminderTimes.morning} · {t("settings.reminderNoon")} {reminderTimes.noon} · {t("settings.reminderEvening")} {reminderTimes.evening}
                      </p>
                    )}
                    <div style={styles.separator} />
                    {onPersonnaliserHoraires && (
                      <button
                        type="button"
                        style={styles.expandedItem}
                        onClick={onPersonnaliserHoraires}
                      >
                        <span style={styles.expandedItemText}>{t("settings.customizeSchedule")}</span>
                        <ChevronRight size={20} strokeWidth={2} stroke="#48484A" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          <div style={styles.separator} />

          <button
            type="button"
            style={styles.menuItemButton}
            onClick={handleLanguageRowClick}
            aria-expanded={languageExpanded}
          >
            <div style={styles.menuItemLeft}>
              <Globe size={22} strokeWidth={1.5} stroke="#8E8E93" />
              <span style={styles.menuItemTitle}>{t("settings.language")}</span>
            </div>
            <div style={styles.menuItemRight}>
              <span style={styles.menuItemValue}>{languageLabel}</span>
              <ChevronRight
                size={20}
                strokeWidth={2}
                stroke="#48484A"
                style={{ transform: languageExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
              />
            </div>
          </button>

          {languageExpanded && hasInlineLanguage && (
            <>
              <div style={styles.separator} />
              <div style={styles.expandedContent}>
                {languages!.map((lang, index) => {
                  const isSelected = lang.code === currentLanguageCode;
                  return (
                    <React.Fragment key={lang.code}>
                      {index > 0 && <div style={styles.separator} />}
                      <button
                        type="button"
                        style={styles.expandedItem}
                        onClick={() => {
                          onSelectLanguage?.(lang.code);
                          setLanguageExpanded(false);
                        }}
                      >
                        <span style={styles.expandedItemText}>
                          {lang.flag} {lang.name}
                          {isSelected ? " ✓" : ""}
                        </span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          )}

          <div style={styles.separator} />

          <MenuItem
            icon={<Smartphone size={22} strokeWidth={1.5} stroke="#8E8E93" />}
            title={t("settings.connectedDevices")}
            onClick={() => onDevices?.()}
          />

          <div style={styles.separator} />

          <MenuItem
            icon={<Share2 size={22} strokeWidth={1.5} stroke="#8E8E93" />}
            title={t("profile.inviteFriends")}
            onClick={() => onInvite?.()}
          />

          <div style={styles.separator} />

          <MenuItem
            icon={<HelpCircle size={22} strokeWidth={1.5} stroke="#8E8E93" />}
            title={t("faq.title")}
            onClick={() => (onFaq ? onFaq() : router.push("/faq"))}
          />

          <div style={styles.separator} />

          <MenuItem
            icon={<MessageCircle size={22} strokeWidth={1.5} stroke="#8E8E93" />}
            title={t("settings.contactUs")}
            onClick={() => onContact?.()}
          />

          <div style={styles.separator} />

          <button
            type="button"
            style={styles.menuItemButton}
            onClick={() => setPlusExpanded(!plusExpanded)}
          >
            <div style={styles.menuItemLeft}>
              <MoreHorizontal size={22} strokeWidth={1.5} stroke="#8E8E93" />
              <span style={styles.menuItemTitle}>{t("settings.more")}</span>
            </div>
            <ChevronDown
              size={20}
              strokeWidth={2}
              stroke="#48484A"
              style={{ transform: plusExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {plusExpanded && (
            <>
              <div style={styles.separator} />
              <div style={styles.expandedContent}>
                <button
                  type="button"
                  style={styles.expandedItem}
                  onClick={() => (onTerms ? onTerms() : router.push("/terms"))}
                >
                  <span style={styles.expandedItemText}>{t("settings.termsOfUse")}</span>
                  <ChevronRight size={20} strokeWidth={2} stroke="#48484A" />
                </button>
                <div style={styles.separator} />
                <button
                  type="button"
                  style={styles.expandedItem}
                  onClick={() => (onPrivacy ? onPrivacy() : router.push("/privacy"))}
                >
                  <span style={styles.expandedItemText}>{t("settings.privacyPolicy")}</span>
                  <ChevronRight size={20} strokeWidth={2} stroke="#48484A" />
                </button>
                <div style={styles.separator} />
                <button
                  type="button"
                  style={styles.expandedItem}
                  onClick={() => onLicenses?.()}
                >
                  <span style={styles.expandedItemText}>{t("settings.licenses")}</span>
                  <ChevronRight size={20} strokeWidth={2} stroke="#48484A" />
                </button>
              </div>
            </>
          )}

          <div style={styles.separator} />

          <MenuItem
            icon={<Shield size={22} strokeWidth={1.5} stroke="#8E8E93" />}
            title={t("settings.privacyAndData")}
            onClick={() => onPrivacyData?.()}
          />

          <div style={styles.separator} />

          <button
            type="button"
            style={styles.logoutButton}
            onClick={() => onLogout?.()}
          >
            <LogOut size={22} strokeWidth={1.5} stroke="#8E8E93" />
            <span style={styles.logoutText}>{t("settings.logOut")}</span>
          </button>
        </div>
      </main>

      {showBottomNav && (
        <nav style={styles.bottomNav}>
          <NavItem
            icon={<Home size={24} strokeWidth={1.5} />}
            label={t("nav.home")}
            active={false}
            onClick={() => router.push("/")}
          />
          <NavItem
            icon={<ScanFace size={24} strokeWidth={1.5} />}
            label={t("nav.skane")}
            active={false}
            onClick={() => router.push("/skane")}
          />
          <NavItem
            icon={<Settings size={24} strokeWidth={1.5} />}
            label={t("nav.settings")}
            active
            onClick={() => router.push("/settings")}
          />
        </nav>
      )}
    </div>
  );
};

// ============================================
// SOUS-COMPOSANTS
// ============================================

const MenuItem = ({
  icon,
  title,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onClick?: () => void;
}) => (
  <button type="button" style={styles.menuItemButton} onClick={onClick}>
    <div style={styles.menuItemLeft}>
      {icon}
      <span style={styles.menuItemTitle}>{title}</span>
    </div>
    <div style={styles.menuItemRight}>
      {value != null && value !== "" && <span style={styles.menuItemValue}>{value}</span>}
      <ChevronRight size={20} strokeWidth={2} stroke="#48484A" />
    </div>
  </button>
);

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    type="button"
    style={{
      ...styles.toggle,
      backgroundColor: enabled ? "#30D158" : "#39393D",
    }}
    onClick={onToggle}
    role="switch"
    aria-checked={enabled}
  >
    <div
      style={{
        ...styles.toggleKnob,
        transform: enabled ? "translateX(20px)" : "translateX(2px)",
      }}
    />
  </button>
);

const NavItem = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    style={{ ...styles.navItem, opacity: active ? 1 : 0.5 }}
    onClick={onClick}
  >
    {icon}
    <span style={styles.navLabel}>{label}</span>
  </button>
);

// ============================================
// STYLES
// ============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    maxWidth: "430px",
    margin: "0 auto",
  },

  header: {
    padding: "16px 20px",
    paddingTop: "60px",
    textAlign: "center",
  },

  headerTitle: {
    fontSize: "17px",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    margin: 0,
  },

  content: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "100px",
  },

  profileSection: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    gap: "16px",
  },

  avatarContainer: {
    flexShrink: 0,
  },

  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "#1C1C1E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #2C2C2E",
  },

  profileInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  usernameRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  username: {
    fontSize: "17px",
    fontWeight: 500,
    color: "#FFFFFF",
  },

  editButton: {
    background: "none",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  email: {
    fontSize: "14px",
    color: "#8E8E93",
  },

  statsRow: {
    display: "flex",
    alignItems: "center",
    padding: "0 20px 20px",
    gap: "16px",
  },

  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  statIcon: {
    fontSize: "14px",
  },

  statText: {
    fontSize: "13px",
    color: "#8E8E93",
  },

  statDivider: {
    width: "1px",
    height: "12px",
    backgroundColor: "#2C2C2E",
  },

  separator: {
    height: "1px",
    backgroundColor: "#1C1C1E",
    marginLeft: "20px",
    marginRight: "20px",
  },

  menuList: {
    display: "flex",
    flexDirection: "column",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    minHeight: "64px",
  },

  menuItemButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "16px 20px",
    minHeight: "56px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#FFFFFF",
    textAlign: "left",
  },

  menuItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  menuItemContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  menuItemTitle: {
    fontSize: "16px",
    fontWeight: 400,
    color: "#FFFFFF",
  },

  menuItemSubtitle: {
    fontSize: "13px",
    color: "#6E6E73",
  },

  menuItemRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  menuItemValue: {
    fontSize: "15px",
    color: "#6E6E73",
  },

  subMenuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "12px 20px 12px 56px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  subMenuText: {
    fontSize: "14px",
    color: "#6E6E73",
  },

  toggle: {
    width: "50px",
    height: "30px",
    borderRadius: "15px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.2s ease",
  },

  toggleKnob: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    position: "absolute",
    top: "2px",
    transition: "transform 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },

  expandedContent: {
    display: "flex",
    flexDirection: "column",
  },

  rappelsSubtitle: {
    fontSize: "13px",
    color: "#6E6E73",
    margin: 0,
    padding: "8px 20px",
  },

  rappelsToggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    minHeight: "56px",
  },

  expandedItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    minHeight: "56px",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  },

  expandedItemText: {
    fontSize: "16px",
    fontWeight: 400,
    color: "#FFFFFF",
  },

  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    width: "100%",
    padding: "16px 20px",
    minHeight: "56px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  logoutText: {
    fontSize: "16px",
    color: "#8E8E93",
  },

  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 0 28px",
    backgroundColor: "#000000",
    borderTop: "1px solid #1C1C1E",
  },

  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#FFFFFF",
    padding: "8px 16px",
  },

  navLabel: {
    fontSize: "10px",
    fontWeight: 500,
  },
};

export default TeslaSettingsLayout;
