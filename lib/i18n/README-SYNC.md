# i18n Auto-Sync System

Système de synchronisation automatique des traductions pour NOKTA ONE.

## 🎯 Principe

- **Source de vérité** : `lib/i18n/locales/en.json` (anglais)
- **Traduction automatique** : Toutes les autres langues sont générées via OpenAI API
- **Ton NOKTA** : Phrases courtes (2-6 mots), direct, zéro jargon médical
- **Mots interdits** : Liste par langue pour éviter le vocabulaire médical/thérapeutique
- **Fallback automatique** : Si l'API tombe, conserve l'existant et remplit en anglais

## 🚀 Utilisation

### Synchronisation manuelle

```bash
npm run i18n:sync
```

### Variables d'environnement

- `OPENAI_API_KEY` : Clé API OpenAI (requise pour la traduction)
- `I18N_FAIL_ON_MISSING` : Si `"true"`, fait échouer le build si des traductions manquent
- `I18N_DRY_RUN` : Si `"true"`, simule sans écrire les fichiers

### Exemple

```bash
# Avec API key
OPENAI_API_KEY=sk-... npm run i18n:sync

# Mode dry-run (test)
I18N_DRY_RUN=true npm run i18n:sync

# Mode strict (échoue si problème)
I18N_FAIL_ON_MISSING=true npm run i18n:sync
```

## 📋 Workflow

1. **Ajouter/modifier du texte en anglais** dans `lib/i18n/locales/en.json`
2. **Lancer** `npm run i18n:sync`
3. **Vérifier** le rapport `.i18n-sync-report.json`
4. **Commit** les fichiers mis à jour

## 🔄 CI/CD

Le workflow GitHub Actions (`.github/workflows/i18n-sync.yml`) :
- S'exécute sur chaque push vers `main`/`master`
- Synchronise automatiquement les traductions
- Commit les changements automatiquement

**Configuration requise** :
- Ajouter `OPENAI_API_KEY` dans les secrets GitHub

## 📊 Rapport

Après chaque exécution, un rapport est généré dans `.i18n-sync-report.json` :

```json
{
  "model": "gpt-4o-mini",
  "sourceLocale": "en",
  "locales": ["fr", "es", ...],
  "changedKeys": ["home.title", ...],
  "results": {
    "fr": {
      "missingCount": 5,
      "updateCount": 2,
      "totalWork": 7,
      "apiUsed": true,
      "fallbackToEnglish": 0,
      "forbiddenHits": []
    }
  },
  "apiFallbackUsed": false,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚫 Mots interdits

Chaque langue a une liste de mots interdits (médical/thérapeutique) :

- **en** : diagnosis, treatment, medical, therapy, anxiety, depression...
- **fr** : diagnostic, traitement, médical, thérapie, anxiété, dépression...
- etc.

Ces mots sont automatiquement détectés et signalés dans le rapport.

## 🔧 Structure des fichiers

```
lib/i18n/locales/
  ├── en.json          # Source de vérité
  ├── fr.json          # Généré automatiquement
  ├── es.json          # Généré automatiquement
  └── ...

.i18n-sync-cache.json  # Cache des hash (commité)
.i18n-sync-report.json # Rapport (gitignored)
```

## ⚠️ Règles importantes

1. **Ne jamais modifier directement** les fichiers de traduction (sauf `en.json`)
2. **Toujours utiliser** `t("key")` dans le code, jamais de strings hardcodées
3. **Respecter le ton NOKTA** : court, direct, body-focused
4. **Préserver les tokens de marque** : "Nokta One", "Skane", "Reset"
5. **Préserver les placeholders** : `{name}`, `{count}`, etc.

## 🐛 Dépannage

### L'API échoue

Le script utilise automatiquement un fallback :
- Conserve les traductions existantes
- Remplit les clés manquantes en anglais
- Génère un rapport avec `apiFallbackUsed: true`

### Mots interdits détectés

Vérifiez le rapport `.i18n-sync-report.json` pour voir les hits.
Si nécessaire, ajoutez la clé à `ALLOW_FORBIDDEN_ON_KEYS` dans le script.

### Cache corrompu

Supprimez `.i18n-sync-cache.json` et relancez le script.
