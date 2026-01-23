"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";

export default function TermsOfServicePage() {
  const router = useRouter();
  const { currentLanguage } = useTranslation();
  const [language, setLanguage] = useState<"fr" | "en">(
    currentLanguage === "fr" ? "fr" : "en"
  );

  const content = language === "fr" ? contentFR : contentEN;

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
            >
              <ArrowLeft size={24} className="text-nokta-one-white" />
            </motion.button>
            
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-nokta-one-blue" />
              <h1 className="text-lg font-semibold text-nokta-one-white">
                {language === "fr" ? "Conditions d'Utilisation" : "Terms of Service"}
              </h1>
            </div>

            {/* Language Toggle */}
            <motion.button
              onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe size={14} className="text-gray-400" />
              <span className="text-nokta-one-white uppercase">{language}</span>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 pb-24">
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
                <strong>{language === "fr" ? "Version" : "Version"}:</strong> 1.0
                <br />
                <strong>{language === "fr" ? "Dernière mise à jour" : "Last updated"}:</strong> {language === "fr" ? "Janvier 2025" : "January 2025"}
              </p>
            </div>

            {/* Medical Disclaimer - Highlighted */}
            <div 
              className="mb-6 p-4 rounded-xl"
              style={{
                background: "rgba(251, 191, 36, 0.1)",
                border: "1px solid rgba(251, 191, 36, 0.3)",
              }}
            >
              <p className="text-sm text-yellow-200 m-0 font-medium">
                {language === "fr" 
                  ? "AVERTISSEMENT : Nokta One n'est PAS un dispositif médical et ne fournit PAS de conseils médicaux. En cas de problème de santé, consultez un professionnel."
                  : "DISCLAIMER: Nokta One is NOT a medical device and does NOT provide medical advice. If you have health concerns, consult a professional."
                }
              </p>
            </div>

            {/* Render content sections */}
            {content.sections.map((section, index) => (
              <section key={index} className="mb-8">
                <h2 className="text-xl font-semibold text-nokta-one-white mb-4">
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
                {language === "fr" ? "Contact" : "Contact"}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {language === "fr" 
                  ? "Pour toute question concernant ces conditions :"
                  : "For any questions about these terms:"
                }
              </p>
              <a 
                href="mailto:support@noktaone.com"
                className="flex items-center gap-2 text-nokta-one-blue hover:underline"
              >
                support@noktaone.com
              </a>
            </section>

            {/* Acceptance Notice */}
            <p className="text-center text-gray-500 text-xs mt-8">
              {language === "fr"
                ? "En utilisant Nokta One, vous reconnaissez avoir lu, compris et accepté ces Conditions."
                : "By using Nokta One, you acknowledge that you have read, understood, and agree to these Terms."
              }
            </p>
          </div>
        </div>
      </main>
    </SafeAreaContainer>
  );
}

// French Content
const contentFR = {
  sections: [
    {
      title: "Article 1 – Acceptation",
      content: `
        <p>En utilisant Nokta One, vous acceptez d'être lié par ces Conditions. Si vous n'acceptez pas, vous ne devez pas utiliser le Service.</p>
        <p>Vous déclarez avoir au moins <strong>16 ans</strong> (ou 13 ans avec consentement parental) et la capacité juridique de conclure un contrat.</p>
      `
    },
    {
      title: "Article 2 – Description du Service",
      content: `
        <p>Nokta One est une application de bien-être proposant :</p>
        <ul>
          <li>Des sessions de régulation physiologique guidées</li>
          <li>Des exercices de respiration et de posture</li>
          <li>Un suivi de votre état de bien-être</li>
          <li>Des recommandations personnalisées</li>
        </ul>
        <p><strong>Le Service est fourni à des fins informatives uniquement et ne remplace pas l'avis d'un professionnel de santé.</strong></p>
      `
    },
    {
      title: "Article 3 – Compte utilisateur",
      content: `
        <p>Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous vous engagez à :</p>
        <ul>
          <li>Fournir des informations exactes et à jour</li>
          <li>Maintenir la confidentialité de vos identifiants</li>
          <li>Nous informer de toute utilisation non autorisée</li>
          <li>Être responsable de toutes les activités sous votre compte</li>
        </ul>
      `
    },
    {
      title: "Article 4 – Abonnements",
      content: `
        <p><strong>Formules :</strong> Gratuite (accès limité) ou Premium (accès complet)</p>
        <p><strong>Renouvellement :</strong> Automatique, sauf résiliation avant l'échéance</p>
        <p><strong>Résiliation :</strong> À tout moment depuis les paramètres ou votre plateforme (App Store, Google Play)</p>
        <p><strong>Remboursements :</strong> Non remboursables, sauf disposition légale contraire</p>
      `
    },
    {
      title: "Article 5 – Règles d'utilisation",
      content: `
        <p><strong>Il est interdit de :</strong></p>
        <ul>
          <li>Utiliser le Service à des fins illégales</li>
          <li>Tenter d'accéder de manière non autorisée à nos systèmes</li>
          <li>Transmettre des virus ou codes malveillants</li>
          <li>Collecter des données d'autres utilisateurs</li>
          <li>Usurper l'identité d'une autre personne</li>
          <li>Revendre ou exploiter commercialement le Service</li>
        </ul>
      `
    },
    {
      title: "Article 6 – Propriété intellectuelle",
      content: `
        <p>Le Service et son contenu (code, textes, graphismes, logos, etc.) sont la propriété exclusive de l'éditeur et protégés par les lois sur la propriété intellectuelle.</p>
        <p>Vous bénéficiez d'une licence personnelle, limitée, non exclusive et révocable pour utiliser le Service à des fins personnelles.</p>
      `
    },
    {
      title: "Article 7 – Limitation de responsabilité",
      content: `
        <p>LE SERVICE EST FOURNI "EN L'ÉTAT", SANS GARANTIE D'AUCUNE SORTE.</p>
        <p>Nous ne sommes pas responsables des :</p>
        <ul>
          <li>Dommages indirects ou consécutifs</li>
          <li>Pertes de profits ou de données</li>
          <li>Interruptions de service</li>
        </ul>
        <p><strong>Plafond :</strong> Notre responsabilité est limitée au montant payé au cours des 12 derniers mois (ou 100€ maximum).</p>
      `
    },
    {
      title: "Article 8 – Résiliation",
      content: `
        <p><strong>Par vous :</strong> Vous pouvez supprimer votre compte à tout moment depuis les paramètres.</p>
        <p><strong>Par nous :</strong> Nous pouvons suspendre votre accès en cas de violation des présentes Conditions.</p>
        <p>En cas de résiliation, votre droit d'utiliser le Service cesse immédiatement.</p>
      `
    },
    {
      title: "Article 9 – Droit applicable",
      content: `
        <p>Ces Conditions sont régies par le <strong>droit français</strong>.</p>
        <p>En cas de litige, les parties s'efforceront de trouver une solution amiable. Vous pouvez recourir à la médiation de la consommation.</p>
        <p><strong>Juridiction :</strong> Tribunaux de Paris, sous réserve des règles de compétence en faveur des consommateurs.</p>
        <p><strong>Plateforme européenne :</strong> <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">ec.europa.eu/consumers/odr</a></p>
      `
    },
  ]
};

// English Content
const contentEN = {
  sections: [
    {
      title: "Article 1 – Acceptance",
      content: `
        <p>By using Nokta One, you agree to be bound by these Terms. If you do not agree, you must not use the Service.</p>
        <p>You represent that you are at least <strong>16 years old</strong> (or 13 with parental consent) and have the legal capacity to enter into a contract.</p>
      `
    },
    {
      title: "Article 2 – Description of Service",
      content: `
        <p>Nokta One is a wellness application offering:</p>
        <ul>
          <li>Guided physiological regulation sessions</li>
          <li>Breathing and posture exercises</li>
          <li>Wellness state tracking</li>
          <li>Personalized recommendations</li>
        </ul>
        <p><strong>The Service is provided for informational purposes only and does not replace the advice of a healthcare professional.</strong></p>
      `
    },
    {
      title: "Article 3 – User Account",
      content: `
        <p>To access certain features, you must create an account. You agree to:</p>
        <ul>
          <li>Provide accurate and up-to-date information</li>
          <li>Maintain the confidentiality of your credentials</li>
          <li>Notify us of any unauthorized use</li>
          <li>Be responsible for all activities under your account</li>
        </ul>
      `
    },
    {
      title: "Article 4 – Subscriptions",
      content: `
        <p><strong>Plans:</strong> Free (limited access) or Premium (full access)</p>
        <p><strong>Renewal:</strong> Automatic, unless canceled before expiration</p>
        <p><strong>Cancellation:</strong> At any time from settings or your platform (App Store, Google Play)</p>
        <p><strong>Refunds:</strong> Non-refundable, unless required by law</p>
      `
    },
    {
      title: "Article 5 – Rules of Use",
      content: `
        <p><strong>It is prohibited to:</strong></p>
        <ul>
          <li>Use the Service for illegal purposes</li>
          <li>Attempt unauthorized access to our systems</li>
          <li>Transmit viruses or malicious code</li>
          <li>Collect other users' data</li>
          <li>Impersonate another person</li>
          <li>Resell or commercially exploit the Service</li>
        </ul>
      `
    },
    {
      title: "Article 6 – Intellectual Property",
      content: `
        <p>The Service and its content (code, texts, graphics, logos, etc.) are the exclusive property of the publisher and protected by intellectual property laws.</p>
        <p>You are granted a personal, limited, non-exclusive, and revocable license to use the Service for personal purposes.</p>
      `
    },
    {
      title: "Article 7 – Limitation of Liability",
      content: `
        <p>THE SERVICE IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND.</p>
        <p>We are not liable for:</p>
        <ul>
          <li>Indirect or consequential damages</li>
          <li>Loss of profits or data</li>
          <li>Service interruptions</li>
        </ul>
        <p><strong>Cap:</strong> Our liability is limited to the amount paid in the last 12 months (or €100 maximum).</p>
      `
    },
    {
      title: "Article 8 – Termination",
      content: `
        <p><strong>By you:</strong> You may delete your account at any time from settings.</p>
        <p><strong>By us:</strong> We may suspend your access if you violate these Terms.</p>
        <p>Upon termination, your right to use the Service ceases immediately.</p>
      `
    },
    {
      title: "Article 9 – Governing Law",
      content: `
        <p>These Terms are governed by <strong>French law</strong>.</p>
        <p>In case of dispute, the parties will endeavor to find an amicable solution. You may use consumer mediation.</p>
        <p><strong>Jurisdiction:</strong> Courts of Paris, subject to mandatory consumer jurisdiction rules.</p>
        <p><strong>European platform:</strong> <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">ec.europa.eu/consumers/odr</a></p>
      `
    },
  ]
};
