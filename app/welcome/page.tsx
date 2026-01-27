"use client";

import { useRouter } from "next/navigation";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";

/**
 * WELCOME SCREEN - Écran d'accueil / Landing NOKTA ONE
 *
 * Design Tesla épuré : headline animée, Skane Index preview, 3 features, CTAs.
 * Tous les textes passent par i18n (welcome.*).
 */
export default function WelcomePage() {
  const router = useRouter();

  const handleStart = () => {
    sessionStorage.setItem("first_skane_flow", "true");
    router.push("/skane");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <WelcomeScreen
      onStart={handleStart}
      onLogin={handleLogin}
    />
  );
}
