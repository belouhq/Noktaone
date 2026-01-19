"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Upload } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { LANGUAGES } from "@/lib/i18n/languages";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    language?: string;
    occupation?: string;
    avatar?: string;
  };
}

const genders = ["Homme", "Femme", "Autre", "Préfère ne pas dire"];

const languages = LANGUAGES;

// Liste des pays avec drapeaux (simplifiée)
const countries = [
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
];

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditProfileModalProps) {
  const { currentLanguage, changeLanguage } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "Benjamin",
    lastName: initialData?.lastName || "Bel",
    username: initialData?.username || "belouforreal",
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth)
      : new Date("1993-01-15"),
    gender: initialData?.gender || "Homme",
    email: initialData?.email || "benjamin@noktaone.app",
    phone: initialData?.phone || "+33612345678",
    address: initialData?.address || "12 Rue de la République",
    postalCode: initialData?.postalCode || "75001",
    city: initialData?.city || "Paris",
    country: initialData?.country || "FR",
    language: initialData?.language || currentLanguage || "fr",
    occupation: initialData?.occupation || "Entrepreneur",
    avatar: initialData?.avatar || "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar || null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const data = initialData || {};
      setFormData({
        firstName: data.firstName || "Benjamin",
        lastName: data.lastName || "Bel",
        username: data.username || "belouforreal",
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : new Date("1993-01-15"),
        gender: data.gender || "Homme",
        email: data.email || "benjamin@noktaone.app",
        phone: data.phone || "+33612345678",
        address: data.address || "12 Rue de la République",
        postalCode: data.postalCode || "75001",
        city: data.city || "Paris",
        country: data.country || "FR",
        language: data.language || currentLanguage || "fr",
        occupation: data.occupation || "Entrepreneur",
        avatar: data.avatar || "",
      });
      setAvatarPreview(data.avatar || null);
      setErrors({});
    }
  }, [isOpen, initialData, currentLanguage]);

  const handleInputChange = async (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Synchroniser avec i18n si c'est la langue qui change
    if (field === "language" && typeof value === "string") {
      await changeLanguage(value);
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "L'image ne doit pas dépasser 5MB",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "La date de naissance est requise";
    } else {
      const age = new Date().getFullYear() - formData.dateOfBirth.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = "Vous devez avoir au moins 13 ans";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
    }

    if (formData.phone && formData.phone.length < 8) {
      newErrors.phone = "Numéro de téléphone invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Save to localStorage (mock)
    const savedData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth.toISOString().split("T")[0],
    };
    localStorage.setItem("userProfile", JSON.stringify(savedData));

    // Show toast (you can implement a toast system later)
    console.log("Profil mis à jour !");

    onSave(savedData);
    setIsSaving(false);
    onClose();
  };

  const selectedLanguage = languages.find((l) => l.code === formData.language);
  const selectedCountry = countries.find((c) => c.code === formData.country);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-[600px] max-h-[90vh] rounded-3xl p-8 overflow-y-auto"
              style={{
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-nokta-one-white" />
              </button>

              {/* Header */}
              <h2 className="text-xl font-semibold text-nokta-one-white mb-6">
                Modifier mon profil
              </h2>

              {/* Section Photo de profil */}
              <div className="mb-8">
                <h3 className="text-sm uppercase text-gray-400 mb-4">
                  PHOTO DE PROFIL
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/10">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-nokta-one-white" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-nokta-one-white text-sm font-medium"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Changer la photo
                    </motion.button>
                    {errors.avatar && (
                      <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Informations personnelles */}
              <div className="mb-8">
                <h3 className="text-sm uppercase text-gray-400 mb-4">
                  INFORMATIONS PERSONNELLES
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                      placeholder="Prénom"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                      placeholder="Nom"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    @ Username
                  </label>
                  <input
                    type="text"
                    value={`@${formData.username}`}
                    disabled
                    className="w-full px-4 py-3 rounded-xl text-gray-500 bg-white/5 border border-white/10 cursor-not-allowed"
                    title="Non modifiable"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Date de naissance <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.dateOfBirth}
                    onChange={(date: Date | null) => {
                      if (date) {
                        handleInputChange("dateOfBirth", date);
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                    wrapperClassName="w-full"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Genre</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                  >
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section Coordonnées */}
              <div className="mb-8">
                <h3 className="text-sm uppercase text-gray-400 mb-4">
                  COORDONNÉES
                </h3>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Téléphone
                  </label>
                  <PhoneInput
                    country={"fr"}
                    value={formData.phone}
                    onChange={(value) => handleInputChange("phone", value)}
                    inputStyle={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#FFFFFF",
                    }}
                    buttonStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                    containerStyle={{
                      width: "100%",
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                    placeholder="12 Rue de la République"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                      placeholder="75001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Ville</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                      placeholder="Paris"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Pays</label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section Préférences */}
              <div className="mb-8">
                <h3 className="text-sm uppercase text-gray-400 mb-4">
                  PRÉFÉRENCES
                </h3>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Langue</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange("language", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Occupation (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-nokta-one-white bg-white/5 border border-white/10 focus:border-nokta-one-blue focus:outline-none"
                    placeholder="Ex: Entrepreneur"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-4 justify-end">
                <motion.button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-nokta-one-white font-medium"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl text-nokta-one-white font-medium"
                  style={{
                    background: isSaving
                      ? "rgba(59, 130, 246, 0.5)"
                      : "#3B82F6",
                  }}
                  whileHover={{ scale: isSaving ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving ? 1 : 0.98 }}
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
