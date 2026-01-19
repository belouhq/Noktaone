# 📸 Optimisation du Format d'Image et Noms de Fichier SEO

## 📐 Format d'Image Standardisé

Toutes les images partagées utilisent maintenant le **format Story optimal** :

- **Dimensions** : 1080x1920 pixels (ratio 9:16)
- **Pixel Ratio** : 2x (Retina/HiDPI) pour une qualité optimale
- **Format final** : Image générée à 2160x3840, puis redimensionnée à 1080x1920

### Pourquoi ce format ?

- ✅ **Instagram Stories** : Format natif 9:16
- ✅ **TikTok** : Format vertical optimal
- ✅ **Facebook Stories** : Compatible 9:16
- ✅ **WhatsApp Status** : Format vertical
- ✅ **Snapchat** : Stories verticales

## 🔍 Génération de Noms de Fichier SEO

### Format Généré

```
nokta-one-{keyword}-{result}-{username?}-{month-year}.png
```

### Exemples

1. **Avec username et scores élevés** :
   ```
   nokta-one-breathing-technique-reset-major-reset-john-jan-2026.png
   ```

2. **Sans username, résultat modéré** :
   ```
   nokta-one-box-breathing-reset-effective-reset-jan-2026.png
   ```

3. **Feedback positif sans scores** :
   ```
   nokta-one-deep-breathing-reset-successful-reset-jan-2026.png
   ```

### Structure du Nom de Fichier

1. **`nokta-one`** : Marque principale (toujours en premier pour le branding)
2. **`{keyword}`** : Mots-clés SEO basés sur l'action :
   - `breathing-technique-reset` (Physiological Sigh)
   - `box-breathing-reset` (Box Breathing)
   - `deep-breathing-reset` (Expiration 3/8)
   - `heart-coherence-reset` (Respiration 4/6)
   - `energy-boost-reset` (Respiration 2/1)
   - `shoulder-release-reset` (Drop Trapezoids)
   - `stress-shake-reset` (Shake Neuromusculaire)
   - `grounding-exercise-reset` (Posture Ancrage)
   - `chest-opening-reset` (Ouverture Thoracique)
   - `grounding-technique-reset` (Pression Plantaire)
   - `focus-breathing-reset` (Regard Fixe Expiration)

3. **`{result}`** : Indicateur de résultat basé sur les scores ou feedback :
   - `major-reset` : Delta > 50 points
   - `significant-reset` : Delta > 40 points
   - `effective-reset` : Delta > 30 points
   - `successful-reset` : Feedback "better" sans scores
   - `body-reset` : Par défaut

4. **`{username}`** (optionnel) : Username nettoyé et optimisé :
   - Min 3 caractères, max 15 caractères
   - Accents retirés, caractères spéciaux remplacés par `-`
   - Uniquement si disponible et significatif

5. **`{month-year}`** : Date au format `jan-2026` :
   - Permet la fraîcheur du contenu pour le SEO
   - Format court et lisible

### Optimisations SEO

- ✅ **Mots-clés stratégiques** : Intégration de termes recherchés (breathing, reset, wellness)
- ✅ **Personnalisation** : Username pour SEO local et engagement
- ✅ **Longueur optimale** : Max 100 caractères (limite systèmes de fichiers)
- ✅ **Structure logique** : Ordre hiérarchique (marque → action → résultat → user → date)

## 🛠️ Implémentation

### Fichier Utilitaire

```typescript
// lib/skane/seo-filename.ts
import { generateSEOFilename } from "@/lib/skane/seo-filename";

const filename = generateSEOFilename({
  actionId: "physiological_sigh",
  username: "john_doe",
  scores: {
    before: [85, 95],
    after: [20, 30],
  },
  feedback: "better",
  locale: "fr",
});
```

### Utilisation dans les Pages de Partage

Les pages `share-v2` et `share-v4` utilisent automatiquement :

1. **Format d'image** : 1080x1920 avec pixelRatio 2x
2. **Nom de fichier SEO** : Généré automatiquement avec contexte

```typescript
const dataUrl = await toPng(cardRef.current, {
  backgroundColor: "#000000",
  width: 1080,
  height: 1920,
  pixelRatio: 2,
  quality: 1,
  cacheBust: true,
});

const seoFilename = generateSEOFilename({
  actionId: microAction,
  username,
  scores,
  feedback: storedFeedback || "better",
  locale: "fr",
});
```

## 📊 Bénéfices SEO

1. **Ranking sur les réseaux sociaux** : Les images avec des noms descriptifs sont mieux indexées
2. **Partage organique** : Les noms pertinents encouragent le partage
3. **Engagement utilisateur** : Personnalisation avec username
4. **Fraîcheur du contenu** : Date dans le nom pour signaler le contenu récent

## 🔄 Maintenance

- Les mots-clés peuvent être ajustés dans `lib/skane/seo-filename.ts`
- Le format d'image peut être modifié dans `handleShare` des pages de partage
- Les règles de personnalisation (username) peuvent être adaptées selon les besoins
