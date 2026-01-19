# 🔍 ANALYSE : Utilisation des données faciales dans NOKTA ONE

## 📊 État actuel vs Idéal

### ✅ Ce qui est fait actuellement

#### 1. **Capture des données faciales (MediaPipe)**
- ✅ 468 landmarks du visage détectés
- ✅ Bounding box et position dans l'ovale
- ✅ Stabilité et mouvement
- ✅ Confidence score
- ❌ **Blendshapes désactivés** (`outputFaceBlendshapes: false`)

#### 2. **Analyse de l'image (GPT-4 Vision)**
- ✅ Analyse visuelle de l'image complète
- ✅ Extraction de signaux physiologiques :
  - `eye_openness` (0.0-1.0)
  - `blink_rate` (0.0-1.0)
  - `jaw_tension` (0.0-1.0)
  - `lip_compression` (0.0-1.0)
  - `forehead_tension` (0.0-1.0)
  - `head_stability` (0.0-1.0)
- ✅ Classification en 3 états internes : `HIGH_ACTIVATION`, `LOW_ENERGY`, `REGULATED`

#### 3. **Sélection de micro-action**
- ✅ Mapping état → actions (`STATE_TO_ACTIONS`)
- ✅ Anti-répétition (évite la dernière action)
- ✅ Pondération par feedback historique
- ❌ **N'utilise PAS les données faciales brutes** (landmarks, blendshapes)
- ❌ **N'utilise PAS les données contextuelles** (HRV, sommeil, météo)

---

## ❌ Ce qui MANQUE pour une vraie intelligence

### Problème 1 : Les landmarks ne sont PAS utilisés
**Fichier** : `lib/hooks/useFaceDetection.ts`
- Les 468 landmarks sont capturés mais **uniquement pour l'affichage visuel**
- Ils ne sont **jamais envoyés** à l'API d'analyse
- Ils ne sont **jamais stockés** dans Supabase

### Problème 2 : Les blendshapes sont désactivés
**Fichier** : `lib/hooks/useFaceDetection.ts` (ligne 137)
```typescript
outputFaceBlendshapes: false, // ← DÉSACTIVÉ
```
**Impact** : Impossible de détecter les émotions réelles (stress, fatigue, joie, calme)

### Problème 3 : Pas de données contextuelles
**Manque** :
- HRV (Heart Rate Variability)
- Heures de sommeil
- Qualité du sommeil
- Pas quotidiens
- Météo
- Fuseau horaire

### Problème 4 : Algorithme trop simple
**Fichier** : `lib/skane/selector.ts`
- Sélection basée **uniquement** sur :
  1. L'état interne (HIGH/LOW/REGULATED)
  2. Le feedback historique
  3. Anti-répétition
- **Aucun scoring multi-factoriel** (émotions + biométrie + contexte)

---

## 🎯 PLAN D'ACTION : Implémentation d'une vraie intelligence

### Étape 1 : Activer Face Blendshapes ⚡ PRIORITÉ 1

**Fichier** : `lib/hooks/useFaceDetection.ts`

**Changement** :
```typescript
outputFaceBlendshapes: true, // ← ACTIVER
```

**Résultat** : 52 expressions faciales disponibles :
- `browDownLeft`, `browDownRight` → Stress/Concentration
- `eyeSquintLeft`, `eyeSquintRight` → Fatigue
- `mouthSmileLeft`, `mouthSmileRight` → Joie
- `jawOpen` → Surprise/Détente
- ... 47 autres

---

### Étape 2 : Créer un algorithme d'émotion ⚡ PRIORITÉ 1

**Nouveau fichier** : `lib/emotion-detection.ts`

**Fonction** : `calculateEmotions(blendshapes: FaceBlendshapes)`

**Calcul** :
```typescript
stress = (
  (browDownLeft + browDownRight) / 2 * 0.4 +
  (1 - jawOpen) * 0.3 +
  (1 - mouthSmileLeft - mouthSmileRight) / 2 * 0.3
);

fatigue = (
  (eyeSquintLeft + eyeSquintRight) / 2 * 0.5 +
  (eyeBlinkLeft + eyeBlinkRight) / 2 * 0.3 +
  (1 - (eyeWideLeft + eyeWideRight) / 2) * 0.2
);

joy = (
  (mouthSmileLeft + mouthSmileRight) / 2 * 0.6 +
  (cheekSquintLeft + cheekSquintRight) / 2 * 0.4
);

calm = (
  jawOpen * 0.3 +
  (1 - stress) * 0.4 +
  (1 - fatigue) * 0.3
);
```

---

### Étape 3 : Enrichir le schéma Supabase ⚡ PRIORITÉ 2

**Fichier** : `supabase/schema.sql`

**Ajouts** :
```sql
ALTER TABLE skane_sessions ADD COLUMN face_blendshapes JSONB;
ALTER TABLE skane_sessions ADD COLUMN emotions JSONB; -- {stress: 0.78, fatigue: 0.45, joy: 0.12}
ALTER TABLE skane_sessions ADD COLUMN dominant_emotion TEXT;
ALTER TABLE skane_sessions ADD COLUMN time_of_day TEXT;
ALTER TABLE skane_sessions ADD COLUMN day_of_week INTEGER;
ALTER TABLE skane_sessions ADD COLUMN hrv_value FLOAT;
ALTER TABLE skane_sessions ADD COLUMN sleep_hours FLOAT;
ALTER TABLE skane_sessions ADD COLUMN sleep_quality INTEGER;
ALTER TABLE skane_sessions ADD COLUMN steps_today INTEGER;
ALTER TABLE skane_sessions ADD COLUMN weather JSONB;
ALTER TABLE skane_sessions ADD COLUMN location_timezone TEXT;
```

---

### Étape 4 : Créer un algorithme de recommandation intelligent ⚡ PRIORITÉ 2

**Nouveau fichier** : `lib/micro-action-algorithm.ts`

**Fonction** : `recommendMicroAction(input: RecommendationInput)`

**Scoring multi-factoriel** :
1. **Émotion dominante** (40%) → Actions ciblées
2. **Biométrie** (30%) → Ajustements HRV/sommeil
3. **Contexte** (20%) → Moment de la journée
4. **Historique** (10%) → Préférences utilisateur

**Exemple** :
```typescript
if (emotions.stress > 0.6) {
  actionScores['breathing_4_7_8'] = 0.9;
  actionScores['body_scan'] = 0.7;
}
if (biometrics?.hrv < 40) {
  actionScores['breathing_4_7_8'] += 0.3; // HRV bas = stress
}
if (context.timeOfDay === 'morning') {
  actionScores['power_pose'] += 0.2;
}
```

---

### Étape 5 : Intégrer dans l'API d'analyse ⚡ PRIORITÉ 3

**Fichier** : `app/api/skane/analyze/route.ts`

**Changements** :
1. Accepter `faceBlendshapes` dans le body
2. Calculer les émotions avec `calculateEmotions()`
3. Enrichir avec données contextuelles (HRV, sommeil, météo)
4. Utiliser `recommendMicroAction()` au lieu de `selectMicroAction()`
5. Stocker toutes les données dans Supabase

---

## 📈 Impact attendu

### Avant (actuel)
- ❌ Détection basée uniquement sur GPT-4 Vision (image statique)
- ❌ Pas de données faciales brutes
- ❌ Pas d'émotions réelles
- ❌ Pas de contexte biométrique
- ❌ Algorithme simple (état → action)

### Après (avec améliorations)
- ✅ Détection basée sur blendshapes (52 expressions)
- ✅ Émotions calculées (stress, fatigue, joie, calme)
- ✅ Contexte biométrique (HRV, sommeil, activité)
- ✅ Algorithme multi-factoriel (émotions + biométrie + contexte + historique)
- ✅ Recommandations personnalisées et précises

---

## 🚀 Ordre d'implémentation recommandé

1. **Activer blendshapes** (5 min) → Données disponibles
2. **Créer algorithme d'émotion** (30 min) → Calcul des émotions
3. **Créer algorithme de recommandation** (1h) → Scoring intelligent
4. **Enrichir schéma Supabase** (15 min) → Stockage des données
5. **Intégrer dans l'API** (1h) → Utilisation complète

**Total estimé** : ~3h de développement

---

## 📝 Notes importantes

- **MediaPipe Face Landmarker** ne détecte PAS les émotions directement
- Il faut utiliser **Face Blendshapes** (52 valeurs) pour calculer les émotions
- Les blendshapes sont disponibles dans MediaPipe mais **désactivés** actuellement
- GPT-4 Vision peut analyser l'image, mais les blendshapes sont **plus précis** pour les micro-expressions

---

## 🔗 Références

- [MediaPipe Face Blendshapes](https://developers.google.com/mediapipe/solutions/vision/face_landmarker#blendshapes)
- [MediaPipe Face Landmarker Task](https://developers.google.com/mediapipe/solutions/vision/face_landmarker)
- [NOKTA ONE Flow Implementation](./FLOW_IMPLEMENTATION.md)
