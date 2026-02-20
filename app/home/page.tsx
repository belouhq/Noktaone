"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HomePage, SkanePage } from "@/components/home/HomePageV3";

/**
 * Page Accueil app – PAGES FINALES V5
 * C’est la cible du bouton « Accueil » dans la bottom nav.
 * Affiche soit HomePage (logo + bouton Skane) soit SkanePage (Skaneboard = historique récent).
 * /home?tab=skane → Skaneboard ( Historique récent, stats, Nouveau Skane)
 */
export default function HomeRoutePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [currentPage, setCurrentPage] = useState<"home" | "skane">(
    tabParam === "skane" ? "skane" : "home"
  );

  useEffect(() => {
    if (tabParam === "skane") setCurrentPage("skane");
    else if (tabParam === "home") setCurrentPage("home");
  }, [tabParam]);

  const handleNavigate = (key: string) => {
    if (key === "home") {
      setCurrentPage("home");
    } else if (key === "skane") {
      setCurrentPage("skane");
    } else if (key === "settings") {
      router.push("/settings");
    }
  };

  const handleStartSkane = () => {
    router.push("/skane");
  };

  const commonProps = {
    onStartSkane: handleStartSkane,
    onNavigate: handleNavigate,
  };

  return (
    <>
      {currentPage === "home" && (
        <HomePage
          {...commonProps}
          onHelp={() => router.push("/faq")}
        />
      )}
      {currentPage === "skane" && (
        <SkanePage {...commonProps} />
      )}
    </>
  );
}
