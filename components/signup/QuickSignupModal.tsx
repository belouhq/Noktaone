"use client";

/**
 * QuickSignupModal - Ultra Minimal (US Market)
 * 
 * Flow: SSO/Phone → @ username → Done
 * 
 * No name, no encouragements, no emojis
 * Just: account + identity
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, Phone, ChevronDown, Check, X, Loader2 } from "lucide-react";

interface QuickSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSuccess: (userId: string, username: string) => void;
}

interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  name: string;
}

// US-first
const COUNTRY_CODES: CountryCode[] = [
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "MX", dial: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "India" },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japan" },
];

// Reserved usernames
const RESERVED_USERNAMES = [
  "nokta", "noktaone", "admin", "support", "help", "official",
  "app", "api", "www", "mail", "team", "staff", "mod", "moderator"
];

type Step = "auth" | "phone" | "otp" | "username" | "done";

export default function QuickSignupModal({
  isOpen,
  onClose,
  onSkip,
  onSuccess,
}: QuickSignupModalProps) {
  // State
  const [step, setStep] = useState<Step>("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Username
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "reserved">("idle");
  const [userId, setUserId] = useState<string | null>(null);
  const usernameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("auth");
        setPhoneNumber("");
        setOtp(["", "", "", "", "", ""]);
        setError(null);
        setUsername("");
        setUsernameStatus("idle");
        setUserId(null);
      }, 300);
    }
  }, [isOpen]);

  // ========== SSO ==========
  const handleAppleSignIn = () => {
    setIsLoading(true);
    sessionStorage.setItem("auth_callback_step", "username");
    window.location.href = "/api/auth/apple";
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    sessionStorage.setItem("auth_callback_step", "username");
    window.location.href = "/api/auth/google";
  };

  // ========== Phone ==========
  const formatPhone = (value: string): string => value.replace(/\D/g, "");
  
  const getFullPhone = (): string => {
    let num = phoneNumber;
    if (num.startsWith("0")) num = num.substring(1);
    return `${selectedCountry.dial}${num}`;
  };

  const isPhoneValid = (): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    return cleaned.length >= 9 && cleaned.length <= 15;
  };

  const handleSendOTP = async () => {
    if (!isPhoneValid()) {
      setError("Enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: getFullPhone(),
          consent: smsConsent,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send code");

      sessionStorage.setItem("pending_phone", getFullPhone());
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== OTP ==========
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    paste.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    otpRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: sessionStorage.getItem("pending_phone"),
          code,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid code");

      setUserId(data.userId);
      sessionStorage.removeItem("pending_phone");
      setStep("username");
    } catch (err: any) {
      setError(err.message);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify
  useEffect(() => {
    if (otp.every((d) => d !== "") && step === "otp" && !isLoading) {
      verifyOTP();
    }
  }, [otp, step]);

  // ========== Username ==========
  const validateUsernameFormat = (value: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  };

  const checkUsername = async (value: string) => {
    if (!validateUsernameFormat(value)) {
      setUsernameStatus("invalid");
      return;
    }

    if (RESERVED_USERNAMES.includes(value.toLowerCase())) {
      setUsernameStatus("reserved");
      return;
    }

    setUsernameStatus("checking");

    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
      const data = await response.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  };

  const handleUsernameChange = (value: string) => {
    // Remove @ if typed, lowercase, remove spaces
    const cleaned = value.replace("@", "").toLowerCase().replace(/\s/g, "");
    setUsername(cleaned);
    setUsernameStatus("idle");

    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }

    if (cleaned.length >= 3) {
      usernameCheckTimeout.current = setTimeout(() => {
        checkUsername(cleaned);
      }, 400);
    }
  };

  const handleSaveUsername = async () => {
    if (usernameStatus !== "available" || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, username }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save username");

      setStep("done");
      setTimeout(() => onSuccess(userId, username), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== Render ==========
  if (!isOpen) return null;

  const usernameMessage = {
    idle: "",
    checking: "Checking...",
    available: "Available",
    taken: "Already taken",
    invalid: "3-20 characters, letters, numbers, underscore only",
    reserved: "This username is reserved",
  };

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
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* ===== STEP: AUTH ===== */}
          {step === "auth" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8 pt-4">
                <h2 className="text-2xl font-semibold text-white mb-2">Create your account</h2>
                <p className="text-gray-400">Save your results and track progress</p>
              </div>

              <button
                onClick={handleAppleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white text-black font-semibold mb-3 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                <Apple size={20} />
                Continue with Apple
              </button>

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white/10 text-white font-semibold mb-6 hover:bg-white/15 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-4 text-sm text-gray-500 bg-[#0A0A0F]">or</span>
              </div>

              <button
                onClick={() => setStep("phone")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
              >
                <Phone size={18} />
                Continue with phone
              </button>

              <button
                onClick={onSkip}
                className="w-full mt-6 py-3 text-gray-500 text-sm hover:text-gray-400"
              >
                Skip for now
              </button>

              <p className="text-center text-xs text-gray-600 mt-4">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-gray-400 hover:underline">Terms</a>
                {" "}and{" "}
                <a href="/privacy" className="text-gray-400 hover:underline">Privacy Policy</a>
              </p>
            </motion.div>
          )}

          {/* ===== STEP: PHONE ===== */}
          {step === "phone" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <button onClick={() => setStep("auth")} className="text-gray-400 hover:text-white mb-4 text-sm">
                ← Back
              </button>

              <h2 className="text-xl font-semibold text-white mb-6">Enter your phone number</h2>

              <div className="flex gap-2 mb-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                    className="flex items-center gap-2 px-3 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-white text-sm">{selectedCountry.dial}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showCountryPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 max-h-60 overflow-y-auto bg-[#1A1A1F] border border-white/10 rounded-xl shadow-xl z-10"
                      >
                        {COUNTRY_CODES.map((country) => (
                          <button
                            key={`${country.code}-${country.dial}`}
                            onClick={() => { setSelectedCountry(country); setShowCountryPicker(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5"
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="text-white text-sm flex-1 text-left">{country.name}</span>
                            <span className="text-gray-400 text-sm">{country.dial}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  className="flex-1 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-white text-lg"
                  autoFocus
                />
              </div>

              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${smsConsent ? "bg-blue-500 border-blue-500" : "border-gray-500"}`}>
                    {smsConsent && <Check size={14} className="text-white" />}
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  Send me daily reset reminders. Reply STOP to unsubscribe.
                </span>
              </label>

              {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

              <button
                onClick={handleSendOTP}
                disabled={!isPhoneValid() || isLoading}
                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Send code"}
              </button>
            </motion.div>
          )}

          {/* ===== STEP: OTP ===== */}
          {step === "otp" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Enter code</h2>
              <p className="text-gray-400 text-sm mb-6">Sent to {getFullPhone()}</p>

              <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-white"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Verifying...</span>
                </div>
              )}

              <button onClick={handleSendOTP} disabled={isLoading} className="text-blue-400 text-sm hover:underline">
                Resend code
              </button>
              <button onClick={() => setStep("phone")} className="block w-full mt-4 py-3 text-gray-500 text-sm hover:text-gray-400">
                ← Change number
              </button>
            </motion.div>
          )}

          {/* ===== STEP: USERNAME ===== */}
          {step === "username" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Choose your @</h2>
                <p className="text-gray-400 text-sm">This is your unique identifier on Nokta</p>
              </div>

              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="username"
                  className="w-full pl-10 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-white text-lg"
                  autoFocus
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {username.length >= 3 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && (
                      <Loader2 size={20} className="text-gray-400 animate-spin" />
                    )}
                    {usernameStatus === "available" && (
                      <Check size={20} className="text-green-500" />
                    )}
                    {(usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "reserved") && (
                      <X size={20} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>

              <p className={`text-sm mb-6 h-5 ${
                usernameStatus === "available" ? "text-green-500" :
                usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "reserved" ? "text-red-400" :
                "text-gray-500"
              }`}>
                {usernameMessage[usernameStatus]}
              </p>

              {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

              <button
                onClick={handleSaveUsername}
                disabled={usernameStatus !== "available" || isLoading}
                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Done"}
              </button>
            </motion.div>
          )}

          {/* ===== STEP: DONE ===== */}
          {step === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <Check className="text-green-400" size={40} />
              </motion.div>

              <p className="text-xl text-white font-medium">@{username}</p>
              <p className="text-gray-400 mt-2">Account created</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
