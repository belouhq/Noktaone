# FlowV1 - Architecture Complète

## 📋 Checklist d'implémentation

### ✅ Fichiers créés (sans modifier l'existant)

#### Core Engine
- ✅ `lib/flowV1/config.ts` - Configuration, fourchettes, bonus
- ✅ `lib/flowV1/utils.ts` - RNG déterministe (Mulberry32), helpers
- ✅ `lib/flowV1/scoreEngine.ts` - Calcul Skane Index avec fourchettes dynamiques
- ✅ `lib/flowV1/decisionEngine.ts` - Décision état interne + amplificateur
- ✅ `lib/flowV1/amplifierEngine.ts` - Gestion amplificateurs sensoriels
- ✅ `lib/flowV1/flowOrchestrator.ts` - Machine à états complète
- ✅ `lib/flowV1/scanFeatures.ts` - Extraction features depuis GPT
- ✅ `lib/flowV1/index.ts` - Point d'entrée (exports)

#### Routing
- ✅ `app/skane/flowV1/page.tsx` - Route conditionnelle d'entrée

### ✅ Fichiers modifiés (patch minimal)

- ✅ `app/skane/page.tsx` - Ajout routing conditionnel (3 lignes)

## 🎯 Fonctionnalités implémentées

### 1. Système de Scoring Sophistiqué

#### Fourchettes dynamiques
- **BASE_BEFORE** : Fourchettes de base par état
- **SAFE_BEFORE** : Bornes de sécurité (clamp)
- **Variation ±5** : Décalage aléatoire déterministe de la fourchette
- **Bruit interne ±2** : Variation fine stable

#### Calcul Before Score
```typescript
1. Variation fourchette (±5) → minR, maxR
2. Clamp dans bornes safe
3. Projection raw → score (smoothstep)
4. Ajout bruit ±2
5. Round + clamp 0-100
```

#### Calcul After Score
```typescript
1. Impact base selon état (52-68 pour HIGH, etc.)
2. Bonus action (physiological_sigh: +6, etc.)
3. Bonus amplificateur (4-9 si activé)
4. after = before - impact
5. Projection dans fourchette AFTER
6. Vérification delta minimal (wow effect)
7. Bruit ±2
8. Round + clamp 0-100
```

### 2. Décision Engine

#### Détermination état interne
- **Activation axis** : Tension + agitation
- **Energy axis** : Fatigue + lenteur
- **Hystérésis** : Seuils différents pour entrer/sortir d'un état
  - HIGH : entrée ≥0.62, sortie <0.55
  - LOW : entrée ≥0.58, sortie <0.50

#### Amplificateur
- Activé si : `state != REGULATED AND raw >= 0.70 AND !hasUsedToday`
- Types : `warm_sip` (HIGH), `fixed_gaze_expiration` (LOW)

### 3. Flow Orchestrator (State Machine)

États :
- `IDLE` → `SCANNING` → `DECIDE` → `ACTION` → `FEEDBACK` → `RESULT` → `SHARE`

Transitions :
- `startScan()` → SCANNING
- `processScan(features)` → DECIDE
- `startAction()` → ACTION
- `completeAction()` → FEEDBACK
- `submitFeedback(feedback)` → RESULT
- `goToShare()` → SHARE

### 4. Anti-répétition

- Évite de choisir une action vue dans les 2-3 dernières sessions
- Stocké dans `lastActionIds` du contexte

## 🔧 Configuration

### Feature Flag

Ajouter dans `.env.local` :
```bash
NEXT_PUBLIC_FLOW_V1=true
```

### Fourchettes (modifiables dans `config.ts`)

```typescript
BASE_BEFORE: {
  HIGH_ACTIVATION: [83, 91],
  LOW_ENERGY: [78, 88],
  REGULATED: [42, 58],
}
```

## 📊 Exemple de résultats

### HIGH_ACTIVATION
- Before : 83-91 (variation ±5) → ex: 87, 84, 90
- After : 18-32 (variation ±5) → ex: 25, 22, 28
- Delta : ~60 points (effet wow garanti)

### LOW_ENERGY
- Before : 78-88 → ex: 82, 79, 85
- After : 20-35 → ex: 28, 24, 31
- Delta : ~55 points

### REGULATED
- Before : 42-58 → ex: 48, 45, 52
- After : 18-30 → ex: 24, 21, 27
- Delta : ~25 points

## 🚀 Utilisation

### Activer FlowV1

1. Ajouter `NEXT_PUBLIC_FLOW_V1=true` dans `.env.local`
2. Redémarrer le serveur
3. Accéder à `/skane` → redirige automatiquement vers FlowV1 si activé

### Utiliser l'orchestrateur

```typescript
import { FlowOrchestrator } from '@/lib/flowV1';

const orchestrator = new FlowOrchestrator(sessionId, userId);
orchestrator.startScan();
await orchestrator.processScan(features);
orchestrator.startAction();
// ...
```

## ⚠️ Disclaimers

Tous les scores doivent afficher :
- "Wellness signal · Not medical"
- "Indicatif, basé sur signaux visuels et usage — pas un diagnostic."

## 📝 Notes

- **Stabilité** : Seeds déterministes garantissent la cohérence sur une session
- **Variation** : Fourchettes dynamiques évitent la répétition
- **Wow effect** : Delta minimal garanti pour le partage
- **Non-médical** : Aucun diagnostic, signal bien-être uniquement
