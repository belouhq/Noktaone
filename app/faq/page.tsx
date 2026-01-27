"use client";

import { useRouter } from "next/navigation";
import { FAQScreen } from "@/components/faq/FAQScreen";

/**
 * FAQ PAGE - Nokta One
 *
 * Design Tesla épuré : header, hero, accordéon FAQ, section contact, bottom nav.
 * Tous les textes passent par i18n (faq.*, nav.*, common.back).
 * Accessible depuis : Settings > FAQ — Route : /faq
 */
export default function FAQPage() {
  const router = useRouter();

  return (
    <FAQScreen
      onBack={() => router.back()}
      onContact={() => router.push("/settings")}
      onHome={() => router.push("/")}
      onSkane={() => router.push("/skane")}
      onSettings={() => router.push("/settings")}
      activeNav="settings"
    />
  );
}
