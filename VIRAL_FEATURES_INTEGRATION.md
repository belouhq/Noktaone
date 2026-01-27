# 🚀 Intégration des Features Virales - Nokta One

## ✅ Fichiers ajoutés

Tous les fichiers des features virales ont été intégrés au projet :

### 📁 Structure

```
app/
├── api/
│   └── track/
│       └── share-click/
│           └── route.ts          ✅ API tracking des clics
├── skane/
│   └── share/
│       └── page-v1.tsx            ✅ Page de partage V1
└── try/
    └── page.tsx                   ✅ Landing page virale

components/
└── skane/
    └── SkaneShareCardV2.tsx      ✅ Carte de partage V2 avec QR code

lib/
└── hooks/
    └── useShareTracking.ts        ✅ Hook de tracking

supabase/
└── migrations/
    └── share_tracking.sql         ✅ Fonctions SQL pour tracking
```

## 📦 Dépendances installées

Les dépendances suivantes ont été installées :
- ✅ `qrcode.react` - Génération de QR codes
- ✅ `uuid` - Génération d'IDs uniques
- ✅ `@types/uuid` - Types TypeScript pour uuid

## 🔧 Prochaines étapes

### 1. Exécuter la migration SQL

Dans Supabase SQL Editor, exécute le fichier :
```
supabase/migrations/share_tracking.sql
```

Cette migration crée :
- La fonction `increment_share_click()` pour tracker les clics
- La table `share_click_events` pour les logs détaillés
- La vue `share_conversion_funnel` pour les analytics

### 2. Vérifier la table `share_events`

Assure-toi que la table `share_events` existe dans ton schéma Supabase. Elle devrait avoir ces colonnes :
- `asset_id` (TEXT, PRIMARY KEY)
- `user_id` (UUID)
- `guest_id` (UUID)
- `session_id` (UUID)
- `share_type` (TEXT)
- `clicked_count` (INTEGER)
- `install_count` (INTEGER)
- `signup_count` (INTEGER)
- `asset_url` (TEXT)
- `created_at` (TIMESTAMPTZ)

Si elle n'existe pas, exécute le schéma complet :
```
supabase/schema-complete.sql
```

### 3. Activer la page V2 (optionnel)

Tu as deux options :

**Option A : Remplacer complètement**
```bash
mv app/skane/share/page.tsx app/skane/share/page.old.tsx
mv app/skane/share/page-v1.tsx app/skane/share/page.tsx
```

**Option B : A/B Test avec feature flag**
```tsx
// Dans app/skane/share/page.tsx
import SharePageV2 from './page-v2';

const useV2 = true; // ou feature flag

export default useV1 ? SharePageV1 : SharePage;
```

### 4. Tester le flow complet

1. Faire un scan complet
2. Arriver sur `/skane/share` (ou `/skane/share-v2` si tu gardes les deux)
3. Vérifier que le QR code pointe vers `/try?ref=XXXXXXXX`
4. Scanner le QR depuis un autre device
5. Vérifier que la page `/try` s'affiche
6. Cliquer sur "Essayer maintenant"
7. Vérifier que le scan guest fonctionne
8. Vérifier dans Supabase que les événements sont trackés

## 📊 Analytics disponibles

Une fois déployé, tu peux suivre les métriques dans Supabase :

```sql
-- Funnel de conversion
SELECT * FROM share_conversion_funnel 
ORDER BY shared_at DESC 
LIMIT 100;

-- Taux de conversion global (7 derniers jours)
SELECT 
  COUNT(*) as total_shares,
  SUM(clicked_count) as total_clics,
  SUM(install_count) as total_scans,
  SUM(signup_count) as total_signups,
  ROUND(AVG(click_to_scan_rate), 2) as avg_click_to_scan,
  ROUND(AVG(scan_to_signup_rate), 2) as avg_scan_to_signup
FROM share_conversion_funnel
WHERE shared_at > NOW() - INTERVAL '7 days';
```

## ⚠️ Points d'attention

1. **QR Code** : Teste sur mobile réel - certains lecteurs QR ont des comportements différents
2. **Service Role Key** : L'API `/api/track/share-click` utilise la clé service (server-side uniquement)
3. **Guest Mode** : La page `/try` active automatiquement le guest mode
4. **Deep linking** : Si tu as une app native, configure le deep linking pour `noktaone.app/try`

## 🔗 Intégration avec le système existant

- ✅ Le middleware capture déjà les `?ref=` dans l'URL
- ✅ Le composant `ReferralTracker` track déjà les clics
- ✅ Le service `affiliate-attribution` peut utiliser les ref codes pour l'attribution

## 📝 Variables d'environnement

Assure-toi d'avoir dans `.env.local` :
```bash
NEXT_PUBLIC_APP_URL=https://noktaone.app
```

## 🎯 Prochaines étapes suggérées

1. **A/B Test** : Comparer les taux de partage V1 vs V2
2. **Deep linking** : Préparer pour l'app native
3. **Notifications** : "Ton ami X a essayé Nokta grâce à toi !"
4. **Rewards** : Débloquer des invitations bonus pour les meilleurs ambassadeurs
