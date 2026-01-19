# 🚀 Guide de Déploiement Rapide - Nokta Health Integration

> **Depuis le repo Nokta One** : les commandes ci‑dessous sont à lancer en remplaçant `/chemin/vers/nokta` par le chemin de ton **app React Native Nokta**, et en utilisant `integrations/nokta-health-integration/` comme source (ou en te plaçant dans ce dossier).

## Étape 1 : Copier les fichiers dans ton projet Nokta

```bash
# Depuis la racine du repo (ou depuis integrations/nokta-health-integration)
ROOT=integrations/nokta-health-integration  # ou . si tu es déjà dans le dossier
cp -r $ROOT/src/services/health /chemin/vers/nokta/src/services/
cp -r $ROOT/src/hooks /chemin/vers/nokta/src/
cp -r $ROOT/src/utils /chemin/vers/nokta/src/
cp -r $ROOT/src/components /chemin/vers/nokta/src/
cp $ROOT/androidManifestPlugin.js /chemin/vers/nokta/
```

## Étape 2 : Installer les dépendances

```bash
cd /chemin/vers/nokta

# Installer les packages
npm install react-native-health react-native-health-connect
npm install expo-dev-client expo-build-properties --save-dev
```

## Étape 3 : Configurer app.json

Ajoute ceci à ton `app.json` existant :

```json
{
  "expo": {
    "ios": {
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
      "permissions": [
        "android.permission.health.READ_HEART_RATE",
        "android.permission.health.READ_HEART_RATE_VARIABILITY",
        "android.permission.health.READ_SLEEP",
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_TOTAL_CALORIES_BURNED",
        "android.permission.health.READ_OXYGEN_SATURATION"
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
      "./androidManifestPlugin.js"
    ]
  }
}
```

## Étape 4 : Build le dev client

```bash
# Nettoyer et prebuild
npx expo prebuild --clean

# Build iOS (nécessite un Mac)
npx expo run:ios --device

# Build Android
npx expo run:android --device
```

## Étape 5 : Utiliser dans ton app

```tsx
// Dans ton composant principal
import { NervousSystemCard } from './components/HealthDataCard';

function App() {
  return (
    <NervousSystemCard
      onScoreCalculated={(score) => {
        // Envoyer à ton backend
        api.trackNervousSystemScore(score);
      }}
      onRecommendationPress={(rec) => {
        // Naviguer vers l'écran de micro-action
        navigation.navigate('MicroAction', rec);
      }}
    />
  );
}
```

## ✅ Checklist avant publication

### iOS (App Store)
- [ ] Ajouter "HealthKit" aux capabilities dans Xcode
- [ ] Remplir le questionnaire HealthKit dans App Store Connect
- [ ] Décrire précisément l'usage des données dans la fiche app

### Android (Play Store)  
- [ ] Déclarer les permissions Health Connect dans la Console Play
- [ ] Compléter le formulaire "Health Connect permissions declaration"
- [ ] Lier à la Privacy Policy

## 🔧 Debug

### iOS - Pas de données ?
1. Vérifier que HealthKit est activé dans les Capabilities
2. Tester sur un vrai appareil (pas simulateur)
3. Vérifier que l'utilisateur a des données dans l'app Santé

### Android - Permission refusée ?
1. Health Connect ne permet qu'UNE demande de permission
2. Si refusé, l'utilisateur doit aller dans Paramètres > Health Connect
3. Vérifier que minSdkVersion >= 26

## 📊 Métriques clés pour Nokta

| Métrique | Importance | Interprétation |
|----------|------------|----------------|
| **HRV (SDNN)** | ⭐⭐⭐⭐⭐ | >50ms = relaxé, <30ms = stressé |
| **FC repos** | ⭐⭐⭐⭐ | <60 = athlète, >80 = stress |
| **Sommeil** | ⭐⭐⭐ | Contexte de récupération |
| **Pas** | ⭐⭐ | Niveau d'activité général |

## 💰 Coûts

| Item | Coût |
|------|------|
| Apple HealthKit | **GRATUIT** |
| Google Health Connect | **GRATUIT** |
| react-native-health | **GRATUIT** (MIT) |
| react-native-health-connect | **GRATUIT** (MIT) |
| **Total** | **$0/mois** |

vs Terra API : **~$500/mois** économisés 🎉
