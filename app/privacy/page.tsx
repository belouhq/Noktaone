"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
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
              <Shield size={20} className="text-nokta-one-blue" />
              <h1 className="text-lg font-semibold text-nokta-one-white">
                {language === "fr" ? "Politique de Confidentialité" : "Privacy Policy"}
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

            {/* Render content sections */}
            {content.sections.map((section, index) => (
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
                {language === "fr" ? "Nous contacter" : "Contact Us"}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {language === "fr" 
                  ? "Pour toute question concernant cette politique ou pour exercer vos droits :"
                  : "For any questions about this policy or to exercise your rights:"
                }
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:privacy@nokta.app"
                  className="flex items-center gap-2 text-nokta-one-blue hover:underline"
                >
                  📧 privacy@nokta.app
                </a>
                <a 
                  href="mailto:dpo@nokta.app"
                  className="flex items-center gap-2 text-nokta-one-blue hover:underline"
                >
                  🛡️ dpo@nokta.app (DPO)
                </a>
              </div>
            </section>
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
      title: "Introduction",
      icon: "📋",
      content: `
        <p>La présente Politique de Confidentialité décrit comment vos informations personnelles sont collectées, utilisées et partagées lorsque vous utilisez l'application <strong>Nokta One</strong>.</p>
        <p>Nokta One est éditée par une société française immatriculée au Registre du Commerce et des Sociétés de Paris. En utilisant notre Service, vous acceptez les pratiques décrites dans cette Politique.</p>
      `
    },
    {
      title: "1. Données collectées",
      icon: "📊",
      content: `
        <p><strong>Données de compte :</strong> Email, nom d'utilisateur, mot de passe (hashé)</p>
        <p><strong>Données de profil :</strong> Prénom, date de naissance, pays, langue</p>
        <p><strong>Données d'utilisation :</strong> Sessions, actions, horodatages</p>
        <p><strong>Analyse faciale :</strong> Les images sont traitées <strong>localement sur votre appareil</strong>. Seuls les scores wellness anonymisés sont transmis. Nous n'utilisons <strong>pas</strong> de reconnaissance faciale pour vous identifier.</p>
      `
    },
    {
      title: "2. Utilisation des données",
      icon: "⚙️",
      content: `
        <p>Nous utilisons vos données pour :</p>
        <ul>
          <li>Fournir et améliorer le Service</li>
          <li>Personnaliser votre expérience</li>
          <li>Vous envoyer des communications (si consenti)</li>
          <li>Assurer la sécurité du Service</li>
        </ul>
        <p><strong>Base légale (RGPD) :</strong> Exécution du contrat, intérêt légitime, consentement.</p>
      `
    },
    {
      title: "3. Partage des données",
      icon: "🤝",
      content: `
        <p><strong>Nous ne vendons jamais vos données personnelles.</strong></p>
        <p>Nous faisons appel à des sous-traitants de confiance (infrastructure cloud UE, services de paiement certifiés PCI-DSS). Des transferts hors UE sont encadrés par les Clauses Contractuelles Types.</p>
      `
    },
    {
      title: "4. Conservation",
      icon: "🗄️",
      content: `
        <p><strong>Données de compte :</strong> Durée de l'inscription + 3 ans</p>
        <p><strong>Données de session :</strong> 24 mois</p>
        <p><strong>Données de paiement :</strong> 10 ans (obligations fiscales)</p>
        <p>Après suppression de votre compte, vos données sont anonymisées ou supprimées sous 30 jours.</p>
      `
    },
    {
      title: "5. Vos droits",
      icon: "✅",
      content: `
        <p>Vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Accès</strong> : Obtenir une copie de vos données</li>
          <li><strong>Rectification</strong> : Corriger vos données</li>
          <li><strong>Effacement</strong> : Supprimer vos données</li>
          <li><strong>Portabilité</strong> : Exporter vos données</li>
          <li><strong>Opposition</strong> : Refuser certains traitements</li>
          <li><strong>Retrait du consentement</strong> : À tout moment</li>
        </ul>
        <p>Délai de réponse : <strong>30 jours maximum</strong>.</p>
        <p>Vous pouvez introduire une réclamation auprès de la <strong>CNIL</strong> (www.cnil.fr).</p>
      `
    },
    {
      title: "6. Sécurité",
      icon: "🔒",
      content: `
        <p>Vos données sont protégées par :</p>
        <ul>
          <li>Chiffrement en transit (TLS 1.3) et au repos (AES-256)</li>
          <li>Authentification sécurisée</li>
          <li>Accès limité (principe du moindre privilège)</li>
          <li>Notification en cas de violation sous 72h</li>
        </ul>
      `
    },
    {
      title: "7. Mineurs",
      icon: "👶",
      content: `
        <p>Notre Service est destiné aux personnes de <strong>16 ans et plus</strong>.</p>
        <p>Entre 13 et 16 ans, le consentement parental est requis. Nous ne collectons pas sciemment de données d'enfants de moins de 13 ans.</p>
      `
    },
    {
      title: "8. Californie (CCPA)",
      icon: "🇺🇸",
      content: `
        <p>Si vous résidez en Californie :</p>
        <ul>
          <li><strong>Nous ne vendons pas vos informations personnelles</strong></li>
          <li>Vous avez le droit de savoir, supprimer et refuser la "vente" de vos données</li>
        </ul>
      `
    },
  ]
};

// English Content
const contentEN = {
  sections: [
    {
      title: "Introduction",
      icon: "📋",
      content: `
        <p>This Privacy Policy describes how your personal information is collected, used, and shared when you use the <strong>Nokta One</strong> application.</p>
        <p>Nokta One is published by a French company registered with the Paris Trade and Companies Registry. By using our Service, you agree to the practices described in this Policy.</p>
      `
    },
    {
      title: "1. Data We Collect",
      icon: "📊",
      content: `
        <p><strong>Account Data:</strong> Email, username, password (hashed)</p>
        <p><strong>Profile Data:</strong> First name, date of birth, country, language</p>
        <p><strong>Usage Data:</strong> Sessions, actions, timestamps</p>
        <p><strong>Facial Analysis:</strong> Images are processed <strong>locally on your device</strong>. Only anonymized wellness scores are transmitted. We do <strong>not</strong> use facial recognition to identify you.</p>
      `
    },
    {
      title: "2. How We Use Data",
      icon: "⚙️",
      content: `
        <p>We use your data to:</p>
        <ul>
          <li>Provide and improve the Service</li>
          <li>Personalize your experience</li>
          <li>Send you communications (if consented)</li>
          <li>Ensure Service security</li>
        </ul>
        <p><strong>Legal Basis (GDPR):</strong> Contract performance, legitimate interest, consent.</p>
      `
    },
    {
      title: "3. Data Sharing",
      icon: "🤝",
      content: `
        <p><strong>We never sell your personal data.</strong></p>
        <p>We use trusted service providers (EU cloud infrastructure, PCI-DSS certified payment services). Transfers outside the EU are governed by Standard Contractual Clauses.</p>
      `
    },
    {
      title: "4. Retention",
      icon: "🗄️",
      content: `
        <p><strong>Account Data:</strong> Duration of registration + 3 years</p>
        <p><strong>Session Data:</strong> 24 months</p>
        <p><strong>Payment Data:</strong> 10 years (tax obligations)</p>
        <p>After account deletion, your data is anonymized or deleted within 30 days.</p>
      `
    },
    {
      title: "5. Your Rights",
      icon: "✅",
      content: `
        <p>You have the following rights:</p>
        <ul>
          <li><strong>Access</strong>: Obtain a copy of your data</li>
          <li><strong>Rectification</strong>: Correct your data</li>
          <li><strong>Erasure</strong>: Delete your data</li>
          <li><strong>Portability</strong>: Export your data</li>
          <li><strong>Objection</strong>: Object to certain processing</li>
          <li><strong>Withdraw Consent</strong>: At any time</li>
        </ul>
        <p>Response time: <strong>30 days maximum</strong>.</p>
        <p>You may lodge a complaint with the <strong>CNIL</strong> (www.cnil.fr).</p>
      `
    },
    {
      title: "6. Security",
      icon: "🔒",
      content: `
        <p>Your data is protected by:</p>
        <ul>
          <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
          <li>Secure authentication</li>
          <li>Limited access (principle of least privilege)</li>
          <li>Breach notification within 72 hours</li>
        </ul>
      `
    },
    {
      title: "7. Minors",
      icon: "👶",
      content: `
        <p>Our Service is intended for persons <strong>16 years and older</strong>.</p>
        <p>Between 13 and 16 years, parental consent is required. We do not knowingly collect data from children under 13.</p>
      `
    },
    {
      title: "8. California (CCPA)",
      icon: "🇺🇸",
      content: `
        <p>If you are a California resident:</p>
        <ul>
          <li><strong>We do not sell your personal information</strong></li>
          <li>You have the right to know, delete, and opt-out of the "sale" of your data</li>
        </ul>
      `
    },
  ]
};
