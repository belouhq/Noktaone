"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, ArrowRight, Apple, Chrome } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useAuthContext } from "@/components/providers/AuthProvider";

interface QuickSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSuccess: (userId: string) => void;
  skaneData: {
    beforeScore: number;
    afterScore: number;
    actionLabel: string;
  };
}

type Step = "phone" | "otp";

export default function QuickSignupModal({
  isOpen,
  onClose,
  onSkip,
  onSuccess,
  skaneData,
}: QuickSignupModalProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+33");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentSMS, setConsentSMS] = useState(true);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setOtp("");
      setError(null);
    }
  }, [isOpen]);

  // If user is already authenticated, close modal
  useEffect(() => {
    if (user && isOpen) {
      onSuccess(user.id);
    }
  }, [user, isOpen, onSuccess]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format French phone: 0612345678 -> 06 12 34 56 78
    if (countryCode === "+33" && digits.length <= 10) {
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
      if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
    }
    
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError(null);
  };

  const handleSendOTP = async () => {
    if (!phone || phone.replace(/\s/g, "").length < 8) {
      setError(t("quickSignup.invalidPhone", "Numéro invalide"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullPhone = `${countryCode}${phone.replace(/\s/g, "")}`;
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          consent: consentSMS,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("quickSignup.sendOTPError", "Erreur lors de l'envoi"));
      }

      setStep("otp");
    } catch (err: any) {
      setError(err.message || t("quickSignup.sendOTPError", "Erreur lors de l'envoi"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError(t("quickSignup.invalidOTP", "Code invalide"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullPhone = `${countryCode}${phone.replace(/\s/g, "")}`;
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          code: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("quickSignup.verifyOTPError", "Code incorrect"));
      }

      // Success - user is now authenticated
      onSuccess(data.userId);
    } catch (err: any) {
      setError(err.message || t("quickSignup.verifyOTPError", "Code incorrect"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "apple" | "google") => {
    setIsLoading(true);
    setError(null);

    try {
      // Redirect to OAuth provider
      const { supabase } = await import("@/lib/supabase/client");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || t("quickSignup.oauthError", "Erreur d'authentification"));
      setIsLoading(false);
    }
  };

  const delta = skaneData.beforeScore - skaneData.afterScore;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-nokta-one-black rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Success message */}
            <div className="text-center mb-4">
              <p className="text-white/90 text-lg font-semibold mb-1">
                {delta > 0 ? `${skaneData.beforeScore} → ${skaneData.afterScore}` : t("quickSignup.saveYourReset", "Sauvegardez votre reset")}
              </p>
              <p className="text-white/60 text-sm">
                {t("quickSignup.saveAndReminders", "Sauvegardez votre reset et recevez vos rappels")}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Phone input */}
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">
                      {t("quickSignup.phoneNumber", "Numéro de téléphone")}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+34">🇪🇸 +34</option>
                      </select>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder={t("quickSignup.phonePlaceholder", "6 12 34 56 78")}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={countryCode === "+33" ? 14 : 15}
                      />
                      <button
                        onClick={handleSendOTP}
                        disabled={isLoading || !phone || phone.replace(/\s/g, "").length < 8}
                        className="px-4 py-3 rounded-xl bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>

                  {/* SMS Consent */}
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentSMS}
                      onChange={(e) => setConsentSMS(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-white/70 text-xs flex-1">
                      {t("quickSignup.smsConsent", "J'accepte de recevoir des rappels SMS")}
                    </span>
                  </label>

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/40 text-xs">
                      {t("quickSignup.or", "ou")}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* OAuth buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleOAuth("apple")}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <Apple size={18} />
                      <span className="text-sm font-medium">Apple</span>
                    </button>
                    <button
                      onClick={() => handleOAuth("google")}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <Chrome size={18} />
                      <span className="text-sm font-medium">Google</span>
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Skip */}
                  <button
                    onClick={onSkip}
                    className="w-full py-3 text-white/40 text-sm hover:text-white/60 transition-colors"
                  >
                    {t("quickSignup.later", "Plus tard")}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <p className="text-white/90 text-sm mb-1">
                      {t("quickSignup.otpSent", "Code envoyé à")}
                    </p>
                    <p className="text-white/60 text-xs">
                      {countryCode} {phone}
                    </p>
                  </div>

                  {/* OTP input */}
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">
                      {t("quickSignup.enterCode", "Entrez le code à 6 chiffres")}
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(value);
                        setError(null);
                      }}
                      placeholder="123456"
                      className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Verify button */}
                  <button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  >
                    {isLoading
                      ? t("quickSignup.verifying", "Vérification...")
                      : t("quickSignup.verify", "Vérifier")}
                  </button>

                  {/* Back */}
                  <button
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError(null);
                    }}
                    className="w-full py-2 text-white/40 text-sm hover:text-white/60 transition-colors"
                  >
                    {t("quickSignup.changeNumber", "Changer de numéro")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
