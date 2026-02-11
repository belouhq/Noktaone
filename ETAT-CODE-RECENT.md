# État du code – dernières modifications

Ce fichier décrit ce qui **est dans le code actuellement** dans ce dossier. Si ce que tu vois dans le navigateur ne correspond pas, c’est souvent un souci de **cache** (navigateur ou build Next).

---

## 1. Ce qui est implémenté dans le code

### Share-prompt (`/skane/share-prompt`)
- **ShareCardViral** + **ShareFlowViral** : au clic sur « Partager », ouverture du flux viral (TikTok, Instagram, téléchargement, etc.) avec une carte générée à partir des scores before/after.
- **ReminderSetupModalViral** : après le premier Skane complété, proposition de configurer les horaires de rappel (tu peux Skip ; la config reste dispo dans Paramètres).
- `useViralShareFlow` est passé à `SkaneIndexResult`, donc le bouton Partager utilise bien ce flux.

### Paramètres (`/settings`)
- **ReminderSetupModalViral** pour « Personnaliser les horaires » (matin / midi / soir), avec affichage des horaires actuels.
- Section **Rappels** avec toggle pour activer/désactiver les notifications et ligne « Autoriser les notifications » quand la permission est refusée.
- Pas d’import de `useNotificationSystem` depuis `@/lib/viral` : la permission est gérée localement dans la page.

### Bottom nav
- Couleur active **bleue** (`#0A84FF`), prop **theme** (dark/light), export default.
- Sans `onNavigate`, un clic sur « Paramètres » fait `router.push('/settings')`.

### Engagement (`components/engagement/`)
- `ReminderSetupModalViral.tsx`
- `ShareCardViral.tsx`
- `ShareFlowViral.tsx`
- `index.ts` qui les exporte

### Autres
- **lib/notifications/contextual.ts** : `getContextualReminderMessage` (quiet hours 22h–6h, rappels >24h / >48h).
- **SkaneIndexResult** : prop `useViralShareFlow` ; si true + `onShare`, au clic Partager on appelle `onShare(d)` sans ouvrir l’ancien sélecteur.

---

## 2. Pour que l’app affichée = le code actuel

Faire une remise à zéro complète du cache :

1. **Arrêter** le serveur (Ctrl+C dans le terminal où tourne `npm run dev`).
2. **Nettoyer le build Next et relancer** :
   ```bash
   cd "/Users/benjaminbel/nokta-app/Nokta One"
   npm run dev:clean
   ```
   (équivalent à `rm -rf .next && npm run dev`).
3. **Attendre** que la compilation soit terminée (« Compiled in … »).
4. **Dans le navigateur** :
   - vider le cache pour localhost (DevTools > Application > Clear site data),  
   - ou ouvrir une **fenêtre de navigation privée** et aller sur http://localhost:3000.
5. Tester dans l’ordre :
   - http://localhost:3000 (accueil)
   - http://localhost:3000/settings (paramètres, section Rappels, horaires)
   - un Skane jusqu’au « Mieux » → share-prompt → clic Partager (flux viral + éventuel rappel premier Skane)

---

## 3. Vérifier que tu es dans le bon projet

- Le terminal doit être dans le dossier **Nokta One** (prompt du type `… Nokta One …`).
- La commande doit être uniquement **`npm run dev`** (pas `npm run dev cd "..."`).
- L’URL dans le navigateur doit être **http://localhost:3000** (et pas un autre port ou un ancien déploiement).

Si après ça ce que tu vois ne correspond toujours pas au code, on peut ajouter un indicateur de version dans l’UI (ex. dans les Paramètres) pour vérifier que la bonne version est chargée.
