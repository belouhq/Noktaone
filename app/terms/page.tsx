"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";

export default function TermsOfServicePage() {
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
              <FileText size={20} className="text-nokta-one-blue" />
              <h1 className="text-lg font-semibold text-nokta-one-white">
                {language === "fr" ? "Conditions Générales d'Utilisation" : "Terms of Service"}
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
                  ? "Pour toute question concernant ces Conditions Générales d'Utilisation :"
                  : "For any questions about these Terms of Service:"
                }
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:support@nokta.app"
                  className="flex items-center gap-2 text-nokta-one-blue hover:underline"
                >
                  📧 support@nokta.app
                </a>
                <p className="text-gray-400 text-sm mt-3">
                  <strong className="text-white">{language === "fr" ? "Adresse postale" : "Mailing Address"}:</strong><br />
                  {language === "fr" ? "Service Client" : "Customer Service"}<br />
                  Paris, France
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500 italic text-center">
                {language === "fr" 
                  ? "En utilisant Nokta One, vous reconnaissez avoir lu, compris et accepté les présentes Conditions Générales d'Utilisation."
                  : "By using Nokta One, you acknowledge that you have read, understood, and agree to these Terms of Service."
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
      title: "Préambule",
      icon: "📋",
      content: `
        <p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU » ou « Conditions ») régissent l'accès et l'utilisation de l'application <strong>Nokta One</strong> (ci-après « l'Application », « le Service » ou « Nokta One »).</p>
        <p>Nokta One est éditée par une société française immatriculée au Registre du Commerce et des Sociétés de Paris, ayant son siège social à Paris, France (ci-après « nous », « notre », « la Société » ou « l'Éditeur »).</p>
        <p><strong>En accédant à notre Service ou en l'utilisant, vous acceptez d'être lié par ces Conditions. Si vous n'acceptez pas ces Conditions, vous ne devez pas utiliser notre Service.</strong></p>
      `
    },
    {
      title: "Article 1 – Définitions",
      icon: "📖",
      content: `
        <ul>
          <li><strong>« Application »</strong> : L'application mobile et web Nokta One</li>
          <li><strong>« Contenu »</strong> : Tout texte, image, vidéo, données ou autre matériel disponible via le Service</li>
          <li><strong>« Contenu Utilisateur »</strong> : Tout contenu que vous soumettez, téléchargez ou transmettez via le Service</li>
          <li><strong>« Service »</strong> : L'ensemble des fonctionnalités proposées par Nokta One</li>
          <li><strong>« Utilisateur »</strong> ou <strong>« vous »</strong> : Toute personne physique utilisant le Service</li>
          <li><strong>« Compte »</strong> : Votre compte personnel créé pour accéder au Service</li>
          <li><strong>« Données Personnelles »</strong> : Informations se rapportant à une personne physique identifiée ou identifiable</li>
        </ul>
      `
    },
    {
      title: "Article 2 – Acceptation des Conditions",
      icon: "✅",
      content: `
        <h3>2.1 Capacité juridique</h3>
        <p>En utilisant notre Service, vous déclarez et garantissez :</p>
        <ul>
          <li>Avoir au moins <strong>16 ans</strong> (ou 13 ans avec le consentement parental)</li>
          <li>Avoir la capacité juridique de conclure un contrat contraignant</li>
          <li>Ne pas être une personne interdite d'utiliser le Service en vertu des lois applicables</li>
        </ul>
        <h3>2.2 Acceptation</h3>
        <p>Votre accès et utilisation du Service sont conditionnés par votre acceptation et votre respect de ces Conditions. Ces Conditions s'appliquent à tous les visiteurs, utilisateurs et autres personnes qui accèdent ou utilisent le Service.</p>
        <h3>2.3 Modifications</h3>
        <p>Nous nous réservons le droit de modifier ces Conditions à tout moment. Les modifications entrent en vigueur dès leur publication. Votre utilisation continue du Service après notification des modifications constitue votre acceptation des nouvelles Conditions.</p>
      `
    },
    {
      title: "Article 3 – Description du Service",
      icon: "🔧",
      content: `
        <h3>3.1 Fonctionnalités</h3>
        <p>Nokta One est une application de bien-être personnel qui propose :</p>
        <ul>
          <li>Des sessions de régulation physiologique guidées</li>
          <li>Des exercices de respiration et de posture</li>
          <li>Un suivi de votre état de bien-être</li>
          <li>Des recommandations personnalisées</li>
        </ul>
        <h3>3.2 Nature du Service</h3>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p style="color: rgb(248, 113, 113); font-weight: 600; margin-bottom: 0.5rem;">IMPORTANT – AVERTISSEMENT MÉDICAL :</p>
          <p>Le Service est fourni <strong>à des fins informatives et de bien-être général uniquement</strong>. Nokta One :</p>
          <ul>
            <li><strong>N'EST PAS</strong> un dispositif médical</li>
            <li><strong>NE FOURNIT PAS</strong> de diagnostic médical</li>
            <li><strong>NE REMPLACE PAS</strong> l'avis d'un professionnel de santé</li>
            <li><strong>N'EST PAS DESTINÉ</strong> à traiter, guérir ou prévenir des maladies</li>
          </ul>
          <p>Les indicateurs et recommandations fournis sont des <strong>signaux de bien-être général</strong> et ne doivent pas être interprétés comme des conseils médicaux. En cas de préoccupation médicale, consultez un professionnel de santé qualifié.</p>
        </div>
        <h3>3.3 Disponibilité</h3>
        <p>Nous nous efforçons de maintenir le Service disponible 24h/24, 7j/7. Toutefois, nous ne garantissons pas une disponibilité ininterrompue et pouvons suspendre ou interrompre le Service pour maintenance, mise à jour ou autres raisons techniques.</p>
      `
    },
    {
      title: "Article 4 – Inscription et Compte",
      icon: "👤",
      content: `
        <h3>4.1 Création de compte</h3>
        <p>Pour accéder à certaines fonctionnalités, vous devez créer un compte. Lors de l'inscription, vous vous engagez à :</p>
        <ul>
          <li>Fournir des informations exactes, complètes et à jour</li>
          <li>Maintenir la confidentialité de vos identifiants de connexion</li>
          <li>Nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
          <li>Être responsable de toutes les activités effectuées sous votre compte</li>
        </ul>
        <h3>4.2 Mode invité</h3>
        <p>Vous pouvez utiliser certaines fonctionnalités en mode invité sans créer de compte. Les données en mode invité ne sont pas sauvegardées de manière permanente.</p>
        <h3>4.3 Sécurité du compte</h3>
        <p>Vous êtes seul responsable de la protection de votre compte. Nous ne serons pas responsables des pertes résultant de l'utilisation non autorisée de votre compte.</p>
      `
    },
    {
      title: "Article 5 – Abonnements et Paiements",
      icon: "💳",
      content: `
        <h3>5.1 Offres</h3>
        <p>Le Service peut être proposé sous différentes formules :</p>
        <ul>
          <li><strong>Gratuite</strong> : Accès limité à certaines fonctionnalités</li>
          <li><strong>Premium</strong> : Accès complet moyennant un abonnement payant</li>
        </ul>
        <h3>5.2 Tarification</h3>
        <p>Les prix sont indiqués en euros (€) TTC. Nous nous réservons le droit de modifier nos tarifs à tout moment, sous réserve de vous en informer préalablement.</p>
        <h3>5.3 Paiement</h3>
        <p>Les paiements sont traités par notre prestataire de paiement sécurisé. En souscrivant un abonnement, vous autorisez le prélèvement automatique du montant correspondant.</p>
        <h3>5.4 Renouvellement automatique</h3>
        <p>Les abonnements sont renouvelés automatiquement à leur échéance, sauf résiliation de votre part avant la date de renouvellement.</p>
        <h3>5.5 Résiliation</h3>
        <p>Vous pouvez résilier votre abonnement à tout moment depuis les paramètres de votre compte ou via la plateforme (App Store, Google Play). La résiliation prend effet à la fin de la période d'abonnement en cours.</p>
        <h3>5.6 Droit de rétractation</h3>
        <p>Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contenus numériques non fournis sur un support matériel dont l'exécution a commencé avec votre accord préalable et votre reconnaissance de la perte du droit de rétractation.</p>
        <h3>5.7 Remboursements</h3>
        <p>Sauf disposition légale contraire ou erreur de facturation de notre part, les paiements effectués ne sont pas remboursables.</p>
      `
    },
    {
      title: "Article 6 – Règles d'utilisation",
      icon: "📜",
      content: `
        <h3>6.1 Utilisation autorisée</h3>
        <p>Vous vous engagez à utiliser le Service :</p>
        <ul>
          <li>Conformément aux présentes Conditions et aux lois applicables</li>
          <li>De manière personnelle et non commerciale</li>
          <li>Sans nuire aux autres utilisateurs ou au fonctionnement du Service</li>
        </ul>
        <h3>6.2 Comportements interdits</h3>
        <p>Il est strictement interdit de :</p>
        <ul>
          <li>Utiliser le Service à des fins illégales ou non autorisées</li>
          <li>Tenter d'accéder de manière non autorisée à nos systèmes</li>
          <li>Transmettre des virus, malwares ou codes malveillants</li>
          <li>Collecter ou stocker des données personnelles d'autres utilisateurs</li>
          <li>Usurper l'identité d'une autre personne</li>
          <li>Perturber ou surcharger nos infrastructures</li>
          <li>Contourner les mesures de sécurité ou de restriction d'accès</li>
          <li>Revendre, sous-licencier ou transférer votre accès au Service</li>
          <li>Utiliser des robots, scrapers ou outils automatisés sans autorisation</li>
          <li>Reproduire, dupliquer, copier ou exploiter le Service à des fins commerciales</li>
        </ul>
        <h3>6.3 Contenu Utilisateur</h3>
        <p>Si vous soumettez du contenu via le Service (commentaires, images, etc.) :</p>
        <ul>
          <li>Vous conservez vos droits de propriété intellectuelle</li>
          <li>Vous nous accordez une licence mondiale, non exclusive, gratuite et transférable pour utiliser, reproduire et afficher ce contenu dans le cadre du Service</li>
          <li>Vous garantissez que ce contenu ne viole pas les droits de tiers</li>
        </ul>
      `
    },
    {
      title: "Article 7 – Propriété Intellectuelle",
      icon: "©️",
      content: `
        <h3>7.1 Droits de la Société</h3>
        <p>Le Service et son contenu original (à l'exclusion du Contenu Utilisateur), y compris mais sans s'y limiter : le code source, les textes, les graphiques, les logos, les icônes, les images, les clips audio et vidéo, les compilations de données et les logiciels, sont la propriété exclusive de la Société ou de ses concédants de licence et sont protégés par les lois françaises et internationales sur la propriété intellectuelle.</p>
        <h3>7.2 Marques</h3>
        <p>"Nokta One" et les logos associés sont des marques de la Société. Vous ne pouvez pas les utiliser sans notre autorisation écrite préalable.</p>
        <h3>7.3 Licence limitée</h3>
        <p>Sous réserve du respect des présentes Conditions, nous vous accordons une licence personnelle, limitée, non exclusive, non transférable et révocable pour accéder et utiliser le Service à des fins personnelles et non commerciales.</p>
      `
    },
    {
      title: "Article 8 – Limitation de Responsabilité",
      icon: "⚠️",
      content: `
        <h3>8.1 Exclusion de garanties</h3>
        <p style="font-weight: 600; color: rgb(248, 113, 113);">LE SERVICE EST FOURNI « EN L'ÉTAT » ET « SELON DISPONIBILITÉ », SANS GARANTIE D'AUCUNE SORTE, EXPRESSE OU IMPLICITE.</p>
        <p>Nous ne garantissons pas que :</p>
        <ul>
          <li>Le Service répondra à vos besoins spécifiques</li>
          <li>Le Service sera ininterrompu, sécurisé ou exempt d'erreurs</li>
          <li>Les résultats obtenus seront exacts ou fiables</li>
          <li>Les défauts seront corrigés</li>
        </ul>
        <h3>8.2 Limitation de responsabilité</h3>
        <p style="font-weight: 600; color: rgb(248, 113, 113);">DANS LES LIMITES AUTORISÉES PAR LA LOI APPLICABLE, LA SOCIÉTÉ NE SERA EN AUCUN CAS RESPONSABLE :</p>
        <ul>
          <li>Des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs</li>
          <li>De toute perte de profits, de données, d'utilisation, de clientèle ou autre perte immatérielle</li>
          <li>Des dommages résultant de votre utilisation ou incapacité à utiliser le Service</li>
          <li>Des dommages résultant de l'accès non autorisé à vos données</li>
        </ul>
        <h3>8.3 Plafond de responsabilité</h3>
        <p>La responsabilité totale de la Société pour toute réclamation découlant de ces Conditions ou de l'utilisation du Service est limitée au montant que vous avez payé pour le Service au cours des 12 derniers mois, ou 100 € si vous n'avez effectué aucun paiement.</p>
        <h3>8.4 Exceptions</h3>
        <p>Certaines juridictions n'autorisent pas l'exclusion de certaines garanties ou la limitation de responsabilité. Dans ces juridictions, notre responsabilité sera limitée dans la mesure maximale permise par la loi.</p>
      `
    },
    {
      title: "Article 9 – Indemnisation",
      icon: "🛡️",
      content: `
        <p>Vous acceptez de défendre, indemniser et dégager de toute responsabilité la Société, ses dirigeants, administrateurs, employés et agents, contre toute réclamation, dommage, obligation, perte, responsabilité, coût ou dette, et dépense (y compris les honoraires d'avocat) résultant de :</p>
        <ul>
          <li>Votre utilisation du Service</li>
          <li>Votre violation des présentes Conditions</li>
          <li>Votre violation des droits d'un tiers</li>
          <li>Votre Contenu Utilisateur</li>
        </ul>
      `
    },
    {
      title: "Article 10 – Suspension et Résiliation",
      icon: "🚫",
      content: `
        <h3>10.1 Par vous</h3>
        <p>Vous pouvez cesser d'utiliser le Service et supprimer votre compte à tout moment depuis les paramètres de l'Application.</p>
        <h3>10.2 Par nous</h3>
        <p>Nous pouvons suspendre ou résilier votre accès au Service immédiatement, sans préavis ni responsabilité, si :</p>
        <ul>
          <li>Vous violez les présentes Conditions</li>
          <li>Nous estimons raisonnablement que votre comportement est préjudiciable au Service ou aux autres utilisateurs</li>
          <li>La loi l'exige</li>
        </ul>
        <h3>10.3 Effets de la résiliation</h3>
        <p>En cas de résiliation :</p>
        <ul>
          <li>Votre droit d'utiliser le Service cesse immédiatement</li>
          <li>Nous pouvons supprimer ou désactiver votre compte et toutes les données associées</li>
          <li>Les dispositions qui, par leur nature, doivent survivre à la résiliation, survivront (notamment : Propriété Intellectuelle, Limitation de Responsabilité, Indemnisation, Droit applicable)</li>
        </ul>
      `
    },
    {
      title: "Article 11 – Droit applicable et Litiges",
      icon: "⚖️",
      content: `
        <h3>11.1 Droit applicable</h3>
        <p>Les présentes Conditions sont régies et interprétées conformément au droit français, sans égard aux principes de conflits de lois.</p>
        <h3>11.2 Résolution amiable</h3>
        <p>En cas de litige, les parties s'efforceront de trouver une solution amiable. Vous pouvez nous contacter à : support@nokta.app</p>
        <h3>11.3 Médiation</h3>
        <p>Conformément aux articles L.611-1 et suivants du Code de la consommation, en cas de litige non résolu, vous pouvez recourir gratuitement au service de médiation :</p>
        <ul>
          <li><strong>Médiateur de la consommation</strong> : [Coordonnées à compléter lors de la désignation du médiateur]</li>
        </ul>
        <h3>11.4 Juridiction</h3>
        <p>À défaut de résolution amiable ou de médiation, tout litige sera soumis à la compétence exclusive des tribunaux de Paris, France, sous réserve des règles de compétence impératives en faveur des consommateurs.</p>
        <h3>11.5 Plateforme européenne de règlement des litiges</h3>
        <p>La Commission européenne met à disposition une plateforme de règlement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">https://ec.europa.eu/consumers/odr</a></p>
      `
    },
    {
      title: "Article 12 – Dispositions diverses",
      icon: "📝",
      content: `
        <h3>12.1 Intégralité de l'accord</h3>
        <p>Les présentes Conditions, ainsi que notre Politique de Confidentialité, constituent l'intégralité de l'accord entre vous et la Société concernant le Service.</p>
        <h3>12.2 Divisibilité</h3>
        <p>Si une disposition des présentes Conditions est jugée invalide ou inapplicable, les autres dispositions resteront pleinement en vigueur.</p>
        <h3>12.3 Renonciation</h3>
        <p>Le fait de ne pas exercer un droit prévu par les présentes Conditions ne constitue pas une renonciation à ce droit.</p>
        <h3>12.4 Cession</h3>
        <p>Vous ne pouvez pas céder ou transférer vos droits ou obligations en vertu des présentes Conditions sans notre accord écrit préalable. Nous pouvons céder nos droits et obligations sans restriction.</p>
        <h3>12.5 Force majeure</h3>
        <p>Nous ne serons pas responsables de tout retard ou manquement à nos obligations résultant de causes indépendantes de notre volonté raisonnable (catastrophes naturelles, guerre, terrorisme, pandémie, etc.).</p>
        <h3>12.6 Langue</h3>
        <p>Les présentes Conditions sont rédigées en français. En cas de traduction, la version française prévaut.</p>
      `
    },
  ]
};

// English Content
const contentEN = {
  sections: [
    {
      title: "Preamble",
      icon: "📋",
      content: `
        <p>These Terms of Service (hereinafter "Terms" or "Conditions") govern access to and use of the <strong>Nokta One</strong> application (hereinafter "the Application," "the Service," or "Nokta One").</p>
        <p>Nokta One is published by a French company registered with the Paris Trade and Companies Registry, with its headquarters located in Paris, France (hereinafter "we," "our," "the Company," or "the Publisher").</p>
        <p><strong>By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use our Service.</strong></p>
      `
    },
    {
      title: "Article 1 – Definitions",
      icon: "📖",
      content: `
        <ul>
          <li><strong>"Application"</strong>: The Nokta One mobile and web application</li>
          <li><strong>"Content"</strong>: Any text, image, video, data, or other material available through the Service</li>
          <li><strong>"User Content"</strong>: Any content you submit, upload, or transmit through the Service</li>
          <li><strong>"Service"</strong>: All features offered by Nokta One</li>
          <li><strong>"User"</strong> or <strong>"you"</strong>: Any individual using the Service</li>
          <li><strong>"Account"</strong>: Your personal account created to access the Service</li>
          <li><strong>"Personal Data"</strong>: Information relating to an identified or identifiable natural person</li>
        </ul>
      `
    },
    {
      title: "Article 2 – Acceptance of Terms",
      icon: "✅",
      content: `
        <h3>2.1 Legal Capacity</h3>
        <p>By using our Service, you represent and warrant that you:</p>
        <ul>
          <li>Are at least <strong>16 years old</strong> (or 13 years old with parental consent)</li>
          <li>Have the legal capacity to enter into a binding contract</li>
          <li>Are not a person prohibited from using the Service under applicable laws</li>
        </ul>
        <h3>2.2 Acceptance</h3>
        <p>Your access to and use of the Service is conditioned upon your acceptance and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
        <h3>2.3 Modifications</h3>
        <p>We reserve the right to modify these Terms at any time. Modifications take effect upon publication. Your continued use of the Service after notification of changes constitutes your acceptance of the new Terms.</p>
      `
    },
    {
      title: "Article 3 – Description of Service",
      icon: "🔧",
      content: `
        <h3>3.1 Features</h3>
        <p>Nokta One is a personal wellness application that offers:</p>
        <ul>
          <li>Guided physiological regulation sessions</li>
          <li>Breathing and posture exercises</li>
          <li>Wellness state tracking</li>
          <li>Personalized recommendations</li>
        </ul>
        <h3>3.2 Nature of Service</h3>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p style="color: rgb(248, 113, 113); font-weight: 600; margin-bottom: 0.5rem;">IMPORTANT – MEDICAL DISCLAIMER:</p>
          <p>The Service is provided <strong>for informational and general wellness purposes only</strong>. Nokta One:</p>
          <ul>
            <li><strong>IS NOT</strong> a medical device</li>
            <li><strong>DOES NOT PROVIDE</strong> medical diagnosis</li>
            <li><strong>DOES NOT REPLACE</strong> the advice of a healthcare professional</li>
            <li><strong>IS NOT INTENDED</strong> to treat, cure, or prevent diseases</li>
          </ul>
          <p>The indicators and recommendations provided are <strong>general wellness signals</strong> and should not be interpreted as medical advice. If you have medical concerns, consult a qualified healthcare professional.</p>
        </div>
        <h3>3.3 Availability</h3>
        <p>We strive to maintain the Service available 24/7. However, we do not guarantee uninterrupted availability and may suspend or interrupt the Service for maintenance, updates, or other technical reasons.</p>
      `
    },
    {
      title: "Article 4 – Registration and Account",
      icon: "👤",
      content: `
        <h3>4.1 Account Creation</h3>
        <p>To access certain features, you must create an account. When registering, you agree to:</p>
        <ul>
          <li>Provide accurate, complete, and up-to-date information</li>
          <li>Maintain the confidentiality of your login credentials</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
          <li>Be responsible for all activities conducted under your account</li>
        </ul>
        <h3>4.2 Guest Mode</h3>
        <p>You may use certain features in guest mode without creating an account. Data in guest mode is not permanently saved.</p>
        <h3>4.3 Account Security</h3>
        <p>You are solely responsible for protecting your account. We will not be liable for losses resulting from unauthorized use of your account.</p>
      `
    },
    {
      title: "Article 5 – Subscriptions and Payments",
      icon: "💳",
      content: `
        <h3>5.1 Plans</h3>
        <p>The Service may be offered under different formulas:</p>
        <ul>
          <li><strong>Free</strong>: Limited access to certain features</li>
          <li><strong>Premium</strong>: Full access through a paid subscription</li>
        </ul>
        <h3>5.2 Pricing</h3>
        <p>Prices are displayed in euros (€) including taxes. We reserve the right to modify our prices at any time, subject to prior notification.</p>
        <h3>5.3 Payment</h3>
        <p>Payments are processed by our secure payment provider. By subscribing, you authorize automatic debit of the corresponding amount.</p>
        <h3>5.4 Automatic Renewal</h3>
        <p>Subscriptions are automatically renewed at expiration, unless you cancel before the renewal date.</p>
        <h3>5.5 Cancellation</h3>
        <p>You may cancel your subscription at any time from your account settings or via the platform (App Store, Google Play). Cancellation takes effect at the end of the current subscription period.</p>
        <h3>5.6 Right of Withdrawal</h3>
        <p>In accordance with applicable consumer protection laws, the right of withdrawal cannot be exercised for digital content not supplied on a tangible medium whose performance has begun with your prior consent and acknowledgment of the loss of the right of withdrawal.</p>
        <h3>5.7 Refunds</h3>
        <p>Unless otherwise required by law or in case of billing error on our part, payments made are non-refundable.</p>
      `
    },
    {
      title: "Article 6 – Rules of Use",
      icon: "📜",
      content: `
        <h3>6.1 Permitted Use</h3>
        <p>You agree to use the Service:</p>
        <ul>
          <li>In accordance with these Terms and applicable laws</li>
          <li>For personal and non-commercial purposes</li>
          <li>Without harming other users or the operation of the Service</li>
        </ul>
        <h3>6.2 Prohibited Conduct</h3>
        <p>It is strictly prohibited to:</p>
        <ul>
          <li>Use the Service for illegal or unauthorized purposes</li>
          <li>Attempt unauthorized access to our systems</li>
          <li>Transmit viruses, malware, or malicious code</li>
          <li>Collect or store personal data of other users</li>
          <li>Impersonate another person</li>
          <li>Disrupt or overload our infrastructure</li>
          <li>Circumvent security or access restriction measures</li>
          <li>Resell, sublicense, or transfer your access to the Service</li>
          <li>Use robots, scrapers, or automated tools without authorization</li>
          <li>Reproduce, duplicate, copy, or exploit the Service for commercial purposes</li>
        </ul>
        <h3>6.3 User Content</h3>
        <p>If you submit content through the Service (comments, images, etc.):</p>
        <ul>
          <li>You retain your intellectual property rights</li>
          <li>You grant us a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, and display that content in connection with the Service</li>
          <li>You warrant that such content does not violate the rights of third parties</li>
        </ul>
      `
    },
    {
      title: "Article 7 – Intellectual Property",
      icon: "©️",
      content: `
        <h3>7.1 Company Rights</h3>
        <p>The Service and its original content (excluding User Content), including but not limited to: source code, texts, graphics, logos, icons, images, audio and video clips, data compilations, and software, are the exclusive property of the Company or its licensors and are protected by French and international intellectual property laws.</p>
        <h3>7.2 Trademarks</h3>
        <p>"Nokta One" and associated logos are trademarks of the Company. You may not use them without our prior written authorization.</p>
        <h3>7.3 Limited License</h3>
        <p>Subject to compliance with these Terms, we grant you a personal, limited, non-exclusive, non-transferable, and revocable license to access and use the Service for personal and non-commercial purposes.</p>
      `
    },
    {
      title: "Article 8 – Limitation of Liability",
      icon: "⚠️",
      content: `
        <h3>8.1 Disclaimer of Warranties</h3>
        <p style="font-weight: 600; color: rgb(248, 113, 113);">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.</p>
        <p>We do not warrant that:</p>
        <ul>
          <li>The Service will meet your specific needs</li>
          <li>The Service will be uninterrupted, secure, or error-free</li>
          <li>Results obtained will be accurate or reliable</li>
          <li>Defects will be corrected</li>
        </ul>
        <h3>8.2 Limitation of Liability</h3>
        <p style="font-weight: 600; color: rgb(248, 113, 113);">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY SHALL NOT BE LIABLE FOR:</p>
        <ul>
          <li>Indirect, incidental, special, consequential, or punitive damages</li>
          <li>Any loss of profits, data, use, goodwill, or other intangible loss</li>
          <li>Damages resulting from your use or inability to use the Service</li>
          <li>Damages resulting from unauthorized access to your data</li>
        </ul>
        <h3>8.3 Liability Cap</h3>
        <p>The Company's total liability for any claim arising from these Terms or use of the Service is limited to the amount you paid for the Service in the last 12 months, or €100 if you have not made any payment.</p>
        <h3>8.4 Exceptions</h3>
        <p>Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.</p>
      `
    },
    {
      title: "Article 9 – Indemnification",
      icon: "🛡️",
      content: `
        <p>You agree to defend, indemnify, and hold harmless the Company, its officers, directors, employees, and agents, from any claim, damage, obligation, loss, liability, cost, or expense (including attorney's fees) arising from:</p>
        <ul>
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of the rights of a third party</li>
          <li>Your User Content</li>
        </ul>
      `
    },
    {
      title: "Article 10 – Suspension and Termination",
      icon: "🚫",
      content: `
        <h3>10.1 By You</h3>
        <p>You may stop using the Service and delete your account at any time from the Application settings.</p>
        <h3>10.2 By Us</h3>
        <p>We may suspend or terminate your access to the Service immediately, without notice or liability, if:</p>
        <ul>
          <li>You violate these Terms</li>
          <li>We reasonably believe your conduct is detrimental to the Service or other users</li>
          <li>Required by law</li>
        </ul>
        <h3>10.3 Effects of Termination</h3>
        <p>Upon termination:</p>
        <ul>
          <li>Your right to use the Service ceases immediately</li>
          <li>We may delete or disable your account and all associated data</li>
          <li>Provisions that, by their nature, should survive termination will survive (including: Intellectual Property, Limitation of Liability, Indemnification, Governing Law)</li>
        </ul>
      `
    },
    {
      title: "Article 11 – Governing Law and Disputes",
      icon: "⚖️",
      content: `
        <h3>11.1 Governing Law</h3>
        <p>These Terms are governed by and construed in accordance with French law, without regard to conflict of law principles.</p>
        <h3>11.2 Amicable Resolution</h3>
        <p>In case of dispute, the parties will endeavor to find an amicable solution. You may contact us at: support@nokta.app</p>
        <h3>11.3 Mediation</h3>
        <p>In accordance with applicable consumer protection laws, in case of unresolved dispute, you may use the mediation service free of charge:</p>
        <ul>
          <li><strong>Consumer Mediator</strong>: [Details to be completed upon mediator designation]</li>
        </ul>
        <h3>11.4 Jurisdiction</h3>
        <p>Failing amicable resolution or mediation, any dispute shall be submitted to the exclusive jurisdiction of the courts of Paris, France, subject to mandatory jurisdiction rules in favor of consumers.</p>
        <h3>11.5 European Online Dispute Resolution Platform</h3>
        <p>The European Commission provides an online dispute resolution platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style="color: rgb(59, 130, 246);">https://ec.europa.eu/consumers/odr</a></p>
      `
    },
    {
      title: "Article 12 – Miscellaneous Provisions",
      icon: "📝",
      content: `
        <h3>12.1 Entire Agreement</h3>
        <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and the Company regarding the Service.</p>
        <h3>12.2 Severability</h3>
        <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
        <h3>12.3 Waiver</h3>
        <p>Failure to exercise a right provided by these Terms does not constitute a waiver of that right.</p>
        <h3>12.4 Assignment</h3>
        <p>You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign our rights and obligations without restriction.</p>
        <h3>12.5 Force Majeure</h3>
        <p>We shall not be liable for any delay or failure to perform our obligations resulting from causes beyond our reasonable control (natural disasters, war, terrorism, pandemic, etc.).</p>
        <h3>12.6 Language</h3>
        <p>These Terms are written in French. In case of translation, the French version prevails.</p>
      `
    },
  ]
};
