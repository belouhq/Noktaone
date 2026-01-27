/**
 * Templates de partage viral — TikTok, Instagram, Twitter, WhatsApp
 */

export const SHARE_TEMPLATES: Record<
  string,
  { captions: string[]; instructions?: string[] }
> = {
  tiktok: {
    captions: [
      "Mon stress : {before} → {after} en {duration}s 🧠\n#NoktaReset #BodyReset",
      "{duration} secondes. C'est tout ce qu'il m'a fallu.\n#NoktaOne #Reset",
      "Avant/Après en {duration}s. Le body reset c'est réel.\n#Nokta #Wellness",
      "-{delta} points de stress. {duration} secondes.\n#NoktaReset",
    ],
    instructions: [
      "1. L'image est téléchargée",
      "2. Ouvre TikTok",
      "3. Crée une nouvelle vidéo",
      "4. Ajoute l'image depuis ta galerie",
      "5. Le texte est déjà copié !",
    ],
  },
  instagram: {
    captions: [
      "Mon reset du jour 🧠\n{before} → {after} en {duration}s\n\n#NoktaOne #BodyReset #Wellness",
      "45 secondes pour reset mon système nerveux.\nAvant : {before} | Après : {after}\n\n#Nokta #Reset",
    ],
  },
  twitter: {
    captions: [
      "Mon stress : {before} → {after} en {duration}s\n\nLe body reset c'est pas du bullshit.\n\n#NoktaReset",
      "{duration}s pour passer de {before} à {after}. Je teste depuis 1 semaine.\n\n#Nokta",
    ],
  },
  whatsapp: {
    captions: [
      "Regarde ça : mon stress est passé de {before} à {after} en {duration}s avec cette app. Nokta, ça s'appelle.",
      "J'ai trouvé un truc de ouf. {duration} secondes et mon niveau de stress passe de {before} à {after}.",
    ],
  },
};

export interface ShareTextData {
  beforeScore: string;
  afterScore: string;
  duration: number;
  delta: number;
}

export function generateShareText(
  platform: string,
  data: ShareTextData
): string {
  const templates =
    SHARE_TEMPLATES[platform]?.captions ?? SHARE_TEMPLATES.tiktok.captions;
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  return template
    .replace("{before}", data.beforeScore)
    .replace("{after}", data.afterScore)
    .replace("{duration}", String(data.duration))
    .replace("{delta}", String(data.delta));
}

export function downloadImage(blob: Blob, filename: string): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
