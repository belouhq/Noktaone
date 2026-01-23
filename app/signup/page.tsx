"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StepIndicator from "@/components/signup/StepIndicator";
import StepOne from "@/components/signup/StepOne";
import StepTwo from "@/components/signup/StepTwo";
import StepThree from "@/components/signup/StepThree";

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [occupation, setOccupation] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Générer le code de parrainage quand le username est disponible
  useEffect(() => {
    if (username) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      setReferralCode(`@${username}-${randomDigits}`);
    }
  }, [username]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = () => {
    // Générer le code de parrainage final
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const finalReferralCode = `@${username}-${randomDigits}`;

    // Importer le mapper CSP pour déterminer la catégorie
    const { mapOccupationToCSP } = await import("@/lib/utils/csp-mapper");
    const cspMapping = occupation ? mapOccupationToCSP(occupation) : null;

    // Sauvegarder dans localStorage (mock DB)
    const userData = {
      firstName,
      lastName,
      username,
      birthDate: birthDate?.toISOString(),
      email,
      country,
      language,
      occupation: occupation || null,
      cspCategory: cspMapping?.category || null,
      cspLabel: cspMapping?.label || null,
      notificationsEnabled,
      referralCode: finalReferralCode,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("notificationsEnabled", notificationsEnabled.toString());
    localStorage.setItem("selectedLanguage", language);

    // Afficher le toast
    setShowToast(true);

    // Rediriger vers l'onboarding après l'inscription
    setTimeout(() => {
      router.push("/onboarding/continue");
    }, 2000);
  };

  return (
    <main className="relative min-h-screen bg-nokta-one-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <StepOne
                firstName={firstName}
                lastName={lastName}
                username={username}
                birthDate={birthDate}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onUsernameChange={setUsername}
                onBirthDateChange={setBirthDate}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <StepTwo
                email={email}
                country={country}
                language={language}
                occupation={occupation}
                onEmailChange={setEmail}
                onCountryChange={setCountry}
                onLanguageChange={setLanguage}
                onOccupationChange={setOccupation}
                onNext={handleNext}
              />
            )}

            {currentStep === 3 && (
              <StepThree
                notificationsEnabled={notificationsEnabled}
                referralCode={referralCode || `@${username}-${Math.floor(1000 + Math.random() * 9000)}`}
                onNotificationsToggle={setNotificationsEnabled}
                onSubmit={handleSubmit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Toast de confirmation */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl bg-nokta-one-blue text-white font-medium z-50"
          >
            Compte créé avec succès !
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
