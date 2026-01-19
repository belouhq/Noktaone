# Nokta Health Integration

Module d’intégration **Apple HealthKit** (iOS) et **Google Health Connect** (Android) pour l’app Nokta.  
Remplace Terra API (~6 000 $/an) par une solution **gratuite** pour les données de santé.

## Utilisation

- **Cible** : app **React Native / Expo** Nokta (pas l’app web Next.js).
- **INTEGRATION_GUIDE.md** : configuration, permissions, structure des fichiers.
- **QUICK_START.md** : copie des fichiers, `app.json`, build et debug.

## Contenu

| Dossier / Fichier | Rôle |
|-------------------|------|
| `src/services/health/` | Service unifié HealthKit / Health Connect, types |
| `src/hooks/useHealthData.ts` | Hook React pour données + score système nerveux |
| `src/utils/nervousSystemScore.ts` | Calcul du score (HRV, FC repos, sommeil) |
| `src/components/HealthDataCard.tsx` | `NervousSystemCard`, `DetailedHealthCard` |
| `src/screens/HomeScreen.tsx` | Exemple d’écran d’accueil |
| `androidManifestPlugin.js` | Plugin Expo pour Health Connect (Intent) |

## Dépendances

- `react-native-health` (iOS)
- `react-native-health-connect` (Android)
- `expo-dev-client`, `expo-build-properties`
- **Expo Go ne suffit pas** : build dev client obligatoire.

## i18n

Les textes dans `HealthDataCard` et `nervousSystemScore` sont en français.  
Lors de l’intégration, les remplacer par des clés i18n (voir `lib/i18n/locales/` dans Nokta One).

## Intégration dans le projet Nokta mobile

Suivre **QUICK_START.md** pour :

1. Copier `src/services/health`, `src/hooks`, `src/utils`, `src/components` dans l’app.
2. Copier `androidManifestPlugin.js` à la racine.
3. Adapter `app.json` / `app.config.js` (HealthKit, Health Connect, plugins).
4. Lancer `npx expo prebuild --clean` puis `npx expo run:ios` / `run:android` sur appareil.
