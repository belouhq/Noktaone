/**
 * SHARE SERVICE V1 - Avec TikTok + Sans Émojis
 * 
 * MODIFICATIONS :
 * 1. TikTok INCLUS avec flow guidé (télécharger + instructions)
 * 2. AUCUN émoji dans l'interface (sauf feedback utilisateur)
 * 3. Ton professionnel, B2B-ready
 * 
 * STRATÉGIE TIKTOK :
 * Puisque TikTok ne permet pas le deep link posting,
 * on guide l'utilisateur avec un flow en 2 étapes :
 * 1. Télécharger l'image automatiquement
 * 2. Ouvrir TikTok avec instructions contextuelles
 */

// ============================================
// TYPES
// ============================================

export type SharePlatform = 
  | "native"          // Web Share API
  | "instagram"       // Instagram Stories
  | "tiktok"          // TikTok (flow guidé)
  | "whatsapp"        // WhatsApp
  | "facebook"        // Facebook Stories
  | "twitter"         // X/Twitter
  | "snapchat"        // Snapchat
  | "telegram"        // Telegram
  | "copy"            // Copier le lien
  | "download";       // Télécharger l'image

export interface ShareData {
  imageBlob: Blob;
  imageUrl?: string;
  filename?: string; // Nom de fichier SEO pour le téléchargement
  title: string;
  text: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  platform: SharePlatform;
  error?: string;
  requiresManualStep?: boolean; // Pour TikTok
}

function triggerDownload(imageBlob?: Blob, filename?: string) {
  if (!imageBlob) return;
  const url = URL.createObjectURL(imageBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "nokta-skane.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// DÉTECTION PLATEFORME
// ============================================

export function detectPlatform(): "ios" | "android" | "desktop" {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

export function isWebShareSupported(): boolean {
  return typeof navigator !== "undefined" && 
         typeof navigator.share === "function" &&
         typeof navigator.canShare === "function";
}

export function canShareFiles(): boolean {
  if (!isWebShareSupported()) return false;
  
  try {
    const testFile = new File(["test"], "test.png", { type: "image/png" });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

// Vérifier si une app est installée (approximatif)
export function isTikTokInstalled(): boolean {
  // On ne peut pas vraiment le savoir, mais on assume oui sur mobile
  return detectPlatform() !== "desktop";
}

// ============================================
// WEB SHARE API (PRIORITÉ #1)
// ============================================

export async function shareNative(data: ShareData): Promise<ShareResult> {
  if (!isWebShareSupported()) {
    return { success: false, platform: "native", error: "Not supported" };
  }

  try {
    const sharePayload: any = {
      title: data.title,
      text: data.text,
      url: data.url,
    };

    if (canShareFiles() && data.imageBlob) {
      const file = new File([data.imageBlob], "nokta-skane.png", { 
        type: "image/png" 
      });
      sharePayload.files = [file];
    }

    await navigator.share(sharePayload);
    
    return { success: true, platform: "native" };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return { success: false, platform: "native", error: "Cancelled" };
    }
    return { success: false, platform: "native", error: error.message };
  }
}

// ============================================
// INSTAGRAM STORIES
// ============================================

export async function shareToInstagramStories(data: ShareData): Promise<ShareResult> {
  const platform = detectPlatform();
  
  if (platform === "desktop") {
    window.open("https://www.instagram.com/", "_blank");
    return { 
      success: true, 
      platform: "instagram",
      requiresManualStep: true,
    };
  }

  try {
    // Copier l'image dans le clipboard si possible (sans casser le geste utilisateur)
    if (platform === "ios" && data.imageBlob) {
      navigator.clipboard.write([
        new ClipboardItem({ "image/png": data.imageBlob })
      ]).catch((e) => {
        console.warn("Could not copy to clipboard:", e);
      });
    }
    
    // Télécharger l'image pour l'ajouter depuis Photos si besoin
    triggerDownload(data.imageBlob, data.filename);

    // Ouvrir le partage Story Instagram
    if (platform === "android") {
      window.location.href =
        "intent://share#Intent;scheme=instagram-stories;package=com.instagram.android;end";
    } else {
      window.location.href = "instagram-stories://share?source_application=com.nokta.one";
    }
    
    return { success: true, platform: "instagram", requiresManualStep: true };
    
  } catch (error: any) {
    return { success: false, platform: "instagram", error: error.message };
  }
}

// ============================================
// TIKTOK - FLOW GUIDÉ
// ============================================

/**
 * TikTok ne permet pas le partage direct.
 * Flow en 2 étapes :
 * 1. Télécharger l'image automatiquement
 * 2. Ouvrir TikTok (l'utilisateur crée sa story manuellement)
 * 
 * On retourne requiresManualStep: true pour afficher les instructions
 */
export async function shareToTikTok(data: ShareData): Promise<ShareResult> {
  const platform = detectPlatform();
  
  try {
    // Étape 1 : Télécharger l'image automatiquement
    triggerDownload(data.imageBlob, data.filename);

    // Étape 2 : Ouvrir TikTok immédiatement (garder le geste utilisateur)
    if (platform === "ios") {
      // iOS deep link
      window.location.href = "tiktok://";
    } else if (platform === "android") {
      // Android intent
      window.location.href = "intent://www.tiktok.com/#Intent;package=com.zhiliaoapp.musically;scheme=https;end";
    } else {
      // Desktop fallback
      window.open("https://www.tiktok.com/upload", "_blank");
    }
    
    return { 
      success: true, 
      platform: "tiktok",
      requiresManualStep: true 
    };
    
  } catch (error: any) {
    return { success: false, platform: "tiktok", error: error.message };
  }
}

// ============================================
// WHATSAPP
// ============================================

export async function shareToWhatsApp(data: ShareData): Promise<ShareResult> {
  try {
    triggerDownload(data.imageBlob, data.filename);
    const text = encodeURIComponent(`${data.text}\n\n${data.url || ""}`);
    const whatsappUrl = `whatsapp://send?text=${text}`;
    const webUrl = `https://wa.me/?text=${text}`;
    
    if (detectPlatform() === "desktop") {
      window.open(webUrl, "_blank");
    } else {
      window.location.href = whatsappUrl;
    }
    
    return { success: true, platform: "whatsapp", requiresManualStep: true };
  } catch (error: any) {
    const text = encodeURIComponent(`${data.text}\n\n${data.url || ""}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    
    return { success: true, platform: "whatsapp", requiresManualStep: true };
  }
}

// ============================================
// TWITTER / X
// ============================================

export async function shareToTwitter(data: ShareData): Promise<ShareResult> {
  try {
    triggerDownload(data.imageBlob, data.filename);
    const text = encodeURIComponent(data.text);
    const url = encodeURIComponent(data.url || "");
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    
    window.open(twitterUrl, "_blank");
    
    return { success: true, platform: "twitter", requiresManualStep: true };
  } catch (error: any) {
    return { success: false, platform: "twitter", error: error.message };
  }
}

// ============================================
// TELEGRAM
// ============================================

export async function shareToTelegram(data: ShareData): Promise<ShareResult> {
  try {
    triggerDownload(data.imageBlob, data.filename);
    const text = encodeURIComponent(`${data.text}\n\n${data.url || ""}`);
    const tgUrl = `tg://msg?text=${text}`;
    const webUrl = `https://t.me/share/url?url=${encodeURIComponent(data.url || "")}&text=${text}`;
    if (detectPlatform() === "desktop") {
      window.open(webUrl, "_blank");
    } else {
      window.location.href = tgUrl;
    }
    
    return { success: true, platform: "telegram", requiresManualStep: true };
  } catch (error: any) {
    const text = encodeURIComponent(`${data.text}\n\n${data.url || ""}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(data.url || "")}&text=${text}`, "_blank");
    
    return { success: true, platform: "telegram", requiresManualStep: true };
  }
}

// ============================================
// FACEBOOK STORIES
// ============================================

export async function shareToFacebookStories(data: ShareData): Promise<ShareResult> {
  try {
    triggerDownload(data.imageBlob, data.filename);
    if (detectPlatform() === "desktop") {
      window.open("https://www.facebook.com/stories/", "_blank");
    } else {
      window.location.href = "fb://stories/create";
    }
    return { success: true, platform: "facebook", requiresManualStep: true };
  } catch (error: any) {
    return { success: false, platform: "facebook", error: error.message };
  }
}

// ============================================
// SNAPCHAT
// ============================================

export async function shareToSnapchat(data: ShareData): Promise<ShareResult> {
  const platform = detectPlatform();
  
  if (platform === "desktop") {
    return { success: false, platform: "snapchat", error: "Snapchat requires mobile" };
  }

  try {
    // Télécharger l'image d'abord
    triggerDownload(data.imageBlob, data.filename);

    // Ouvrir Snapchat
    window.location.href = "snapchat://";
    
    return { success: true, platform: "snapchat", requiresManualStep: true };
  } catch (error: any) {
    return { success: false, platform: "snapchat", error: error.message };
  }
}

// ============================================
// COPIER LE LIEN
// ============================================

export async function copyLink(url: string): Promise<ShareResult> {
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, platform: "copy" };
  } catch (error: any) {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    
    return { success: true, platform: "copy" };
  }
}

// ============================================
// TÉLÉCHARGER L'IMAGE
// ============================================

export async function downloadImage(data: ShareData): Promise<ShareResult> {
  try {
    const url = URL.createObjectURL(data.imageBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename || "nokta-skane.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { success: true, platform: "download" };
  } catch (error: any) {
    return { success: false, platform: "download", error: error.message };
  }
}

// ============================================
// SHARE DISPATCHER
// ============================================

export async function share(
  platform: SharePlatform,
  data: ShareData
): Promise<ShareResult> {
  switch (platform) {
    case "native":
      return shareNative(data);
    case "instagram":
      return shareToInstagramStories(data);
    case "tiktok":
      return shareToTikTok(data);
    case "whatsapp":
      return shareToWhatsApp(data);
    case "twitter":
      return shareToTwitter(data);
    case "telegram":
      return shareToTelegram(data);
    case "facebook":
      return shareToFacebookStories(data);
    case "snapchat":
      return shareToSnapchat(data);
    case "copy":
      return copyLink(data.url || "https://noktaone.app");
    case "download":
      return downloadImage(data);
    default:
      return { success: false, platform, error: "Unknown platform" };
  }
}

// ============================================
// PLATEFORMES DISPONIBLES
// ============================================

export interface PlatformOption {
  id: SharePlatform;
  name: string;
  icon: string;
  color: string;
  available: boolean;
  recommended: boolean;
  requiresManualStep?: boolean;
  manualStepDescription?: string;
}

export function getAvailablePlatforms(options?: { includeUnavailable?: boolean }): PlatformOption[] {
  const platform = detectPlatform();
  const webShareSupported = isWebShareSupported();
  const canShare = canShareFiles();
  const isMobile = platform !== "desktop";

  const platforms: PlatformOption[] = [
    // Web Share API (natif)
    {
      id: "native",
      name: "Partager",
      icon: "share",
      color: "#3B82F6",
      available: webShareSupported,
      recommended: webShareSupported && canShare,
    },
    // TikTok - TOUJOURS DISPONIBLE sur mobile (flow guidé)
    {
      id: "tiktok",
      name: "TikTok Story",
      icon: "tiktok",
      color: "#000000",
      available: isMobile,
      recommended: isMobile, // Recommandé car stratégie virale TikTok
      requiresManualStep: true,
      manualStepDescription: "Image téléchargée. Créez votre story sur TikTok.",
    },
    // Instagram Stories
    {
      id: "instagram",
      name: "Instagram Story",
      icon: "instagram",
      color: "#E4405F",
      available: true,
      recommended: isMobile,
      requiresManualStep: true,
      manualStepDescription: "Story ouverte. Ajoutez l'image (coller ou depuis Photos), puis envoyez.",
    },
    // WhatsApp
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "whatsapp",
      color: "#25D366",
      available: true,
      recommended: false,
      requiresManualStep: true,
      manualStepDescription: "WhatsApp ouvert. Ajoutez l'image puis envoyez.",
    },
    // Snapchat
    {
      id: "snapchat",
      name: "Snapchat",
      icon: "snapchat",
      color: "#FFFC00",
      available: isMobile,
      recommended: false,
      requiresManualStep: true,
      manualStepDescription: "Image téléchargée. Créez votre snap.",
    },
    // Twitter/X
    {
      id: "twitter",
      name: "X",
      icon: "twitter",
      color: "#000000",
      available: true,
      recommended: false,
      requiresManualStep: true,
      manualStepDescription: "X ouvert. Ajoutez l'image puis publiez.",
    },
    // Telegram
    {
      id: "telegram",
      name: "Telegram",
      icon: "telegram",
      color: "#0088CC",
      available: true,
      recommended: false,
      requiresManualStep: true,
      manualStepDescription: "Telegram ouvert. Ajoutez l'image puis envoyez.",
    },
    // Facebook Stories
    {
      id: "facebook",
      name: "Facebook",
      icon: "facebook",
      color: "#1877F2",
      available: isMobile,
      recommended: false,
      requiresManualStep: true,
      manualStepDescription: "Story ouverte. Ajoutez l'image puis publiez.",
    },
    // Télécharger
    {
      id: "download",
      name: "Enregistrer",
      icon: "download",
      color: "#6B7280",
      available: true,
      recommended: false,
    },
    // Copier le lien
    {
      id: "copy",
      name: "Copier",
      icon: "copy",
      color: "#6B7280",
      available: true,
      recommended: false,
    },
  ];

  const visible = options?.includeUnavailable ? platforms : platforms.filter((p) => p.available);

  return visible.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return 0;
  });
}

// ============================================
// MESSAGES VIRAUX (SANS ÉMOJI)
// ============================================

export function getShareMessage(language: string = "fr"): string {
  const messages = {
    fr: [
      "J'étais off. J'ai skané.",
      "30 secondes. Reset.",
      "Mon corps avait besoin d'un reset.",
      "Quand le corps est off, skane.",
    ],
    en: [
      "I was off. I skaned.",
      "30 seconds. Reset.",
      "My body needed a reset.",
      "When the body is off, skane.",
    ],
  };

  const langMessages = messages[language as keyof typeof messages] || messages.en;
  return langMessages[Math.floor(Math.random() * langMessages.length)];
}

export function getShareStoryMessage(language: string = "fr"): string {
  const messages = {
    fr: [
      "Story Skane. Reset en 30 secondes.",
      "Story Skane · 30 secondes pour reset.",
      "Story Skane. Mon système s'est recalé.",
    ],
    en: [
      "Skane story. 30-second reset.",
      "Skane story · 30 seconds to reset.",
      "Skane story. My system re-centered.",
    ],
  };

  const langMessages = messages[language as keyof typeof messages] || messages.en;
  return langMessages[Math.floor(Math.random() * langMessages.length)];
}

export function getShareUrl(): string {
  return "https://noktaone.app";
}

export default {
  share,
  shareNative,
  shareToInstagramStories,
  shareToTikTok,
  shareToWhatsApp,
  shareToTwitter,
  shareToTelegram,
  shareToFacebookStories,
  shareToSnapchat,
  copyLink,
  downloadImage,
  getAvailablePlatforms,
  getShareMessage,
  getShareStoryMessage,
  getShareUrl,
  detectPlatform,
  isWebShareSupported,
  canShareFiles,
  isTikTokInstalled,
};
