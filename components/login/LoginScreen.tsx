"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ============================================
// ÉCRAN DE CONNEXION - NOKTA ONE
// Style Tesla épuré
// ============================================

type LoginCredentials = { email: string; password: string };
type LoginErrors = { email?: string; password?: string; general?: string };

export const LoginScreen = ({
  onLogin = async () => {},
  onAppleLogin = () => {},
  onGoogleLogin = () => {},
  onForgotPassword = () => {},
  onBack = () => {},
}: {
  onLogin?: (creds: LoginCredentials) => Promise<void>;
  onAppleLogin?: () => void;
  onGoogleLogin?: () => void;
  onForgotPassword?: () => void;
  onBack?: () => void;
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!email) {
      newErrors.email = t("login.errorEmailRequired");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("login.errorEmailInvalid");
    }

    if (!password) {
      newErrors.password = t("login.errorPasswordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("login.errorPasswordMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    if (navigator.vibrate) navigator.vibrate(10);

    try {
      await onLogin({ email, password });
    } catch {
      setErrors({ general: t("login.errorInvalidCredentials") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes login-spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #48484A; }
        input:focus { outline: none; }
      `}</style>

      <header style={styles.header}>
        <button
          type="button"
          style={styles.backButton}
          onClick={onBack}
          aria-label={t("common.back")}
        >
          <BackIcon />
        </button>
      </header>

      <main style={styles.content}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>{t("login.title")}</h1>
          <p style={styles.subtitle}>{t("login.subtitle")}</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {errors.general && (
            <div style={styles.errorBanner}>
              <span style={styles.errorBannerText}>{errors.general}</span>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("login.email")}</label>
            <div
              style={{
                ...styles.inputWrapper,
                borderColor: errors.email ? "#FF453A" : "#2C2C2E",
              }}
            >
              <MailIcon />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder={t("login.placeholderEmail")}
                style={styles.input}
                autoComplete="email"
                autoCapitalize="none"
              />
            </div>
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("login.password")}</label>
            <div
              style={{
                ...styles.inputWrapper,
                borderColor: errors.password ? "#FF453A" : "#2C2C2E",
              }}
            >
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder={t("login.placeholderPassword")}
                style={styles.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                style={styles.showPasswordButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <button
            type="button"
            style={styles.forgotButton}
            onClick={onForgotPassword}
          >
            {t("login.forgotPassword")}
          </button>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: isLoading ? 0.7 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={{ ...styles.spinner, animation: "login-spin 0.8s linear infinite" }} />
            ) : (
              t("login.submit")
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>{t("login.or")}</span>
          <div style={styles.dividerLine} />
        </div>

        <div style={styles.socialButtons}>
          <button type="button" style={styles.socialButton} onClick={onAppleLogin}>
            <AppleIcon />
            <span>{t("login.withApple")}</span>
          </button>
          <button type="button" style={styles.socialButton} onClick={onGoogleLogin}>
            <GoogleIcon />
            <span>{t("login.withGoogle")}</span>
          </button>
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          {t("login.footerPrefix")}
          <Link href="/terms" style={styles.footerLink}>
            {t("login.footerTerms")}
          </Link>
          {t("login.footerAnd")}
          <Link href="/privacy" style={styles.footerLink}>
            {t("login.footerPrivacy")}
          </Link>
        </p>
      </footer>
    </div>
  );
};

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

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
  },
  backButton: {
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    marginLeft: "-12px",
  },
  content: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  titleSection: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    margin: 0,
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "17px",
    color: "#8E8E93",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  errorBanner: {
    padding: "14px 16px",
    backgroundColor: "rgba(255,69,58,0.1)",
    borderRadius: "12px",
    border: "1px solid rgba(255,69,58,0.3)",
  },
  errorBannerText: {
    fontSize: "14px",
    color: "#FF453A",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#8E8E93",
    marginLeft: "4px",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#1C1C1E",
    borderRadius: "12px",
    border: "1px solid #2C2C2E",
    transition: "border-color 0.2s ease",
  },
  input: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "17px",
    color: "#FFFFFF",
    fontFamily: "inherit",
  },
  showPasswordButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  errorText: {
    fontSize: "13px",
    color: "#FF453A",
    marginLeft: "4px",
  },
  forgotButton: {
    alignSelf: "flex-end",
    background: "none",
    border: "none",
    fontSize: "14px",
    color: "#0A84FF",
    cursor: "pointer",
    padding: "4px 0",
    marginTop: "-8px",
  },
  submitButton: {
    width: "100%",
    padding: "18px",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "none",
    borderRadius: "14px",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s ease",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid #000000",
    borderTopColor: "transparent",
    borderRadius: "50%",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "32px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#2C2C2E",
  },
  dividerText: {
    fontSize: "14px",
    color: "#6E6E73",
  },
  socialButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  socialButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    padding: "16px",
    backgroundColor: "#1C1C1E",
    color: "#FFFFFF",
    border: "1px solid #2C2C2E",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  footer: {
    padding: "20px",
    paddingBottom: "40px",
  },
  footerText: {
    fontSize: "13px",
    color: "#6E6E73",
    textAlign: "center",
    lineHeight: 1.5,
    margin: 0,
  },
  footerLink: {
    color: "#8E8E93",
    textDecoration: "underline",
  },
};

export default LoginScreen;
