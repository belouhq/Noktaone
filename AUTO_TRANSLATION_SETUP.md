# 🌍 Configuration Auto-Traduction NOKTA ONE

## ✅ Installation complète

Le système d'auto-traduction est maintenant configuré ! Voici comment l'utiliser.

## 📋 Scripts disponibles

### Synchronisation manuelle
```bash
npm run sync-translations
```
Compare `fr.json` (source) avec les autres langues et traduit automatiquement les nouvelles clés manquantes.

### Détection de textes hardcodés
```bash
npm run auto-translate:dry    # Preview seulement (pas de modifications)
npm run auto-translate        # Preview + suggestions
npm run auto-translate:fix    # Détecte, traduit ET remplace dans le code
```

## 🔄 Workflow recommandé

### Option A: Automatique (recommandé)
1. Ajouter tes nouveaux textes en français dans `lib/i18n/locales/fr.json`
2. Faire ton commit normalement
3. Le hook pre-commit détecte les changements et traduit automatiquement

### Option B: Manuelle
1. Ajouter tes nouveaux textes en français dans `lib/i18n/locales/fr.json`
2. Exécuter `npm run sync-translations`
3. Les traductions sont générées automatiquement pour toutes les langues

### Option C: Détection automatique
1. Si tu as oublié d'utiliser `t()` dans le code :
   ```bash
   npm run auto-translate:dry    # Voir ce qui sera détecté
   npm run auto-translate:fix    # Corriger automatiquement
   ```
2. Puis `npm run sync-translations` pour traduire

## 🔑 Variables d'environnement

Assure-toi d'avoir dans `.env.local` :
```
OPENAI_API_KEY=sk-...
```

## 📁 Structure des fichiers

```
lib/i18n/locales/
├── fr.json    ← SOURCE (tu modifies celui-ci)
├── en.json    ← Auto-généré
├── es.json    ← Auto-généré
├── de.json    ← Auto-généré
├── it.json    ← Auto-généré
├── pt.json    ← Auto-généré
├── ar.json    ← Auto-généré
├── hi.json    ← Auto-généré
├── id.json    ← Auto-généré
├── ja.json    ← Auto-généré
├── ko.json    ← Auto-généré
└── zh.json    ← Auto-généré
```

## 📝 Bonnes pratiques

1. **Toujours modifier `fr.json`** - c'est la source de vérité
2. **Ne jamais modifier les autres fichiers** - ils sont auto-générés
3. **Utiliser `t('clé')` dans le code** - jamais de texte hardcodé
4. **Clés descriptives** - `settings.profile.editButton` pas `btn1`
5. **Respecter les règles NOKTA** :
   - Pas de mots médicaux (stress, anxiety, etc.)
   - Garder les marques : "Nokta One", "SKANE", etc.
   - Préserver les placeholders : {name}, {count}, etc.

## 🎯 Exemple d'utilisation

### Ajouter une nouvelle traduction

1. **Dans `fr.json`** :
```json
{
  "settings": {
    "newFeature": "Nouvelle fonctionnalité"
  }
}
```

2. **Commit** (le hook traduit automatiquement) ou **`npm run sync-translations`**

3. **Dans le code** :
```tsx
import { useTranslation } from "@/lib/hooks/useTranslation";

function MyComponent() {
  const { t } = useTranslation();
  return <button>{t("settings.newFeature")}</button>;
}
```

## 🚨 En cas de problème

- **Le hook pre-commit échoue ?** 
  - Vérifie que `OPENAI_API_KEY` est défini
  - Vérifie que tu as des crédits OpenAI
  - Tu peux skip le hook avec `git commit --no-verify` (non recommandé)

- **Les traductions ne sont pas bonnes ?**
  - Modifie directement `fr.json` et relance `npm run sync-translations`
  - Les traductions sont régénérées pour les clés modifiées

- **Des textes hardcodés restent ?**
  - Lance `npm run auto-translate:dry` pour les détecter
  - Puis `npm run auto-translate:fix` pour les corriger

## 📚 Scripts techniques

- `sync-translations.ts` : Compare fr.json avec les autres langues et traduit
- `auto-translate.ts` : Détecte les textes hardcodés dans le code
- `.husky/pre-commit` : Hook Git qui synchronise automatiquement
