# 🔧 Configuration OpenAI API - Guide Complet

## 📋 Variables d'Environnement Requises

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Clé API OpenAI (requis)
OPENAI_API_KEY=sk-proj-...

# Organisation OpenAI (optionnel, pour les comptes d'équipe)
OPENAI_ORGANIZATION_ID=org-...

# Projet OpenAI (optionnel, pour les comptes d'équipe)
OPENAI_PROJECT_ID=proj-...
```

## 🔍 Où Trouver Ces Valeurs

### OPENAI_API_KEY
1. Allez sur https://platform.openai.com/api-keys
2. Créez une nouvelle clé API ou utilisez une existante
3. Format : `sk-proj-...`

### OPENAI_ORGANIZATION_ID
1. Allez sur https://platform.openai.com/account/org-settings
2. L'Organization ID est affiché en haut de la page
3. Format : `org-...`
4. **Optionnel** : Seulement si vous utilisez un compte d'équipe

### OPENAI_PROJECT_ID
1. Allez sur https://platform.openai.com/account/projects
2. Sélectionnez votre projet
3. L'ID est dans l'URL ou les paramètres
4. Format : `proj-...`
5. **Optionnel** : Seulement si vous utilisez des projets

## ✅ Vérification

Après avoir ajouté les variables, redémarrez le serveur :

```bash
npm run dev
```

## 🐛 Debugging

Le client OpenAI log automatiquement :
- **Request ID** : Identifiant unique pour chaque requête
- **Processing time** : Temps de traitement
- **Tokens utilisés** : Consommation de tokens
- **Rate limits** : Headers de rate limiting

### Headers Loggés

```
openai-organization: Organisation associée
openai-processing-ms: Temps de traitement
openai-version: Version de l'API
x-request-id: ID unique de la requête
x-ratelimit-*: Informations sur les rate limits
```

### Exemple de Log

```
[OpenAI Request] {
  requestId: 'nokta_1234567890_abc123',
  processingTime: '1250ms',
  model: 'gpt-4o',
  tokensUsed: 150
}
```

## 🔒 Sécurité

- ✅ `.env.local` est dans `.gitignore` (ne sera pas commité)
- ✅ Les clés API ne sont jamais exposées côté client
- ✅ Toutes les requêtes passent par l'API route `/api/skane/analyze`

## 📊 Rate Limits

Le client gère automatiquement :
- **429 (Rate Limit)** : Retourne un message d'erreur clair
- **401 (Auth Error)** : Indique un problème de clé API
- **Autres erreurs** : Fallback sur valeurs par défaut

## 🧪 Test de Connexion

Pour tester la connexion, vous pouvez utiliser :

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Organization: $OPENAI_ORGANIZATION_ID" \
  -H "OpenAI-Project: $OPENAI_PROJECT_ID"
```

Ou directement dans l'app :
1. Aller sur `/skane`
2. Cliquer "Start Skane"
3. Vérifier les logs dans la console du serveur
