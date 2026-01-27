/**
 * 🌍 NOKTA ONE - SEO Filename Generator
 * 
 * Génère des noms de fichier SEO optimisés pour les images partagées.
 * Format adapté pour le ranking SEO quand les images sont publiées sur les réseaux sociaux.
 */

import { MicroActionType } from "./types";

interface SEOFilenameOptions {
  actionId: MicroActionType;
  username?: string;
  scores?: {
    before: [number, number];
    after: [number, number];
  };
  feedback?: "better" | "same" | "worse";
  locale?: string;
}

/**
 * Génère un nom de fichier SEO optimisé pour le partage
 * 
 * Format final: nokta-one-{keyword}-{result}-{username?}-{month-year}.png
 * 
 * Exemples:
 * - nokta-one-breathing-technique-reset-major-reset-john-jan-2026.png
 * - nokta-one-box-breathing-reset-successful-reset-jan-2026.png
 */
export function generateSEOFilename(options: SEOFilenameOptions): string {
  const { actionId, username, scores, feedback, locale = "fr" } = options;
  
  const date = new Date();
  const monthYear = date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  }).toLowerCase().replace(' ', '-');
  
  // Mapping action -> mots-clés SEO principaux (optimisés pour le ranking)
  const actionKeywords: Record<MicroActionType, string> = {
    physiological_sigh: "breathing-technique-reset",
    box_breathing: "box-breathing-reset",
    expiration_3_8: "deep-breathing-reset",
    respiration_4_6: "heart-coherence-reset",
    respiration_2_1: "energy-boost-reset",
    drop_trapezes: "shoulder-release-reset",
    shake_neuromusculaire: "stress-shake-reset",
    posture_ancrage: "grounding-exercise-reset",
    ouverture_thoracique: "chest-opening-reset",
    pression_plantaire: "grounding-technique-reset",
    regard_fixe_expiration: "focus-breathing-reset",
  };

  const keyword = actionKeywords[actionId] || "wellness-reset";
  
  // Parts du nom de fichier (ordre SEO-optimisé)
  const parts: string[] = [];
  
  // 1. Marque principale (toujours en premier pour le branding)
  parts.push("nokta-one");
  
  // 2. Mots-clés de l'action (recherche principale)
  parts.push(keyword);
  
  // 3. Indicateur de résultat (pour le ranking long-terme)
  let resultKeyword = "body-reset";
  
  if (scores) {
    const beforeAvg = (scores.before[0] + scores.before[1]) / 2;
    const afterAvg = (scores.after[0] + scores.after[1]) / 2;
    const delta = beforeAvg - afterAvg;
    
    if (delta > 50) {
      resultKeyword = "major-reset";
    } else if (delta > 40) {
      resultKeyword = "significant-reset";
    } else if (delta > 30) {
      resultKeyword = "effective-reset";
    }
  } else if (feedback === "better") {
    resultKeyword = "successful-reset";
  }
  
  parts.push(resultKeyword);
  
  // 4. Username (personnalisation pour SEO local et engagement)
  // Seulement si l'username est significatif (3+ chars)
  let cleanUsername: string | null = null;
  if (username && username.length >= 3) {
    cleanUsername = username
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever accents
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 15); // Max 15 chars pour éviter les noms trop longs
    
    if (cleanUsername && cleanUsername.length >= 3) {
      parts.push(cleanUsername);
    }
  }
  
  // 5. Date (format: jan-2026) pour la fraîcheur du contenu
  parts.push(monthYear);
  
  // Assembler le nom final
  let filename = parts.join('-');
  
  // S'assurer que le nom ne dépasse pas 100 caractères (limite systèmes de fichiers)
  // Les noms courts sont aussi meilleurs pour le SEO
  const maxLength = 100;
  if (filename.length > maxLength) {
    // Réduire d'abord le username si présent
    if (cleanUsername && parts.includes(cleanUsername)) {
      const usernameIndex = parts.indexOf(cleanUsername);
      parts[usernameIndex] = cleanUsername.substring(0, 8);
      filename = parts.join('-');
    }
    
    // Si toujours trop long, tronquer intelligemment
    if (filename.length > maxLength) {
      // Garder les parties importantes : nokta-one, keyword, result, date
      const essential = [parts[0], parts[1], parts[2], parts[parts.length - 1]];
      filename = essential.join('-');
      
      // Si encore trop long, raccourcir le keyword
      if (filename.length > maxLength) {
        const shortKeyword = keyword.split('-').slice(0, 2).join('-');
        filename = [parts[0], shortKeyword, parts[2], parts[parts.length - 1]].join('-');
      }
    }
  }
  
  return `${filename}.png`;
}

/**
 * Génère un nom de fichier simple pour le partage SKANE Index
 * Format: nokta-one-skane-@[username]-[YYYY-MM-DD].png
 * Exemple: nokta-one-skane-@benjamin-2026-01-17.png
 */
export function generateSkaneFilename(username: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  // Nettoyer le username (enlever @ si déjà présent, remplacer espaces)
  const cleanUsername = username.replace('@', '').replace(/\s+/g, '-').toLowerCase();
  return `nokta-one-skane-@${cleanUsername}-${date}.png`;
}
