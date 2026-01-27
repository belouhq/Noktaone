# Guide de dépannage - NOKTA ONE

## Internal Server Error (500)

### 1. Voir l’erreur réelle

En dev, Next.js affiche la vraie erreur dans **le terminal** où tourne `npm run dev`. Quand tu vois « Internal Server Error » dans le navigateur :

1. Regarde le terminal du serveur.
2. Tu devrais voir un message du type `Error: ...` avec la pile d’appels.

### 2. Nettoyer le cache et redémarrer

Souvent lié à un cache de build corrompu ou désynchronisé :

```bash
rm -rf .next
npm run dev
```

Puis recharger la page qui affichait l’erreur.

### 3. Causes fréquentes

- **Variables d’environnement** : vérifier `.env.local` (ex. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Route API** : une route dans `app/api/` qui lance une exception (DB, env, etc.).
- **Composant serveur** : un Server Component qui utilise `window`/`localStorage` ou qui appelle une API qui échoue.

### 4. Tester une page précise

Si l’erreur ne se produit que sur une URL (ex. `/skane`, `/settings`) :

1. Lance `npm run dev`.
2. Ouvre cette URL dans le navigateur.
3. Regarde immédiatement le terminal : l’erreur et la stack trace s’affichent là.

---

## Problème de permissions réseau macOS

## ✅ RÉSOLU
Le problème de permissions réseau a été résolu. Le serveur fonctionne maintenant sur `localhost:3000`.

## Problème (résolu)
L'erreur `EPERM: operation not permitted` indiquait que macOS bloquait l'accès réseau à Node.js.

## Solution

### 1. Autoriser l'accès réseau (OBLIGATOIRE)

1. Ouvrir **Réglages Système** (ou **System Settings**)
2. Aller dans **Confidentialité et sécurité** (ou **Privacy & Security**)
3. **Cliquer sur "Réseau local"** (ou **"Local Network"**) - vous verrez "(48 applications)" à côté
4. Dans la liste qui s'ouvre, chercher :
   - **Terminal** (ou **iTerm2** si vous l'utilisez)
   - **Cursor** (ou **Visual Studio Code** si vous l'utilisez)
   - **Node.js** (peut apparaître comme "node")
5. **Cocher la case** à côté de chaque application pour autoriser l'accès réseau local
6. **Si Terminal/Cursor/Node.js n'apparaît PAS dans la liste** (c'est votre cas) :
   - **Fermer complètement Cursor** (Cmd+Q, pas juste fermer la fenêtre)
   - **Rouvrir Cursor**
   - Dans le terminal intégré de Cursor, taper : `npm run dev`
   - **macOS affichera automatiquement une popup** demandant l'autorisation réseau
   - **Cliquer sur "Autoriser"** dans la popup
   - Revenir dans Réglages Système → Confidentialité et sécurité → Réseau local
   - **Cursor/Terminal devrait maintenant apparaître** dans la liste
   - **Cocher la case** pour activer l'accès réseau local

### 2. Redémarrer complètement

- Fermer **TOUS** les terminaux et Cursor
- Rouvrir Cursor
- Relancer `npm run dev`

### 3. Vérifier les processus

```bash
# Vérifier si un processus utilise le port 3000
lsof -i :3000

# Si oui, le tuer
kill -9 <PID>
```

### 4. Alternative : Utiliser un autre port

Si le problème persiste après avoir autorisé l'accès réseau :

```bash
PORT=8080 npm run dev
```

Puis accéder à `http://localhost:8080`

## Vérification

Après avoir autorisé l'accès réseau, le serveur devrait démarrer avec :

```
✓ Ready in X ms
○ Local: http://localhost:3000
```

Si vous voyez toujours `EPERM`, le problème vient des permissions macOS, pas du code.

## Solution alternative : Utiliser Terminal natif macOS

Si Cursor ne déclenche pas la popup d'autorisation :

1. **Ouvrir Terminal** (application native macOS, pas le terminal intégré de Cursor)
2. Naviguer vers le projet :
   ```bash
   cd "/Users/benjaminbel/nokta-app/Nokta One"
   ```
3. Lancer le test :
   ```bash
   node test-server.js
   ```
4. **macOS devrait afficher une popup** → Cliquer sur **"Autoriser"**
5. Une fois autorisé, vous pouvez utiliser Cursor normalement

Terminal natif déclenche souvent mieux les demandes de permissions macOS que les terminaux intégrés des éditeurs.
