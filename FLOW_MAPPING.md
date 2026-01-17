# 📋 MAPPING ÉCRANS EXISTANTS → FLOW V1.0

## 🔍 ANALYSE DU REPO

### Routes/Pages Existantes
- ✅ `/` - Home (app/page.tsx)
- ✅ `/skane` - Camera (app/skane/page.tsx)
- ✅ `/skane/analyzing` - Analyzing (app/skane/analyzing/page.tsx)
- ✅ `/skane/result` - Result (app/skane/result/page.tsx)
- ✅ `/skane/action` - Micro-action (app/skane/action/page.tsx)
- ✅ `/skane/feedback` - Feedback (app/skane/feedback/page.tsx)
- ✅ `/skane/share-prompt` - Share prompt (app/skane/share-prompt/page.tsx)
- ✅ `/skane/share` - Share card (app/skane/share/page.tsx)
- ✅ `/settings` - Settings (app/settings/page.tsx)
- ✅ `/signup` - Signup (app/signup/page.tsx)

### Composants UI Réutilisables
- ✅ `BottomNav` - Navigation tabs (Home/Skane/Settings)
- ✅ `SkaneButton` - Bouton "Press to skane"
- ✅ `SafeAreaContainer` - Container avec safe areas
- ✅ `ResponsiveText` - Texte responsive
- ✅ `DotsPattern` - Pattern de points background
- ✅ `BreathingCircle` - Animation respiratoire
- ✅ `ScanLine` - Ligne de scan animée
- ✅ `SkaneShareCard` - Carte de partage virale
- ✅ `FaceGuide` - Guide visuel pour centrer le visage
- ✅ `CameraPermissionScreen` - Écran de permission caméra

### State Management
- ✅ `localStorage` via `lib/skane/storage.ts` (saveSkane, getStoredSkanes)
- ✅ `sessionStorage` pour données temporaires (image capturée, résultat)
- ✅ `react-i18next` pour traductions
- ✅ `useState`/`useEffect` pour state local
- ❌ Pas de zustand/redux/context global (sauf I18nProvider)

### Navigation
- ✅ `BottomNav` avec 3 tabs (Home/Skane/Settings)
- ✅ `useRouter` de Next.js pour navigation

---

## 🗺️ MAPPING ÉTATS → ROUTES

| État Flow V1.0 | Route Existante | Action |
|----------------|-----------------|--------|
| `HOME_IDLE` | `/` (app/page.tsx) | ✅ **RÉUTILISER** - Simplifier (déjà fait) |
| `SKANE_CAMERA` | `/skane` (app/skane/page.tsx) | ✅ **RÉUTILISER** - Déjà conforme |
| `SKANE_ANALYZING` | `/skane/analyzing` | ✅ **RÉUTILISER** - Déjà conforme |
| `SKANE_RESULT` | `/skane/result` | ✅ **RÉUTILISER** - Déjà conforme |
| `MICRO_ACTION_RUNNING` | `/skane/action` | ✅ **RÉUTILISER** - Déjà conforme |
| `FEEDBACK` | `/skane/feedback` | ✅ **RÉUTILISER** - Déjà conforme |
| `SHARE_PROMPT` | `/skane/share-prompt` | ✅ **RÉUTILISER** - Déjà conforme |
| `SHARE_CARD` | `/skane/share` | ✅ **RÉUTILISER** - Déjà conforme |
| `HISTORY` | ❌ N'existe pas | 🆕 **CRÉER** - `/history` ou intégrer dans Home |
| `ERROR` | ❌ N'existe pas | 🆕 **CRÉER** - `/skane/error` |

---

## 📝 PLAN D'IMPLÉMENTATION

### ÉTAPE 1 : Créer State Machine (Nouveau)
**Fichier :** `lib/skane/flow-state.ts`
- Machine d'états avec transitions strictes
- Validation des transitions
- Pas de dépendance externe (pas de xstate)

### ÉTAPE 2 : Créer Modèle SkaneSession (Nouveau)
**Fichier :** `lib/skane/session-model.ts`
- Type `SkaneSession` avec champs requis
- Fonctions de persistance (localStorage d'abord)
- Cooldown logic (2h)

### ÉTAPE 3 : Créer Route Error (Nouveau)
**Fichier :** `app/skane/error/page.tsx`
- Écran d'erreur simple
- Bouton "Restart Skane"
- Redirection vers `/skane`

### ÉTAPE 4 : Créer Route History (Nouveau)
**Fichier :** `app/history/page.tsx`
- Liste des 3 derniers skanes
- Format : "Today - 14:34", "Yesterday", "2 days ago"
- Pas de scores, juste emoji + date

### ÉTAPE 5 : Améliorer Home (Modification)
**Fichier :** `app/page.tsx`
- ✅ Déjà simplifié selon spec
- Ajouter cooldown logic (2h)
- Afficher "Recent Skane" si disponible
- Désactiver bouton si cooldown actif

### ÉTAPE 6 : Vérifier Copy/Text (Vérification)
- ✅ HOME: "Press to skane" - OK
- ✅ START: "Start Skane" - OK
- ✅ ANALYZING: "Analyzing body patterns…" - OK
- ✅ RESULT: "SKANE COMPLETED" - OK
- ✅ FEEDBACK: "How are you feeling?" - OK
- ✅ SHARE PROMPT: "Share your reset?" - OK (emoji retiré)
- ✅ ERROR: À créer

### ÉTAPE 7 : Intégrer State Machine (Intégration)
- Ajouter validation des transitions dans chaque page
- Logger les transitions pour debug
- Gérer les erreurs de transition

### ÉTAPE 8 : Tests (Validation)
- Fichier de validation des transitions
- Checklist manuelle

---

## 🎯 FICHIERS À CRÉER/MODIFIER

### Nouveaux Fichiers
1. `lib/skane/flow-state.ts` - State machine
2. `lib/skane/session-model.ts` - Modèle SkaneSession
3. `app/skane/error/page.tsx` - Écran d'erreur
4. `app/history/page.tsx` - Historique
5. `lib/skane/flow-validator.ts` - Validation des transitions

### Fichiers à Modifier
1. `app/page.tsx` - Ajouter cooldown logic
2. `lib/i18n/locales/fr.json` - Ajouter traductions manquantes
3. `lib/i18n/locales/en.json` - Ajouter traductions manquantes

### Fichiers à Vérifier (Pas de modification)
- `app/skane/page.tsx` - Déjà conforme
- `app/skane/analyzing/page.tsx` - Déjà conforme
- `app/skane/result/page.tsx` - Déjà conforme
- `app/skane/action/page.tsx` - Déjà conforme
- `app/skane/feedback/page.tsx` - Déjà conforme
- `app/skane/share-prompt/page.tsx` - Déjà conforme
- `app/skane/share/page.tsx` - Déjà conforme

---

## ✅ CHECKLIST DE VALIDATION

- [ ] State machine créée et fonctionnelle
- [ ] Modèle SkaneSession avec persistance
- [ ] Route `/skane/error` créée
- [ ] Route `/history` créée
- [ ] Home avec cooldown logic
- [ ] Tous les textes conformes à la spec
- [ ] Transitions validées
- [ ] Aucune route existante cassée
- [ ] Flow complet testable en 60s

---

## 🚀 ORDRE D'IMPLÉMENTATION

1. **State Machine** (lib/skane/flow-state.ts)
2. **Session Model** (lib/skane/session-model.ts)
3. **Error Page** (app/skane/error/page.tsx)
4. **History Page** (app/history/page.tsx)
5. **Home Cooldown** (app/page.tsx)
6. **Flow Validator** (lib/skane/flow-validator.ts)
7. **Traductions** (lib/i18n/locales/*.json)
8. **Tests & Validation**
