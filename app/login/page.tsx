"use client";

import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/login/LoginScreen";

/**
 * LOGIN PAGE - Écran de connexion NOKTA ONE
 *
 * Design Tesla épuré : formulaire email/mot de passe, validation, Apple/Google, footer.
 * Tous les textes passent par i18n (login.*, common.back).
 */
export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    // TODO: Intégrer avec Supabase Auth
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    localStorage.setItem("isLoggedIn", "true");
    router.push("/");
  };

  const handleAppleLogin = async () => {
    // TODO: Supabase OAuth Apple
    console.log("Login with apple");
  };

  const handleGoogleLogin = async () => {
    // TODO: Supabase OAuth Google
    console.log("Login with google");
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onAppleLogin={handleAppleLogin}
      onGoogleLogin={handleGoogleLogin}
      onForgotPassword={() => router.push("/forgot-password")}
      onBack={() => router.back()}
    />
  );
}
