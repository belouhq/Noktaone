"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import LanguageModal from "@/components/modals/LanguageModal";
import { getLanguageByCode, LANGUAGES } from "@/lib/i18n/languages";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { t: tRaw } = useI18nTranslation();
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const currentLanguageOption = getLanguageByCode(currentLanguage) || LANGUAGES[0];
  const sectionsValue = tRaw("privacyPolicyPage.sections", { returnObjects: true }) as Record<
    string,
    { title: string; content: string; icon?: string }
  >;
  const sections =
    sectionsValue && typeof sectionsValue === "object" ? sectionsValue : {};
  const orderedSections = Object.keys(sections)
    .sort()
    .map((key) => sections[key]);

  const handleLanguageSelect = async (newLang: string) => {
    if (newLang === currentLanguage) return;
    await changeLanguage(newLang);
  };

  return (
    <SafeAreaContainer showNav={false}>
      <main className="relative min-h-screen bg-nokta-one-black">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-nokta-one-black/90 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-4">
            <motion.button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label={t("common.back")}
            >
              <ArrowLeft size={24} className="text-nokta-one-white" />
            </motion.button>
            
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-nokta-one-blue" />
              <h1 className="text-lg font-semibold text-nokta-one-white">
                {t("privacyPolicyPage.title")}
              </h1>
            </div>

            {/* Language Toggle */}
            <motion.button
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              aria-label={t("settings.language")}
            >
              <Globe size={14} className="text-gray-400" />
              <span className="text-nokta-one-white uppercase">
                {currentLanguageOption.flag} {currentLanguageOption.code.toUpperCase()}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 pb-24">
          <LanguageModal
            isOpen={isLanguageModalOpen}
            onClose={() => setIsLanguageModalOpen(false)}
            selectedLanguage={currentLanguage}
            onSelectLanguage={handleLanguageSelect}
          />
          <div 
            className="prose prose-invert prose-sm max-w-none"
            style={{
              "--tw-prose-headings": "rgb(255, 255, 255)",
              "--tw-prose-body": "rgb(156, 163, 175)",
              "--tw-prose-bold": "rgb(255, 255, 255)",
              "--tw-prose-links": "rgb(59, 130, 246)",
            } as React.CSSProperties}
          >
            {/* Version & Date */}
            <div 
              className="mb-6 p-4 rounded-xl"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <p className="text-sm text-gray-300 m-0">
                <strong>{t("privacyPolicyPage.versionLabel")}:</strong> {t("privacyPolicyPage.versionValue")}
                <br />
                <strong>{t("privacyPolicyPage.updatedLabel")}:</strong> {t("privacyPolicyPage.updatedValue")}
              </p>
            </div>

            {/* Render content sections */}
            {orderedSections.map((section, index) => (
              <section key={index} className="mb-8">
                <h2 className="text-xl font-semibold text-nokta-one-white mb-4 flex items-center gap-2">
                  {section.icon && <span>{section.icon}</span>}
                  {section.title}
                </h2>
                <div 
                  className="text-gray-300 leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </section>
            ))}

            {/* Contact Section */}
            <section 
              className="mt-8 p-6 rounded-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <h3 className="text-lg font-semibold text-nokta-one-white mb-3">
                {t("privacyPolicyPage.contactTitle")}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {t("privacyPolicyPage.contactDescription")}
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:support@noktaone.com"
                  className="flex items-center gap-2 text-nokta-one-blue hover:underline"
                >
                  support@noktaone.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </SafeAreaContainer>
  );
}
