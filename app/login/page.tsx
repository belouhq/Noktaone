"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * LOGIN PAGE - Connexion pour utilisateurs existants
 * 
 * Route : /login
 * 
 * Fonctionnalités :
 * - Email + mot de passe
 * - Social login (Apple, Google) - préparé
 * - Lien vers signup
 * - Mot de passe oublié
 */

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError(getTranslation("login.errorRequired", "Tous les champs sont requis"));
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Intégrer avec Supabase Auth
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });
      
      // Simulation pour le moment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Si succès, rediriger vers la home
      localStorage.setItem("isLoggedIn", "true");
      router.push("/");
      
    } catch (err: any) {
      setError(err.message || getTranslation("login.errorGeneric", "Erreur de connexion"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "apple" | "google") => {
    setIsLoading(true);
    try {
      // TODO: Intégrer avec Supabase Auth
      // const { data, error } = await supabase.auth.signInWithOAuth({
      //   provider: provider,
      // });
      
      console.log(`Login with ${provider}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
            {getTranslation("login.title", "Content de te revoir")}
          </h1>
          <p className="text-gray-400">
            {getTranslation("login.subtitle", "Connecte-toi pour continuer")}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleLogin}
          className="space-y-4"
        >
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {getTranslation("login.email", "Email")}
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="glass-input w-full pl-12 pr-4 py-4 text-white"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {getTranslation("login.password", "Mot de passe")}
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full pl-12 pr-12 py-4 text-white"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-nokta-one-blue"
            >
              {getTranslation("login.forgotPassword", "Mot de passe oublié ?")}
            </button>
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
            className="glass-button-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {getTranslation("login.loading", "Connexion...")}
              </>
            ) : (
              getTranslation("login.submit", "Se connecter")
            )}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-sm">
            {getTranslation("login.or", "ou")}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Apple */}
          <button
            onClick={() => handleSocialLogin("apple")}
            disabled={isLoading}
            className="glass-button-secondary w-full py-4 flex items-center justify-center gap-3 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {getTranslation("login.withApple", "Continuer avec Apple")}
          </button>

          {/* Google */}
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            className="glass-button-secondary w-full py-4 flex items-center justify-center gap-3 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {getTranslation("login.withGoogle", "Continuer avec Google")}
          </button>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center pb-8"
        >
          <p className="text-gray-400">
            {getTranslation("login.noAccount", "Pas encore de compte ?")}{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-nokta-one-blue font-medium"
            >
              {getTranslation("login.signUp", "Créer un compte")}
            </button>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
