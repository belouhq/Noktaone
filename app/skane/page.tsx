"use client";

import { useRouter } from "next/navigation";
import SkaneScan from "@/components/skane/SkaneScan";

export default function SkanePage() {
  const router = useRouter();

  const handleSkaneComplete = (selfieUrl: string) => {
    let imageBase64 = selfieUrl;
    if (selfieUrl.startsWith("data:image")) {
      imageBase64 = selfieUrl.split(",")[1] || selfieUrl;
    }
    sessionStorage.setItem("skane_captured_image", imageBase64);
    const isGuestMode = localStorage.getItem("guestMode") === "true";
    sessionStorage.setItem("skane_guest_mode", String(isGuestMode));
    // Toujours analyser puis aller aux indications (briefing) ; pas de route flowV1/analyzing
    router.push("/skane/analyzing");
  };

  return (
    <SkaneScan 
      onSkaneComplete={handleSkaneComplete}
    />
  );
}
