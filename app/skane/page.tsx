"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SkaneScan from "@/components/skane/SkaneScan";
import { useAuthContext } from "@/components/providers/AuthProvider";
import {
  useGuestScans,
  GuestPaywall,
  ScansRemainingBadge,
} from "@/lib/guest-scans";

export default function SkanePage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    guestState,
    loading,
    useScan,
    canScan,
    scansRemaining,
    isPremium,
    showPaywall,
  } = useGuestScans(user ? { id: user.id } : null, null);

  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const handleSkaneComplete = (selfieUrl: string) => {
    // Incrémenter le compteur après un scan réussi
    const permissionAfter = useScan();

    let imageBase64 = selfieUrl;
    if (selfieUrl.startsWith("data:image")) {
      imageBase64 = selfieUrl.split(",")[1] || selfieUrl;
    }
    sessionStorage.setItem("skane_captured_image", imageBase64);
    const isGuestMode = typeof window !== "undefined" &&
      localStorage.getItem("guestMode") === "true";
    sessionStorage.setItem("skane_guest_mode", String(isGuestMode));
    router.push("/skane/analyzing");

    // Si c'était le dernier scan gratuit, on affichera le paywall au prochain retour sur /skane
    if (
      !isPremium &&
      typeof permissionAfter.scansRemaining === "number" &&
      permissionAfter.scansRemaining <= 0
    ) {
      // Optionnel: mémoriser dans sessionStorage si besoin
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-nokta-one-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-nokta-one-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si plus de scans invités disponibles et pas Premium → paywall direct
  if (!canScan() && showPaywall && guestState) {
    return (
      <GuestPaywall
        scansUsed={guestState.scansUsed}
        maxScans={guestState.maxScans}
        onSubscribe={() => {
          router.push("/settings");
        }}
        onClose={() => {
          router.push("/");
        }}
      />
    );
  }

  return (
    <div className="relative">
      {/* Badge scans restants en haut à gauche */}
      <div className="absolute top-4 left-4 z-30">
        <ScansRemainingBadge
          scansRemaining={scansRemaining}
          isPremium={isPremium}
        />
      </div>

      <SkaneScan onSkaneComplete={handleSkaneComplete} />

      {showPaywallModal && guestState && (
        <GuestPaywall
          scansUsed={guestState.scansUsed}
          maxScans={guestState.maxScans}
          onSubscribe={() => {
            router.push("/settings");
          }}
          onClose={() => setShowPaywallModal(false)}
        />
      )}
    </div>
  );
}
