"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Scale, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import Link from "next/link";

export default function LegalNoticePage() {
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
              <Scale size={20} className="text-nokta-one-blue" />
              <h1 className="text-lg font-semibold text-nokta-one-white">
                {language === "fr" ? "Mentions Légales" : "Legal Notice"}
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

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500 italic text-center">
                {language === "fr" 
                  ? "Ces mentions légales peuvent être modifiées à tout moment. La version en vigueur est celle accessible sur l'Application."
                  : "This legal notice may be modified at any time. The current version is the one accessible on the Application."
                }
              </p>
            </div>
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
      title: "1. Éditeur de l'Application",
      icon: "🏢",
      content: `
        <p>L'application <strong>Nokta One</strong> est éditée par :</p>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Raison sociale</strong> : Société par Actions Simplifiée Unipersonnelle (SASU) de droit français</p>
          <p><strong>Siège social</strong> : Paris, France</p>
          <p><strong>Capital social</strong> : Variable</p>
          <p><strong>Immatriculation</strong> : Registre du Commerce et des Sociétés de Paris</p>
          <p><strong>Numéro de TVA intracommunautaire</strong> : FR [numéro]</p>
          <p><strong>Activité principale</strong> : Édition de logiciels applicatifs (Code NAF : 58.29C)</p>
          <p><strong>Directeur de la publication</strong> : Le représentant légal de la société</p>
        </div>
      `
    },
    {
      title: "2. Hébergement",
      icon: "☁️",
      content: `
        <p>L'Application et ses données sont hébergées par :</p>
        <h3>Hébergeur principal</h3>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Vercel Inc.</strong></p>
          <p>340 S Lemon Ave #4133<br />
          Walnut, CA 91789<br />
          États-Unis<br />
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">https://vercel.com</a></p>
        </div>
        <h3>Base de données</h3>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p>Infrastructure cloud certifiée, localisée dans l'Union Européenne (Francfort, Allemagne)</p>
          <p><strong>Certifications</strong> : ISO 27001, SOC 2 Type II</p>
        </div>
      `
    },
    {
      title: "3. Contact",
      icon: "📧",
      content: `
        <p>Pour toute question ou réclamation :</p>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Email général</strong> : <a href="mailto:contact@nokta.app" style="color: rgb(59, 130, 246);">contact@nokta.app</a></p>
          <p><strong>Support technique</strong> : <a href="mailto:support@noktaone.com" style="color: rgb(59, 130, 246);">support@noktaone.com</a></p>
          <p><strong>Protection des données</strong> : <a href="mailto:privacy@nokta.app" style="color: rgb(59, 130, 246);">privacy@nokta.app</a></p>
        </div>
      `
    },
    {
      title: "4. Propriété Intellectuelle",
      icon: "©️",
      content: `
        <h3>4.1 Droits d'auteur</h3>
        <p>L'ensemble des éléments composant l'Application (structure, textes, graphismes, images, sons, vidéos, logos, icônes, logiciels, base de données, etc.) sont la propriété exclusive de l'éditeur ou de ses partenaires et sont protégés par le droit de la propriété intellectuelle.</p>
        <p>Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, de ces éléments, par quelque moyen que ce soit, sans l'autorisation écrite préalable de l'éditeur, est interdite et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>
        <h3>4.2 Marques</h3>
        <p>"Nokta One", "Nokta", le logo Nokta One et les autres marques citées sur l'Application sont des marques déposées ou non déposées de l'éditeur. Toute reproduction ou utilisation de ces marques sans autorisation expresse est interdite.</p>
      `
    },
    {
      title: "5. Protection des Données Personnelles",
      icon: "🔒",
      content: `
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez de droits sur vos données personnelles.</p>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Responsable du traitement</strong> : L'éditeur de l'Application</p>
          <p><strong>Délégué à la Protection des Données (DPO)</strong> : <a href="mailto:dpo@nokta.app" style="color: rgb(59, 130, 246);">dpo@nokta.app</a></p>
          <p>Pour plus d'informations, consultez notre <a href="/privacy" style="color: rgb(59, 130, 246);">Politique de Confidentialité</a>.</p>
        </div>
        <h3>Autorité de contrôle</h3>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong></p>
          <p>3 Place de Fontenoy<br />
          TSA 80715<br />
          75334 PARIS CEDEX 07<br />
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">www.cnil.fr</a></p>
        </div>
      `
    },
    {
      title: "6. Cookies et Traceurs",
      icon: "🍪",
      content: `
        <p>L'Application utilise des technologies de stockage local (cookies, localStorage) pour son fonctionnement. Vous pouvez gérer vos préférences dans les paramètres de l'Application.</p>
        <p>Pour plus d'informations, consultez notre <a href="/privacy" style="color: rgb(59, 130, 246);">Politique de Confidentialité</a>.</p>
      `
    },
    {
      title: "7. Limitation de Responsabilité",
      icon: "⚠️",
      content: `
        <h3>7.1 Informations de bien-être</h3>
        <p>Les informations et recommandations fournies par Nokta One sont de nature générale et destinées uniquement à des fins de bien-être personnel. Elles ne constituent en aucun cas :</p>
        <ul>
          <li>Un avis médical</li>
          <li>Un diagnostic médical</li>
          <li>Un traitement médical</li>
          <li>Une prescription médicale</li>
        </ul>
        <p>L'Application ne remplace pas la consultation d'un professionnel de santé. En cas de problème de santé, consultez votre médecin.</p>
        <h3>7.2 Disponibilité du Service</h3>
        <p>L'éditeur s'efforce de maintenir l'Application accessible mais ne peut garantir une disponibilité continue. L'éditeur ne pourra être tenu responsable des interruptions de service ou des éventuels dysfonctionnements.</p>
      `
    },
    {
      title: "8. Droit Applicable",
      icon: "⚖️",
      content: `
        <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, compétence est attribuée aux tribunaux français.</p>
      `
    },
    {
      title: "9. Médiation de la Consommation",
      icon: "🤝",
      content: `
        <p>Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, l'éditeur adhère au Service du Médiateur [à compléter].</p>
        <p>Avant de saisir le médiateur, vous devez avoir préalablement tenté de résoudre votre litige directement auprès de notre service client par une réclamation écrite.</p>
        <p><strong>Plateforme européenne de règlement en ligne des litiges</strong> : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">https://ec.europa.eu/consumers/odr</a></p>
      `
    },
    {
      title: "10. Crédits",
      icon: "🙏",
      content: `
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Conception et développement</strong> : Équipe Nokta One</p>
          <p><strong>Design</strong> : Équipe Nokta One</p>
          <p><strong>Icônes</strong> : Lucide Icons (MIT License)</p>
          <p><strong>Polices</strong> : Google Fonts</p>
        </div>
      `
    },
  ]
};

// English Content
const contentEN = {
  sections: [
    {
      title: "1. Application Publisher",
      icon: "🏢",
      content: `
        <p>The <strong>Nokta One</strong> application is published by:</p>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Legal form</strong>: Simplified Joint Stock Company (SASU) under French law</p>
          <p><strong>Headquarters</strong>: Paris, France</p>
          <p><strong>Share capital</strong>: Variable</p>
          <p><strong>Registration</strong>: Paris Trade and Companies Registry</p>
          <p><strong>VAT number</strong>: FR [number]</p>
          <p><strong>Main activity</strong>: Application software publishing (NAF Code: 58.29C)</p>
          <p><strong>Publication director</strong>: The legal representative of the company</p>
        </div>
      `
    },
    {
      title: "2. Hosting",
      icon: "☁️",
      content: `
        <p>The Application and its data are hosted by:</p>
        <h3>Main Host</h3>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Vercel Inc.</strong></p>
          <p>340 S Lemon Ave #4133<br />
          Walnut, CA 91789<br />
          United States<br />
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">https://vercel.com</a></p>
        </div>
        <h3>Database</h3>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p>Certified cloud infrastructure, located in the European Union (Frankfurt, Germany)</p>
          <p><strong>Certifications</strong>: ISO 27001, SOC 2 Type II</p>
        </div>
      `
    },
    {
      title: "3. Contact",
      icon: "📧",
      content: `
        <p>For any questions or complaints:</p>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>General email</strong>: <a href="mailto:contact@nokta.app" style="color: rgb(59, 130, 246);">contact@nokta.app</a></p>
          <p><strong>Technical support</strong>: <a href="mailto:support@noktaone.com" style="color: rgb(59, 130, 246);">support@noktaone.com</a></p>
          <p><strong>Data protection</strong>: <a href="mailto:privacy@nokta.app" style="color: rgb(59, 130, 246);">privacy@nokta.app</a></p>
        </div>
      `
    },
    {
      title: "4. Intellectual Property",
      icon: "©️",
      content: `
        <h3>4.1 Copyright</h3>
        <p>All elements comprising the Application (structure, texts, graphics, images, sounds, videos, logos, icons, software, database, etc.) are the exclusive property of the publisher or its partners and are protected by intellectual property law.</p>
        <p>Any reproduction, representation, modification, publication, adaptation, in whole or in part, of these elements, by any means whatsoever, without the prior written authorization of the publisher, is prohibited and would constitute an infringement punishable by articles L.335-2 and following of the Intellectual Property Code.</p>
        <h3>4.2 Trademarks</h3>
        <p>"Nokta One", "Nokta", the Nokta One logo and other trademarks mentioned on the Application are registered or unregistered trademarks of the publisher. Any reproduction or use of these trademarks without express authorization is prohibited.</p>
      `
    },
    {
      title: "5. Personal Data Protection",
      icon: "🔒",
      content: `
        <p>In accordance with the General Data Protection Regulation (GDPR) and the French Data Protection Act, you have rights regarding your personal data.</p>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Data controller</strong>: The Application publisher</p>
          <p><strong>Data Protection Officer (DPO)</strong>: <a href="mailto:dpo@nokta.app" style="color: rgb(59, 130, 246);">dpo@nokta.app</a></p>
          <p>For more information, see our <a href="/privacy" style="color: rgb(59, 130, 246);">Privacy Policy</a>.</p>
        </div>
        <h3>Supervisory authority</h3>
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong></p>
          <p>3 Place de Fontenoy<br />
          TSA 80715<br />
          75334 PARIS CEDEX 07<br />
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">www.cnil.fr</a></p>
        </div>
      `
    },
    {
      title: "6. Cookies and Trackers",
      icon: "🍪",
      content: `
        <p>The Application uses local storage technologies (cookies, localStorage) for its operation. You can manage your preferences in the Application settings.</p>
        <p>For more information, see our <a href="/privacy" style="color: rgb(59, 130, 246);">Privacy Policy</a>.</p>
      `
    },
    {
      title: "7. Limitation of Liability",
      icon: "⚠️",
      content: `
        <h3>7.1 Wellness Information</h3>
        <p>The information and recommendations provided by Nokta One are general in nature and intended solely for personal wellness purposes. They do not constitute:</p>
        <ul>
          <li>Medical advice</li>
          <li>Medical diagnosis</li>
          <li>Medical treatment</li>
          <li>Medical prescription</li>
        </ul>
        <p>The Application does not replace consultation with a healthcare professional. In case of health problems, consult your doctor.</p>
        <h3>7.2 Service Availability</h3>
        <p>The publisher strives to keep the Application accessible but cannot guarantee continuous availability. The publisher cannot be held responsible for service interruptions or possible malfunctions.</p>
      `
    },
    {
      title: "8. Applicable Law",
      icon: "⚖️",
      content: `
        <p>This legal notice is subject to French law. In case of dispute, and after attempting amicable resolution, jurisdiction is attributed to French courts.</p>
      `
    },
    {
      title: "9. Consumer Mediation",
      icon: "🤝",
      content: `
        <p>In accordance with the provisions of the Consumer Code regarding the amicable settlement of disputes, the publisher adheres to the Mediator Service [to be completed].</p>
        <p>Before contacting the mediator, you must have previously attempted to resolve your dispute directly with our customer service by written complaint.</p>
        <p><strong>European online dispute resolution platform</strong>: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">https://ec.europa.eu/consumers/odr</a></p>
      `
    },
    {
      title: "10. Credits",
      icon: "🙏",
      content: `
        <div style="background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Design and development</strong>: Nokta One Team</p>
          <p><strong>Design</strong>: Nokta One Team</p>
          <p><strong>Icons</strong>: Lucide Icons (MIT License)</p>
          <p><strong>Fonts</strong>: Google Fonts</p>
        </div>
      `
    },
  ]
};
