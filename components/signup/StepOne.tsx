"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface StepOneProps {
  firstName: string;
  lastName: string;
  username: string;
  birthDate: Date | null;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onBirthDateChange: (date: Date | null) => void;
  onNext: () => void;
}

// Usernames réservés
const RESERVED_USERNAMES = [
  'belouforreal',
  'belou',
  'nokta',
  'noktaone',
  'nokta-one',
  'admin',
  'support',
  'official'
];

// Mock usernames déjà pris par d'autres utilisateurs
const existingUsernames = ["test", "user", "demo"];

export default function StepOne({
  firstName,
  lastName,
  username,
  birthDate,
  onFirstNameChange,
  onLastNameChange,
  onUsernameChange,
  onBirthDateChange,
  onNext,
}: StepOneProps) {
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean | null;
    message: string;
  }>({ available: null, message: "" });
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Validation des caractères autorisés
  const isValidFormat = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  };

  // Vérification du username en temps réel
  useEffect(() => {
    const usernameLower = username.toLowerCase().trim();

    // Reset si vide
    if (usernameLower.length === 0) {
      setUsernameStatus({ available: null, message: "" });
      return;
    }

    // Vérification longueur minimale
    if (usernameLower.length < 3) {
      setUsernameStatus({
        available: false,
        message: "Username must be at least 3 characters",
      });
      return;
    }

    // Vérification format (lettres, chiffres, underscores uniquement)
    if (!isValidFormat(usernameLower)) {
      setUsernameStatus({
        available: false,
        message: "Only letters, numbers, and underscores allowed",
      });
      return;
    }

    // Vérification si réservé
    if (RESERVED_USERNAMES.includes(usernameLower)) {
      setUsernameStatus({
        available: false,
        message: "This username is reserved",
      });
      return;
    }

    // Vérification si déjà pris (avec délai pour éviter trop de requêtes)
    setIsCheckingUsername(true);
    const timer = setTimeout(() => {
      if (existingUsernames.includes(usernameLower)) {
        setUsernameStatus({
          available: false,
          message: "This username is already taken",
        });
      } else {
        setUsernameStatus({
          available: true,
          message: "Available",
        });
      }
      setIsCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    username.trim() !== "" &&
    usernameStatus.available === true &&
    birthDate !== null &&
    isAgeValid(birthDate);

  function isAgeValid(date: Date): boolean {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return age - 1 >= 13;
    }
    return age >= 13;
  }

  return (
    <div className="space-y-4">
      {/* Prénom */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Prénom</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-nokta-one-blue focus:outline-none text-nokta-one-white transition-colors"
          placeholder="Votre prénom"
          required
        />
      </div>

      {/* Nom */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Nom</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-nokta-one-blue focus:outline-none text-nokta-one-white transition-colors"
          placeholder="Votre nom"
          required
        />
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">@ Username</label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              // Retirer le @ si l'utilisateur le tape
              const value = e.target.value.replace(/@/g, '');
              onUsernameChange(value);
            }}
            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-nokta-one-blue focus:outline-none text-nokta-one-white transition-colors pr-12"
            placeholder="@username"
            required
          />
          {username.trim().length > 0 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCheckingUsername ? (
                <div className="w-5 h-5 border-2 border-nokta-one-blue border-t-transparent rounded-full animate-spin" />
              ) : usernameStatus.available === true ? (
                <Check size={20} className="text-green-500" />
              ) : usernameStatus.available === false ? (
                <X size={20} className="text-red-500" />
              ) : null}
            </div>
          )}
        </div>
        {usernameStatus.message && (
          <p
            className={`text-xs mt-1 ${
              usernameStatus.available === true
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {usernameStatus.message}
          </p>
        )}
      </div>

      {/* Date de naissance */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Date de naissance
        </label>
        <DatePicker
          selected={birthDate}
          onChange={(date: Date | null) => {
            if (date) {
              onBirthDateChange(date);
            }
          }}
          maxDate={new Date()}
          dateFormat="dd/MM/yyyy"
          placeholderText="JJ/MM/AAAA"
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-nokta-one-blue focus:outline-none text-nokta-one-white transition-colors"
          wrapperClassName="w-full"
          required
        />
        {birthDate && !isAgeValid(birthDate) && (
          <p className="text-xs text-red-500 mt-1">
            Vous devez avoir au moins 13 ans
          </p>
        )}
      </div>

      {/* Bouton Next */}
      <motion.button
        onClick={onNext}
        disabled={!isFormValid}
        className="w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isFormValid ? "#3B82F6" : "rgba(59, 130, 246, 0.5)",
        }}
        whileHover={isFormValid ? { scale: 1.05 } : {}}
        whileTap={isFormValid ? { scale: 0.95 } : {}}
      >
        Next
      </motion.button>
    </div>
  );
}
