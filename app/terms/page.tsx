"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function TermsPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4 p-4">
          <motion.button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center glass-icon-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            <h1 className="text-xl font-semibold">
              {t("termsOfService.title")}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card p-6 md:p-8 rounded-2xl space-y-8">
          {/* Preamble */}
          <section>
            <p className="text-sm text-gray-400 mb-4">
              {t("termsOfService.lastUpdated")} : {t("termsOfService.lastUpdatedDate")}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {t("termsOfService.version")} : {t("termsOfService.versionNumber")}
            </p>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                {t("termsOfService.preamble")}
              </p>
              <p className="text-white font-semibold">
                {t("termsOfService.preambleBold")}
              </p>
            </div>
          </section>

          {/* Article 1: Definitions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article1.title")}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong className="text-white">{t("termsOfService.article1.application")}</strong> {t("termsOfService.article1.applicationDesc")}</li>
              <li><strong className="text-white">{t("termsOfService.article1.content")}</strong> {t("termsOfService.article1.contentDesc")}</li>
              <li><strong className="text-white">{t("termsOfService.article1.userContent")}</strong> {t("termsOfService.article1.userContentDesc")}</li>
              <li><strong className="text-white">{t("termsOfService.article1.service")}</strong> {t("termsOfService.article1.serviceDesc")}</li>
              <li><strong className="text-white">{t("termsOfService.article1.user")}</strong> {t("termsOfService.article1.userDesc")}</li>
              <li><strong className="text-white">{t("termsOfService.article1.account")}</strong> {t("termsOfService.article1.accountDesc")}</li>
              <li><strong className="text-white">{t("termsOfService.article1.personalData")}</strong> {t("termsOfService.article1.personalDataDesc")}</li>
            </ul>
          </section>

          {/* Article 2: Acceptance */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article2.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article2.subsection1.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article2.subsection1.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article2.subsection1.item1")}</li>
              <li>{t("termsOfService.article2.subsection1.item2")}</li>
              <li>{t("termsOfService.article2.subsection1.item3")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article2.subsection2.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article2.subsection2.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article2.subsection3.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article2.subsection3.description")}
            </p>
          </section>

          {/* Article 3: Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article3.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article3.subsection1.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article3.subsection1.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article3.subsection1.item1")}</li>
              <li>{t("termsOfService.article3.subsection1.item2")}</li>
              <li>{t("termsOfService.article3.subsection1.item3")}</li>
              <li>{t("termsOfService.article3.subsection1.item4")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article3.subsection2.title")}
            </h3>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
              <p className="text-red-400 font-semibold mb-2">
                {t("termsOfService.article3.subsection2.important")}
              </p>
              <p className="text-gray-300 mb-4">
                {t("termsOfService.article3.subsection2.description")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong className="text-white">{t("termsOfService.article3.subsection2.isNot")}</strong> {t("termsOfService.article3.subsection2.isNotDesc")}</li>
                <li><strong className="text-white">{t("termsOfService.article3.subsection2.doesNotProvide")}</strong> {t("termsOfService.article3.subsection2.doesNotProvideDesc")}</li>
                <li><strong className="text-white">{t("termsOfService.article3.subsection2.doesNotReplace")}</strong> {t("termsOfService.article3.subsection2.doesNotReplaceDesc")}</li>
                <li><strong className="text-white">{t("termsOfService.article3.subsection2.isNotIntended")}</strong> {t("termsOfService.article3.subsection2.isNotIntendedDesc")}</li>
              </ul>
              <p className="text-gray-300 mt-4">
                {t("termsOfService.article3.subsection2.disclaimer")}
              </p>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article3.subsection3.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article3.subsection3.description")}
            </p>
          </section>

          {/* Article 4: Registration */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article4.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article4.subsection1.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article4.subsection1.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article4.subsection1.item1")}</li>
              <li>{t("termsOfService.article4.subsection1.item2")}</li>
              <li>{t("termsOfService.article4.subsection1.item3")}</li>
              <li>{t("termsOfService.article4.subsection1.item4")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article4.subsection2.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article4.subsection2.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article4.subsection3.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article4.subsection3.description")}
            </p>
          </section>

          {/* Article 5: Subscriptions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article5.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article5.subsection1.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article5.subsection1.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong className="text-white">{t("termsOfService.article5.subsection1.free")}</strong> {t("termsOfService.article5.subsection1.freeDesc")}</li>
              <li><strong className="text-white">{t("termsOfService.article5.subsection1.premium")}</strong> {t("termsOfService.article5.subsection1.premiumDesc")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article5.subsection2.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article5.subsection2.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article5.subsection3.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article5.subsection3.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article5.subsection4.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article5.subsection4.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article5.subsection5.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article5.subsection5.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article5.subsection6.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article5.subsection6.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article5.subsection7.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article5.subsection7.description")}
            </p>
          </section>

          {/* Article 6: Rules of Use */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article6.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article6.subsection1.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article6.subsection1.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article6.subsection1.item1")}</li>
              <li>{t("termsOfService.article6.subsection1.item2")}</li>
              <li>{t("termsOfService.article6.subsection1.item3")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article6.subsection2.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article6.subsection2.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article6.subsection2.item1")}</li>
              <li>{t("termsOfService.article6.subsection2.item2")}</li>
              <li>{t("termsOfService.article6.subsection2.item3")}</li>
              <li>{t("termsOfService.article6.subsection2.item4")}</li>
              <li>{t("termsOfService.article6.subsection2.item5")}</li>
              <li>{t("termsOfService.article6.subsection2.item6")}</li>
              <li>{t("termsOfService.article6.subsection2.item7")}</li>
              <li>{t("termsOfService.article6.subsection2.item8")}</li>
              <li>{t("termsOfService.article6.subsection2.item9")}</li>
              <li>{t("termsOfService.article6.subsection2.item10")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article6.subsection3.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article6.subsection3.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article6.subsection3.item1")}</li>
              <li>{t("termsOfService.article6.subsection3.item2")}</li>
              <li>{t("termsOfService.article6.subsection3.item3")}</li>
            </ul>
          </section>

          {/* Article 7: Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article7.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article7.subsection1.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article7.subsection1.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article7.subsection2.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article7.subsection2.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article7.subsection3.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article7.subsection3.description")}
            </p>
          </section>

          {/* Article 8: Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article8.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article8.subsection1.title")}
            </h3>
            <p className="text-white font-semibold mb-4">
              {t("termsOfService.article8.subsection1.disclaimer")}
            </p>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article8.subsection1.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article8.subsection1.item1")}</li>
              <li>{t("termsOfService.article8.subsection1.item2")}</li>
              <li>{t("termsOfService.article8.subsection1.item3")}</li>
              <li>{t("termsOfService.article8.subsection1.item4")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article8.subsection2.title")}
            </h3>
            <p className="text-white font-semibold mb-4">
              {t("termsOfService.article8.subsection2.limitation")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article8.subsection2.item1")}</li>
              <li>{t("termsOfService.article8.subsection2.item2")}</li>
              <li>{t("termsOfService.article8.subsection2.item3")}</li>
              <li>{t("termsOfService.article8.subsection2.item4")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article8.subsection3.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article8.subsection3.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article8.subsection4.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article8.subsection4.description")}
            </p>
          </section>

          {/* Article 9: Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article9.title")}
            </h2>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article9.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article9.item1")}</li>
              <li>{t("termsOfService.article9.item2")}</li>
              <li>{t("termsOfService.article9.item3")}</li>
              <li>{t("termsOfService.article9.item4")}</li>
            </ul>
          </section>

          {/* Article 10: Suspension and Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article10.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article10.subsection1.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article10.subsection1.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article10.subsection2.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article10.subsection2.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article10.subsection2.item1")}</li>
              <li>{t("termsOfService.article10.subsection2.item2")}</li>
              <li>{t("termsOfService.article10.subsection2.item3")}</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article10.subsection3.title")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("termsOfService.article10.subsection3.description")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>{t("termsOfService.article10.subsection3.item1")}</li>
              <li>{t("termsOfService.article10.subsection3.item2")}</li>
              <li>{t("termsOfService.article10.subsection3.item3")}</li>
            </ul>
          </section>

          {/* Article 11: Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article11.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article11.subsection1.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article11.subsection1.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article11.subsection2.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article11.subsection2.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article11.subsection3.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article11.subsection3.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article11.subsection4.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article11.subsection4.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article11.subsection5.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article11.subsection5.description")}
            </p>
          </section>

          {/* Article 12: Miscellaneous */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article12.title")}
            </h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article12.subsection1.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article12.subsection1.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article12.subsection2.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article12.subsection2.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article12.subsection3.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article12.subsection3.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article12.subsection4.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article12.subsection4.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article12.subsection5.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article12.subsection5.description")}
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              {t("termsOfService.article12.subsection6.title")}
            </h3>
            <p className="text-gray-300">
              {t("termsOfService.article12.subsection6.description")}
            </p>
          </section>

          {/* Article 13: Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("termsOfService.article13.title")}
            </h2>
            <p className="text-gray-300 mb-6">
              {t("termsOfService.article13.description")}
            </p>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-white">{t("termsOfService.article13.email")}</strong> {t("termsOfService.article13.emailAddress")}
              </p>
              <p>
                <strong className="text-white">{t("termsOfService.article13.postal")}</strong><br />
                {t("termsOfService.article13.postalAddress")}
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-white/10 pt-6 mt-8">
            <p className="text-xs text-gray-500 italic">
              {t("termsOfService.footer")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
