# Configuration - Gestion des Partenariats

## Vue d'ensemble

Le panneau de gestion des partenariats est protégé par un code d'accès unique. Seuls les utilisateurs ayant le code peuvent accéder au panneau d'affiliation.

## Configuration

### Variable d'environnement

Ajoutez la variable suivante dans votre fichier `.env.local` :

```bash
PARTNERSHIP_ACCESS_CODE=votre_code_secret_ici
```

**Exemple :**
```bash
PARTNERSHIP_ACCESS_CODE=NOkta2025!
```

### Sécurité

- Le code est comparé de manière insensible à la casse
- Rate limiting : 5 tentatives maximum par 15 minutes par IP
- Le code est stocké uniquement côté serveur (variable d'environnement)
- L'accès est stocké dans `sessionStorage` (valide uniquement pour la session en cours)

## Utilisation

1. L'utilisateur clique sur "Gestion des partenariats" dans les paramètres
2. Un modal s'ouvre demandant le code d'accès
3. Après validation du code, le panneau d'affiliation s'affiche
4. L'accès reste valide pour toute la session (jusqu'à fermeture du navigateur)

## API

### POST `/api/affiliate/verify-access`

**Body :**
```json
{
  "code": "votre_code"
}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "message": "Accès autorisé"
}
```

**Réponse (erreur) :**
```json
{
  "success": false,
  "error": "Code incorrect"
}
```

## Personnalisation

### Changer le code

Modifiez simplement la variable `PARTNERSHIP_ACCESS_CODE` dans `.env.local` et redémarrez l'application.

### Désactiver l'authentification

Pour désactiver temporairement l'authentification, modifiez `PartnershipSection.tsx` :

```tsx
const [hasAccess, setHasAccess] = useState(true); // Au lieu de false
```

## Notes

- Le code par défaut est `NOkta2025!` si la variable d'environnement n'est pas définie
- Le rate limiting est basique (Map en mémoire). Pour la production, utilisez Redis
- L'accès est perdu à la fermeture du navigateur (sessionStorage)
