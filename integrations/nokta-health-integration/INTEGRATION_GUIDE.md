# 🏥 Nokta - Intégration Apple HealthKit & Google Health Connect

## Vue d'ensemble

Ce guide te permet d'intégrer **gratuitement** les données de santé dans Nokta sans passer par Terra API (~$6,000/an économisés).

### Données disponibles pour Nokta

| Donnée | HealthKit (iOS) | Health Connect (Android) | Usage Nokta |
|--------|-----------------|--------------------------|-------------|
| Fréquence cardiaque | ✅ | ✅ | Détection stress |
| HRV (Variabilité cardiaque) | ✅ | ✅ | Score nervous system |
| Sommeil | ✅ | ✅ | Qualité récupération |
| Pas | ✅ | ✅ | Niveau activité |
| Calories brûlées | ✅ | ✅ | Dépense énergétique |
| SpO2 (Oxygène sanguin) | ✅ | ✅ | État physiologique |
| Température corporelle | ✅ | ✅ | Baseline santé |

---

## 📦 Installation

### 1. Installer les dépendances

```bash
# Pour iOS (Apple HealthKit)
npm install react-native-health

# Pour Android (Health Connect)
npm install react-native-health-connect

# Dev client Expo (obligatoire - pas compatible Expo Go)
npm install expo-dev-client

# Build properties pour Android SDK
npm install expo-build-properties --save-dev
```

### 2. Configuration `app.json` / `app.config.js`

```json
{
  "expo": {
    "name": "Nokta",
    "slug": "nokta",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "app.nokta.ios",
      "infoPlist": {
        "NSHealthShareUsageDescription": "Nokta utilise vos données de santé pour analyser votre état nerveux et vous proposer des micro-actions personnalisées.",
        "NSHealthUpdateUsageDescription": "Nokta enregistre vos sessions de reset pour suivre votre progression."
      },
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.background-delivery": true
      }
    },
    "android": {
      "package": "app.nokta.android",
      "permissions": [
        "android.permission.health.READ_HEART_RATE",
        "android.permission.health.READ_HEART_RATE_VARIABILITY",
        "android.permission.health.READ_SLEEP",
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_TOTAL_CALORIES_BURNED",
        "android.permission.health.READ_OXYGEN_SATURATION",
        "android.permission.health.READ_BODY_TEMPERATURE",
        "android.permission.health.READ_RESTING_HEART_RATE",
        "android.permission.health.READ_RESPIRATORY_RATE"
      ]
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "minSdkVersion": 26
          }
        }
      ],
      [
        "react-native-health-connect",
        {
          "requestPermissionsOnStart": false
        }
      ]
    ]
  }
}
```

---

## 🔧 Code d'intégration

### Structure des fichiers

```
src/
├── services/
│   └── health/
│       ├── index.ts                 # Export principal
│       ├── types.ts                 # Types TypeScript
│       ├── healthKit.ios.ts         # Implémentation iOS
│       ├── healthConnect.android.ts # Implémentation Android
│       └── useHealthData.ts         # Hook unifié
├── utils/
│   └── nervousSystemScore.ts        # Calcul du score
└── components/
    └── HealthDataCard.tsx           # Composant UI
```

---

## 📄 Fichiers de code

Les fichiers suivants sont créés dans ce dossier :

1. `src/services/health/types.ts` - Types TypeScript
2. `src/services/health/healthKit.ios.ts` - Implémentation iOS
3. `src/services/health/healthConnect.android.ts` - Implémentation Android
4. `src/services/health/index.ts` - Service unifié
5. `src/hooks/useHealthData.ts` - Hook React
6. `src/utils/nervousSystemScore.ts` - Algorithme de scoring
7. `src/components/HealthDataCard.tsx` - Composant UI

---

## 🚀 Build et test

### Créer le dev client

```bash
# iOS
npx expo prebuild --platform ios
npx expo run:ios --device

# Android
npx expo prebuild --platform android
npx expo run:android --device
```

### ⚠️ Important

- **Expo Go ne fonctionne PAS** avec ces librairies natives
- Tester sur **appareil physique** (simulateurs limités pour HealthKit)
- Les permissions Health Connect ne peuvent être demandées qu'**une seule fois**

---

## 📊 Données clés pour l'algorithme Nokta

### HRV (Heart Rate Variability)
- **Mesure** : Variation entre battements cardiaques (ms)
- **Interprétation** :
  - HRV élevé (>50ms) = Système parasympathique actif = Relaxé
  - HRV bas (<30ms) = Système sympathique actif = Stressé
- **Usage Nokta** : Indicateur principal du "nervous system reset"

### Resting Heart Rate
- **Normal** : 60-80 bpm
- **Athlète** : 40-60 bpm
- **Stressé** : >80 bpm
- **Usage Nokta** : Baseline pour détecter les pics de stress

### Sommeil
- **Phases** : Light, Deep, REM, Awake
- **Usage Nokta** : Qualité de récupération nocturne

---

## 🔐 Conformité & Privacy

### RGPD / GDPR
- [ ] Consentement explicite avant accès aux données
- [ ] Possibilité de révoquer l'accès
- [ ] Données stockées localement par défaut
- [ ] Option d'export des données

### Apple App Store Guidelines
- [ ] Privacy Policy URL obligatoire
- [ ] Description claire de l'usage des données
- [ ] Pas de partage avec tiers sans consentement

### Google Play Health Connect Policy
- [ ] Déclaration des permissions utilisées
- [ ] Privacy Policy conforme
- [ ] Pas de monétisation directe des données santé

---

## 💰 Économies vs Terra API

| Solution | Coût annuel | Couverture |
|----------|-------------|------------|
| Terra API | ~$6,000+ | Tous wearables |
| **Cette intégration** | **$0** | iOS + Android natif |

### Wearables couverts gratuitement

**Via Apple HealthKit :**
- Apple Watch (toutes versions)
- Oura Ring (sync vers Health)
- Whoop (sync vers Health)
- Garmin (sync vers Health)
- Fitbit (sync vers Health)

**Via Google Health Connect :**
- Samsung Galaxy Watch
- Fitbit
- Garmin
- Oura Ring
- Withings
- + 50 autres apps compatibles

---

## 🔄 Migration future vers Terra (optionnel)

Quand Nokta atteindra ~1000+ utilisateurs payants, tu pourras ajouter Terra API pour :
- Intégration directe Oura/Whoop/Garmin (sans sync manuelle)
- Données temps réel via webhook
- Support CGM (Continuous Glucose Monitor)

L'architecture actuelle est conçue pour permettre cette migration sans refactoring majeur.
