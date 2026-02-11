"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";

function getAdaptationDay(): number {
  if (typeof window === 'undefined') return 0;
  const startDateStr = localStorage.getItem("adaptation_start_date");
  if (!startDateStr) return 0;
  
  const startDate = new Date(startDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.min(diffDays, 7);
}

export default function Home() {
  const router = useRouter();

  // Garder la logique d'adaptation : si l'onboarding est terminé et qu'on est en phase d'adaptation,
  // on envoie directement sur /home-adaptation au lieu du welcome.
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    const adaptationExited = sessionStorage.getItem("adaptation_exited");

    if (onboardingCompleted && !adaptationExited) {
      const day = getAdaptationDay();
      if (day > 0 && day <= 7) {
        router.push("/home-adaptation");
      }
    }
  }, [router]);

  return (
    <WelcomeScreen
      onStart={() => {
        // Marquer que le flow premier Skane est lancé
        if (typeof window !== "undefined") {
          sessionStorage.setItem("first_skane_flow", "true");
        }
        router.push("/skane");
      }}
      onLogin={() => router.push("/login")}
    />
  );
}
