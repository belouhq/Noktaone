/**
 * CSP Mapper - Catégorie Socio-Professionnelle
 * 
 * Mappe les occupations/métiers vers les CSP françaises (INSEE)
 * Utilisé pour segmenter et mieux comprendre les utilisateurs
 */

export type CSPCategory = 
  | "agriculteurs"
  | "artisans_commerçants"
  | "cadres"
  | "professions_intermediaires"
  | "employes"
  | "ouvriers"
  | "retraites"
  | "etudiants"
  | "sans_activite"
  | "autre";

export interface CSPMapping {
  category: CSPCategory;
  label: string;
  description: string;
}

/**
 * Mappe une occupation (texte libre) vers une CSP
 */
export function mapOccupationToCSP(occupation: string): CSPMapping | null {
  if (!occupation || occupation.trim().length === 0) {
    return null;
  }

  const normalized = occupation.toLowerCase().trim();

  // Cadres et professions intellectuelles supérieures
  if (
    normalized.includes("directeur") ||
    normalized.includes("manager") ||
    normalized.includes("ceo") ||
    normalized.includes("cto") ||
    normalized.includes("cfo") ||
    normalized.includes("pdg") ||
    normalized.includes("cadre") ||
    normalized.includes("executive") ||
    normalized.includes("avocat") ||
    normalized.includes("médecin") ||
    normalized.includes("docteur") ||
    normalized.includes("architecte") ||
    normalized.includes("ingénieur") ||
    normalized.includes("consultant") ||
    normalized.includes("expert")
  ) {
    return {
      category: "cadres",
      label: "Cadres et professions intellectuelles supérieures",
      description: "Professions libérales, cadres d'entreprise, ingénieurs",
    };
  }

  // Professions intermédiaires
  if (
    normalized.includes("enseignant") ||
    normalized.includes("professeur") ||
    normalized.includes("infirmier") ||
    normalized.includes("technicien") ||
    normalized.includes("assistant") ||
    normalized.includes("coordinateur") ||
    normalized.includes("superviseur") ||
    normalized.includes("chef de projet") ||
    normalized.includes("responsable")
  ) {
    return {
      category: "professions_intermediaires",
      label: "Professions intermédiaires",
      description: "Techniciens, agents de maîtrise, professions intermédiaires",
    };
  }

  // Artisans, commerçants, chefs d'entreprise
  if (
    normalized.includes("artisan") ||
    normalized.includes("commerçant") ||
    normalized.includes("boutique") ||
    normalized.includes("restaurant") ||
    normalized.includes("café") ||
    normalized.includes("entrepreneur") ||
    normalized.includes("freelance") ||
    normalized.includes("indépendant") ||
    normalized.includes("auto-entrepreneur") ||
    normalized.includes("créateur")
  ) {
    return {
      category: "artisans_commerçants",
      label: "Artisans, commerçants et chefs d'entreprise",
      description: "Commerçants, artisans, chefs d'entreprise de moins de 10 salariés",
    };
  }

  // Employés
  if (
    normalized.includes("employé") ||
    normalized.includes("employe") ||
    normalized.includes("secrétaire") ||
    normalized.includes("agent") ||
    normalized.includes("vendeur") ||
    normalized.includes("caissier") ||
    normalized.includes("réceptionniste") ||
    normalized.includes("assistant administratif") ||
    normalized.includes("standardiste")
  ) {
    return {
      category: "employes",
      label: "Employés",
      description: "Employés de commerce, de service, administratifs",
    };
  }

  // Ouvriers
  if (
    normalized.includes("ouvrier") ||
    normalized.includes("manœuvre") ||
    normalized.includes("conducteur") ||
    normalized.includes("chauffeur") ||
    normalized.includes("mécanicien") ||
    normalized.includes("électricien") ||
    normalized.includes("plombier") ||
    normalized.includes("maçon") ||
    normalized.includes("peintre") ||
    normalized.includes("couvreur")
  ) {
    return {
      category: "ouvriers",
      label: "Ouvriers",
      description: "Ouvriers qualifiés et non qualifiés",
    };
  }

  // Agriculteurs
  if (
    normalized.includes("agriculteur") ||
    normalized.includes("fermier") ||
    normalized.includes("éleveur") ||
    normalized.includes("viticulteur") ||
    normalized.includes("maréchal-ferrant")
  ) {
    return {
      category: "agriculteurs",
      label: "Agriculteurs exploitants",
      description: "Agriculteurs, éleveurs, exploitants agricoles",
    };
  }

  // Étudiants
  if (
    normalized.includes("étudiant") ||
    normalized.includes("etudiant") ||
    normalized.includes("élève") ||
    normalized.includes("apprenti") ||
    normalized.includes("stagiaire") ||
    normalized.includes("études") ||
    normalized.includes("université") ||
    normalized.includes("école")
  ) {
    return {
      category: "etudiants",
      label: "Étudiants",
      description: "Étudiants, élèves, apprentis",
    };
  }

  // Retraités
  if (
    normalized.includes("retraité") ||
    normalized.includes("retraite") ||
    normalized.includes("pensionné")
  ) {
    return {
      category: "retraites",
      label: "Retraités",
      description: "Retraités de l'emploi",
    };
  }

  // Sans activité
  if (
    normalized.includes("chômeur") ||
    normalized.includes("chomeur") ||
    normalized.includes("sans emploi") ||
    normalized.includes("au foyer") ||
    normalized.includes("inactif")
  ) {
    return {
      category: "sans_activite",
      label: "Autres personnes sans activité professionnelle",
      description: "Chômeurs, personnes au foyer, inactifs",
    };
  }

  // Par défaut : autre
  return {
    category: "autre",
    label: "Autre",
    description: "Autre profession non classée",
  };
}

/**
 * Obtient toutes les catégories CSP avec leurs labels
 */
export function getAllCSPCategories(): CSPMapping[] {
  return [
    {
      category: "cadres",
      label: "Cadres et professions intellectuelles supérieures",
      description: "Professions libérales, cadres d'entreprise, ingénieurs",
    },
    {
      category: "professions_intermediaires",
      label: "Professions intermédiaires",
      description: "Techniciens, agents de maîtrise, professions intermédiaires",
    },
    {
      category: "artisans_commerçants",
      label: "Artisans, commerçants et chefs d'entreprise",
      description: "Commerçants, artisans, chefs d'entreprise de moins de 10 salariés",
    },
    {
      category: "employes",
      label: "Employés",
      description: "Employés de commerce, de service, administratifs",
    },
    {
      category: "ouvriers",
      label: "Ouvriers",
      description: "Ouvriers qualifiés et non qualifiés",
    },
    {
      category: "agriculteurs",
      label: "Agriculteurs exploitants",
      description: "Agriculteurs, éleveurs, exploitants agricoles",
    },
    {
      category: "etudiants",
      label: "Étudiants",
      description: "Étudiants, élèves, apprentis",
    },
    {
      category: "retraites",
      label: "Retraités",
      description: "Retraités de l'emploi",
    },
    {
      category: "sans_activite",
      label: "Autres personnes sans activité professionnelle",
      description: "Chômeurs, personnes au foyer, inactifs",
    },
    {
      category: "autre",
      label: "Autre",
      description: "Autre profession non classée",
    },
  ];
}
