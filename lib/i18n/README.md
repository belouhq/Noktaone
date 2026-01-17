# 🌍 Système de Traduction Automatique - NOKTA ONE

## 📋 Langues Supportées

L'application supporte **12 langues** :

1. 🇫🇷 **Français** (fr) - Langue de base
2. 🇺🇸 **Anglais** (en) - English (US)
3. 🇪🇸 **Espagnol** (es) - Español
4. 🇩🇪 **Allemand** (de) - Deutsch
5. 🇮🇹 **Italien** (it) - Italiano
6. 🇧🇷 **Portugais** (pt) - Português (Brésil)
7. 🇸🇦 **Arabe** (ar) - العربية (avec support RTL)
8. 🇮🇳 **Hindi** (hi) - हिन्दी
9. 🇮🇩 **Indonésien** (id) - Bahasa Indonesia
10. 🇯🇵 **Japonais** (ja) - 日本語
11. 🇰🇷 **Coréen** (ko) - 한국어
12. 🇨🇳 **Chinois** (zh) - 中文

## 🚀 Utilisation dans le Code

### 1. Utiliser les traductions dans vos composants

```typescript
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.pressToSkane')}</p>
    </div>
  );
}
```

### 2. Ajouter une nouvelle clé de traduction

#### Option A : Via le script automatique (RECOMMANDÉ)

```bash
npm run add-translation "section.key" "Texte en français"
```

**Exemple :**
```bash
npm run add-translation "home.welcome" "Bienvenue sur NOKTA ONE"
```

Le script va :
- ✅ Ajouter la clé dans `fr.json`
- ✅ Traduire automatiquement dans **toutes les 12 langues**
- ✅ Sauvegarder dans tous les fichiers de traduction

#### Option B : Manuellement

1. Ajouter la clé dans `lib/i18n/locales/fr.json` :
```json
{
  "section": {
    "key": "Texte en français"
  }
}
```

2. Lancer le script de traduction pour synchroniser toutes les langues :
```bash
npm run translate
```

## 🔄 Synchroniser les traductions

Si vous avez ajouté des clés manuellement dans `fr.json`, lancez :

```bash
npm run translate
```

Ce script va :
- ✅ Détecter toutes les clés manquantes dans les autres langues
- ✅ Les traduire automatiquement avec OpenAI GPT-4o-mini
- ✅ Mettre à jour tous les fichiers de traduction

## 📝 Structure des Fichiers

```
lib/i18n/
├── index.ts              # Configuration i18n
├── locales/
│   ├── fr.json          # Français (source)
│   ├── en.json          # Anglais
│   ├── es.json          # Espagnol
│   ├── de.json          # Allemand
│   ├── it.json          # Italien
│   ├── pt.json          # Portugais
│   ├── ar.json          # Arabe
│   ├── hi.json          # Hindi
│   ├── id.json          # Indonésien
│   ├── ja.json          # Japonais
│   ├── ko.json          # Coréen
│   └── zh.json          # Chinois
└── README.md            # Ce fichier
```

## ⚙️ Configuration

### Variables d'environnement requises

Le script de traduction nécessite une clé API OpenAI :

```env
OPENAI_API_KEY=sk-...
```

### Support RTL (Right-to-Left)

L'arabe est automatiquement configuré en RTL. Le système ajuste automatiquement :
- La direction du texte (`dir="rtl"`)
- L'alignement des éléments
- Les marges et espacements

## 🎯 Bonnes Pratiques

1. **Toujours utiliser `t()` pour les textes visibles**
   ```typescript
   // ✅ Bon
   <button>{t('common.save')}</button>
   
   // ❌ Mauvais
   <button>Enregistrer</button>
   ```

2. **Utiliser des clés descriptives**
   ```typescript
   // ✅ Bon
   t('settings.profile.editButton')
   
   // ❌ Mauvais
   t('btn1')
   ```

3. **Conserver les placeholders**
   ```json
   {
     "home.daysAgo": "il y a {{count}} jours"
   }
   ```
   Les placeholders `{{count}}`, `{{hours}}`, etc. sont automatiquement préservés.

4. **Ne pas traduire les termes techniques**
   - "Skane" reste "Skane"
   - "NOKTA ONE" reste "NOKTA ONE"
   - Les noms de produits restent inchangés

## 🔍 Vérifier les traductions manquantes

Le script `translate.ts` affiche automatiquement :
- Le nombre de clés trouvées dans `fr.json`
- Le nombre de clés manquantes par langue
- Les traductions effectuées

## 📚 Ressources

- [Documentation i18next](https://www.i18next.com/)
- [Documentation react-i18next](https://react.i18next.com/)
