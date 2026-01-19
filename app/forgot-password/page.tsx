"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * FORGOT PASSWORD PAGE - Récupération de mot de passe
 * 
 * Route : /forgot-password
 * 
 * Flow :
 * 1. Entrer email
 * 2. Recevoir email avec lien de reset
 * 3. Confirmation
 */

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError(getTranslation("forgotPassword.errorRequired", "L'email est requis"));
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(getTranslation("forgotPassword.errorInvalid", "Email invalide"));
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Intégrer avec Supabase Auth
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: `${window.location.origin}/reset-password`,
      // });
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      
    } catch (err: any) {
      setError(err.message || getTranslation("forgotPassword.errorGeneric", "Une erreur est survenue"));
    } finally {
      setIsLoading(false);
    }
  };

  // Écran de succès
  if (isSuccess) {
    return (
      <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mb-8"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "2px solid rgba(16, 185, 129, 0.4)",
            }}
          >
            <CheckCircle size={40} className="text-green-500" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-nokta-one-white text-center mb-4"
        >
          {getTranslation("forgotPassword.successTitle", "Email envoyé !")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-center mb-8 max-w-sm"
        >
          {getTranslation("forgotPassword.successMessage", `Nous avons envoyé un lien de réinitialisation à ${email}. Vérifie ta boîte de réception.`).replace("${email}", email)}
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push("/login")}
          className="py-4 px-8 rounded-xl text-lg font-semibold text-white"
          style={{
            background: "#3B82F6",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {getTranslation("forgotPassword.backToLogin", "Retour à la connexion")}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500 mt-6"
        >
          {getTranslation("forgotPassword.noEmail", "Pas reçu ?")}
          {" "}
          <button
            onClick={() => setIsSuccess(false)}
            className="text-nokta-one-blue"
          >
            {getTranslation("forgotPassword.resend", "Renvoyer")}
          </button>
        </motion.p>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-6">
        <motion.button
          onClick={() => router.back()}
          className="p-2 -ml-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={24} className="text-nokta-one-white" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-nokta-one-white mb-2">
            {getTranslation("forgotPassword.title", "Mot de passe oublié ?")}
          </h1>
          <p className="text-gray-400">
            {getTranslation(
              "forgotPassword.subtitle",
              "Entre ton email et on t'envoie un lien pour le réinitialiser."
            )}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {getTranslation("forgotPassword.email", "Email")}
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="w-full pl-12 pr-4 py-4 rounded-xl text-nokta-one-white placeholder-gray-500"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl text-lg font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: isLoading ? "rgba(59, 130, 246, 0.5)" : "#3B82F6",
              boxShadow: isLoading ? "none" : "0 4px 20px rgba(59, 130, 246, 0.4)",
            }}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {getTranslation("forgotPassword.sending", "Envoi...")}
              </>
            ) : (
              getTranslation("forgotPassword.submit", "Envoyer le lien")
            )}
          </motion.button>
        </motion.form>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center pb-8"
        >
          <button
            onClick={() => router.push("/login")}
            className="text-gray-400"
          >
            {getTranslation("forgotPassword.rememberPassword", "Tu te souviens ?")}
            {" "}
            <span className="text-nokta-one-blue font-medium">
              {getTranslation("forgotPassword.login", "Se connecter")}
            </span>
          </button>
        </motion.div>
      </div>
    </main>
  );
}
