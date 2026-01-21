"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, Phone, ChevronDown, Check, X, Loader2 } from "lucide-react";

// Types
interface QuickSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSuccess: (userId: string) => void;
  skaneData?: {
    beforeScore: number;
    afterScore: number;
    actionLabel: string;
  };
}

interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  name: string;
}

// Codes pays les plus courants
const COUNTRY_CODES: CountryCode[] = [
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "États-Unis" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "Royaume-Uni" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Allemagne" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espagne" },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italie" },
  { code: "BE", dial: "+32", flag: "🇧🇪", name: "Belgique" },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Suisse" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc" },
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal" },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "MG", dial: "+261", flag: "🇲🇬", name: "Madagascar" },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brésil" },
  { code: "MX", dial: "+52", flag: "🇲🇽", name: "Mexique" },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japon" },
  { code: "KR", dial: "+82", flag: "🇰🇷", name: "Corée du Sud" },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "Inde" },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "Émirats arabes unis" },
];

type Step = "phone" | "otp" | "success";

export default function QuickSignupModal({
  isOpen,
  onClose,
  onSkip,
  onSuccess,
  skaneData,
}: QuickSignupModalProps) {
  // État principal
  const [step, setStep] = useState<Step>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone input
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [smsConsent, setSmsConsent] = useState(true); // Pré-coché pour UX mais explicite

  // OTP input
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-detect country from browser
  useEffect(() => {
    const detectCountry = () => {
      const lang = navigator.language || "fr-FR";
      const countryCode = lang.split("-")[1] || "FR";
      const found = COUNTRY_CODES.find((c) => c.code === countryCode);
      if (found) setSelectedCountry(found);
    };
    detectCountry();
  }, []);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep("phone");
      setPhoneNumber("");
      setOtp(["", "", "", "", "", ""]);
      setError(null);
    }
  }, [isOpen]);

  // Format phone number (remove spaces, dashes)
  const formatPhoneInput = (value: string): string => {
    // Garde uniquement les chiffres
    return value.replace(/\D/g, "");
  };

  // Full phone number for API
  const getFullPhoneNumber = (): string => {
    let number = phoneNumber;
    // Si commence par 0, le retirer (format local FR par ex)
    if (number.startsWith("0")) {
      number = number.substring(1);
    }
    return `${selectedCountry.dial}${number}`;
  };

  // Validate phone format
  const isPhoneValid = (): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    // Minimum 8 chiffres, maximum 15
    return cleaned.length >= 8 && cleaned.length <= 15;
  };

  // Handle phone submission
  const handleSendOTP = async () => {
    if (!isPhoneValid()) {
      setError("Numéro de téléphone invalide");
      return;
    }

    if (!smsConsent) {
      setError("Veuillez accepter de recevoir des SMS pour continuer");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullPhone = getFullPhoneNumber();

      // Sauvegarder le skane en attente si présent
      if (skaneData) {
        sessionStorage.setItem("pending_skane", JSON.stringify(skaneData));
      }

      // Appel API pour envoyer OTP
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          consent: smsConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du code");
      }

      // Stocker le phone pour vérification
      sessionStorage.setItem("pending_phone", fullPhone);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Si paste de plusieurs chiffres
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus sur le dernier champ rempli ou le suivant
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      // Input normal
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, "");
      setOtp(newOtp);

      // Auto-focus next
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle OTP keydown (backspace)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Veuillez entrer le code à 6 chiffres");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const phone = sessionStorage.getItem("pending_phone");

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Code invalide");
      }

      // Succès - associer le skane pending si présent
      const pendingSkane = sessionStorage.getItem("pending_skane");
      if (pendingSkane && data.userId) {
        await fetch("/api/skane/associate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.userId,
            skaneData: JSON.parse(pendingSkane),
          }),
        });
        sessionStorage.removeItem("pending_skane");
      }

      sessionStorage.removeItem("pending_phone");
      setStep("success");

      // Callback après animation
      setTimeout(() => {
        onSuccess(data.userId);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Code invalide");
      // Reset OTP
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (otp.every((d) => d !== "") && step === "otp" && !isLoading) {
      handleVerifyOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step]);

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError(null);
    await handleSendOTP();
  };

  // Social auth handlers
  const handleSocialAuth = async (provider: "apple" | "google") => {
    setIsLoading(true);
    if (skaneData) {
      sessionStorage.setItem("pending_skane", JSON.stringify(skaneData));
    }
    // Redirect to OAuth provider via Supabase
    window.location.href = `/api/auth/${provider}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#0A0A0F] rounded-t-3xl sm:rounded-3xl p-6 pb-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Step: Phone Input */}
          {step === "phone" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Header avec résultat du skane */}
              {skaneData && (
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold">
                    <span className="text-gray-400">{skaneData.beforeScore}</span>
                    <span className="text-gray-600 mx-2">→</span>
                    <span className="text-nokta-one-blue">{skaneData.afterScore}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Sauvegardez votre reset et recevez vos rappels
                  </p>
                </div>
              )}

              {!skaneData && (
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Créer un compte
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Recevez vos rappels de reset par SMS
                  </p>
                </div>
              )}

              {/* Phone Input */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Numéro de téléphone
                </label>
                <div className="flex gap-2">
                  {/* Country Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker(!showCountryPicker)}
                      className="flex items-center gap-2 px-3 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="text-white text-sm">{selectedCountry.dial}</span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {/* Country Dropdown */}
                    <AnimatePresence>
                      {showCountryPicker && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setShowCountryPicker(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-2 w-64 max-h-60 overflow-y-auto bg-[#1A1A1F] border border-white/10 rounded-xl shadow-xl z-50"
                          >
                            {COUNTRY_CODES.map((country) => (
                              <button
                                key={country.code}
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setShowCountryPicker(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                              >
                                <span className="text-xl">{country.flag}</span>
                                <span className="text-white text-sm flex-1 text-left">
                                  {country.name}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {country.dial}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneInput(e.target.value))}
                    placeholder="6 12 34 56 78"
                    className="flex-1 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none text-white text-lg tracking-wider"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* SMS Consent Checkbox - OBLIGATOIRE LÉGALEMENT */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      smsConsent
                        ? "bg-nokta-one-blue border-nokta-one-blue"
                        : "border-gray-500 group-hover:border-gray-400"
                    }`}
                  >
                    {smsConsent && <Check size={14} className="text-white" />}
                  </div>
                </div>
                <span className="text-sm text-gray-400 leading-tight">
                  J'accepte de recevoir des rappels de bien-être par SMS (1-2/jour max).{" "}
                  <span className="text-gray-500">Répondez STOP pour vous désinscrire.</span>
                </span>
              </label>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center mb-4"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSendOTP}
                disabled={!isPhoneValid() || !smsConsent || isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-nokta-one-blue text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nokta-one-blue/90 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Phone size={20} />
                    Recevoir le code
                  </>
                )}
              </button>

              {/* Separator */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-4 text-sm text-gray-500 bg-[#0A0A0F]">
                  ou
                </span>
              </div>

              {/* Social Auth */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleSocialAuth("apple")}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Apple size={18} />
                  Apple
                </button>
                <button
                  onClick={() => handleSocialAuth("google")}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </div>

              {/* Skip */}
              <button
                onClick={onSkip}
                className="w-full mt-6 py-3 text-gray-500 text-sm hover:text-gray-400 transition-colors"
              >
                Plus tard
              </button>
            </motion.div>
          )}

          {/* Step: OTP Verification */}
          {step === "otp" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-nokta-one-blue/20 flex items-center justify-center">
                <Phone className="text-nokta-one-blue" size={28} />
              </div>

              <h2 className="text-xl font-semibold text-white mb-2">
                Vérification
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Code envoyé au {getFullPhoneNumber()}
              </p>

              {/* OTP Input */}
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none text-white"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mb-4"
                >
                  {error}
                </motion.p>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Vérification...</span>
                </div>
              )}

              {/* Resend */}
              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-nokta-one-blue text-sm hover:underline disabled:opacity-50"
              >
                Renvoyer le code
              </button>

              {/* Back */}
              <button
                onClick={() => setStep("phone")}
                className="block w-full mt-4 py-3 text-gray-500 text-sm hover:text-gray-400 transition-colors"
              >
                ← Modifier le numéro
              </button>
            </motion.div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <Check className="text-green-500" size={40} />
              </motion.div>

              <h2 className="text-xl font-semibold text-white mb-2">
                Bienvenue sur Nokta One
              </h2>
              <p className="text-gray-400">
                Votre compte est créé
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
