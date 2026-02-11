"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ============================================
// ÉCRAN MODIFIER MON PROFIL - NOKTA ONE
// Style Tesla épuré
// ============================================

export interface EditProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  occupation: string;
  avatar: string | null;
}

const DEFAULT_DATA: EditProfileFormData = {
  firstName: "",
  lastName: "",
  username: "",
  dateOfBirth: "",
  gender: "male",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  country: "FR",
  occupation: "",
  avatar: null,
};

function normalizeInitial(d: Record<string, unknown> | undefined): EditProfileFormData {
  if (!d) return { ...DEFAULT_DATA };
  const dob = d.dateOfBirth ?? d.birthDate;
  const dateStr =
    typeof dob === "string"
      ? dob
      : dob instanceof Date
        ? dob.toISOString().slice(0, 10)
        : "";
  return {
    firstName: String(d.firstName ?? ""),
    lastName: String(d.lastName ?? ""),
    username: String(d.username ?? "").replace(/^@/, ""),
    dateOfBirth: dateStr || "1993-01-15",
    gender: String(d.gender ?? "male"),
    email: String(d.email ?? ""),
    phone: String(d.phone ?? ""),
    address: String(d.address ?? ""),
    postalCode: String(d.postalCode ?? ""),
    city: String(d.city ?? ""),
    country: String(d.country ?? "FR"),
    occupation: String(d.occupation ?? d.job ?? ""),
    avatar: d.avatar != null ? String(d.avatar) : null,
  };
}

const genderOptions = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
  { value: "other", label: "Autre" },
  { value: "prefer_not", label: "Ne pas préciser" },
];

const countryOptions = [
  { value: "FR", label: "France", flag: "🇫🇷" },
  { value: "US", label: "États-Unis", flag: "🇺🇸" },
  { value: "GB", label: "Royaume-Uni", flag: "🇬🇧" },
  { value: "DE", label: "Allemagne", flag: "🇩🇪" },
  { value: "ES", label: "Espagne", flag: "🇪🇸" },
  { value: "IT", label: "Italie", flag: "🇮🇹" },
  { value: "CN", label: "Chine", flag: "🇨🇳" },
  { value: "JP", label: "Japon", flag: "🇯🇵" },
];

interface EditProfileScreenProps {
  initialData?: Record<string, unknown>;
  onSave?: (data: EditProfileFormData & { dateOfBirth: string; language?: string }) => void;
  onCancel?: () => void;
  onClose?: () => void;
  showBottomNav?: boolean;
  onHome?: () => void;
  onSkane?: () => void;
  onSettings?: () => void;
  activeNav?: "home" | "skane" | "settings";
  embeddedInModal?: boolean;
}

export default function EditProfileScreen({
  initialData,
  onSave = () => {},
  onCancel = () => {},
  onClose = () => {},
  showBottomNav = false,
  onHome,
  onSkane,
  onSettings,
  activeNav = "settings",
  embeddedInModal = false,
}: EditProfileScreenProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<EditProfileFormData>(() =>
    normalizeInitial(initialData as Record<string, unknown>)
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation : si le parent ne fournit pas les callbacks, on utilise le router
  const handleNavHome = onHome ?? (() => router.push("/"));
  const handleNavSkane = onSkane ?? (() => router.push("/skane"));
  const handleNavSettings = onSettings ?? (() => router.push("/settings"));

  useEffect(() => {
    setFormData(normalizeInitial(initialData as Record<string, unknown>));
  }, [initialData]);

  const handleChange = (field: keyof EditProfileFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }));
  };

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        handleChange("avatar", typeof result === "string" ? result : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        dateOfBirth: formData.dateOfBirth,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedOption = <T extends { value: string }>(options: T[], value: string): T => {
    return options.find((opt) => opt.value === value) ?? options[0];
  };

  const containerStyle = embeddedInModal
    ? { ...styles.container, minHeight: 0, height: "100%", maxWidth: "100%" }
    : styles.container;
  const headerStyle = embeddedInModal
    ? { ...styles.header, paddingTop: "20px" }
    : styles.header;
  const footerStyle = embeddedInModal
    ? { ...styles.footer, position: "sticky" as const, bottom: 0, marginTop: "auto" }
    : styles.footer;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={styles.headerTitle}>Modifier mon profil</h1>
        <button
          type="button"
          style={styles.closeButton}
          onClick={onClose}
          aria-label="Fermer"
        >
          <CloseIcon />
        </button>
      </header>

      <main style={styles.content}>
        <section style={styles.section}>
          <span style={styles.sectionTitle}>PHOTO DE PROFIL</span>
          <div style={styles.photoSection}>
            <div style={styles.avatarContainer}>
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <UserIcon />
                </div>
              )}
            </div>
            <button
              type="button"
              style={styles.changePhotoButton}
              onClick={handlePhotoChange}
            >
              Changer la photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              aria-hidden
            />
          </div>
        </section>

        <section style={styles.section}>
          <span style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</span>

          <div style={styles.row}>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>
                Prénom <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                style={styles.input}
                placeholder="Votre prénom"
              />
            </div>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>
                Nom <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                style={styles.input}
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>@ Username</label>
            <div style={styles.inputWithPrefix}>
              <span style={styles.inputPrefix}>@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                style={styles.inputNoBorder}
                placeholder="username"
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Date de naissance <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Genre</label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              style={styles.select}
            >
              {genderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section style={styles.section}>
          <span style={styles.sectionTitle}>COORDONNÉES</span>

          <div style={styles.field}>
            <label style={styles.label}>
              Email <span style={styles.required}>*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={styles.input}
              placeholder="votre@email.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Téléphone</label>
            <div style={styles.inputWithPrefix}>
              <span style={styles.flagPrefix}>
                {getSelectedOption(countryOptions, formData.country).flag}
              </span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                style={styles.inputNoBorder}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Adresse</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              style={styles.input}
              placeholder="Votre adresse"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>Code postal</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                style={styles.input}
                placeholder="75000"
              />
            </div>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                style={styles.input}
                placeholder="Paris"
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Pays</label>
            <select
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              style={styles.select}
            >
              {countryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section style={styles.section}>
          <span style={styles.sectionTitle}>PRÉFÉRENCES</span>

          <div style={styles.field}>
            <label style={styles.label}>Métier (optionnel)</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
              style={styles.input}
              placeholder="Ex: Entrepreneur, Athlète, Étudiant..."
            />
          </div>
        </section>
      </main>

      <footer style={footerStyle}>
        <button type="button" style={styles.cancelButton} onClick={onCancel}>
          Annuler
        </button>
        <button
          type="button"
          style={{
            ...styles.saveButton,
            opacity: isLoading ? 0.7 : 1,
          }}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </footer>

      {showBottomNav && (
        <nav style={styles.bottomNav}>
          <NavItem
            icon={<HomeIcon />}
            label="Accueil"
            active={activeNav === "home"}
            onClick={handleNavHome}
          />
          <NavItem
            icon={<SkaneIcon />}
            label="Skane"
            active={activeNav === "skane"}
            onClick={handleNavSkane}
          />
          <NavItem
            icon={<SettingsIcon />}
            label="Paramètres"
            active={activeNav === "settings"}
            onClick={handleNavSettings}
          />
        </nav>
      )}

      <style>{globalStyles}</style>
    </div>
  );
}

// ============================================
// COMPOSANTS
// ============================================

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  const handleClick = () => {
    if (onClick) onClick();
  };
  return (
    <button
      type="button"
      style={{ ...styles.navItem, opacity: active ? 1 : 0.5, cursor: onClick ? "pointer" : "default" }}
      onClick={handleClick}
      aria-label={label}
    >
      {icon}
      <span style={styles.navLabel}>{label}</span>
    </button>
  );
}

// ============================================
// ICÔNES
// ============================================

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6E6E73"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6E6E73"
      strokeWidth="1.5"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function SkaneIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M3 8V5a2 2 0 012-2h3" />
      <path d="M16 3h3a2 2 0 012 2v3" />
      <path d="M3 16v3a2 2 0 002 2h3" />
      <path d="M16 21h3a2 2 0 002-2v-3" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M9 15c.83.67 2 1 3 1s2.17-.33 3-1" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

// ============================================
// STYLES
// ============================================

const globalStyles = `
  input::placeholder {
    color: #48484A;
  }
  
  input:focus, select:focus {
    border-color: #3C3C3E;
  }
  
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.5;
  }
  
  select option {
    background-color: #1C1C1E;
    color: #FFFFFF;
  }
`;

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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    paddingTop: "60px",
    position: "sticky",
    top: 0,
    backgroundColor: "#000000",
    zIndex: 10,
    borderBottom: "1px solid #1C1C1E",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  closeButton: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
  },
  content: {
    flex: 1,
    padding: "0 20px",
    paddingBottom: "180px",
    overflowY: "auto",
  },
  section: {
    paddingTop: "24px",
    paddingBottom: "8px",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#6E6E73",
    display: "block",
    marginBottom: "16px",
  },
  photoSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  avatarContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  avatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
  },
  changePhotoButton: {
    padding: "12px 20px",
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
  },
  field: {
    marginBottom: "16px",
  },
  fieldHalf: {
    flex: 1,
  },
  row: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#8E8E93",
    display: "block",
    marginBottom: "8px",
  },
  required: {
    color: "#FF453A",
  },
  input: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#1C1C1E",
    border: "1px solid #2C2C2E",
    borderRadius: "12px",
    fontSize: "17px",
    color: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  inputWithPrefix: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    border: "1px solid #2C2C2E",
    borderRadius: "12px",
    overflow: "hidden",
  },
  inputPrefix: {
    padding: "16px",
    paddingRight: "8px",
    color: "#6E6E73",
    fontSize: "17px",
  },
  flagPrefix: {
    padding: "16px",
    paddingRight: "12px",
    fontSize: "20px",
  },
  inputNoBorder: {
    flex: 1,
    padding: "16px",
    paddingLeft: 0,
    backgroundColor: "transparent",
    border: "none",
    fontSize: "17px",
    color: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#1C1C1E",
    border: "1px solid #2C2C2E",
    borderRadius: "12px",
    fontSize: "17px",
    color: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236E6E73' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
  },
  footer: {
    position: "fixed",
    bottom: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    display: "flex",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#000000",
    borderTop: "1px solid #1C1C1E",
    boxSizing: "border-box",
  },
  cancelButton: {
    flex: 1,
    padding: "16px",
    backgroundColor: "transparent",
    color: "#FFFFFF",
    border: "1px solid #3C3C3E",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  saveButton: {
    flex: 1,
    padding: "16px",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s ease",
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
