# Guide de démarrage - Serveur Next.js

## 🚀 Démarrer le serveur de développement

### Méthode 1 : Dans le terminal de Cursor (recommandé)

1. **Ouvrir le terminal intégré** dans Cursor :
   - Menu : `Terminal` → `New Terminal`
   - Ou raccourci : `` Ctrl+` `` (backtick)

2. **Naviguer vers le projet** (si ce n'est pas déjà fait) :
   ```bash
   cd "/Users/benjaminbel/nokta-app/Nokta One"
   ```

3. **Lancer le serveur** :
   ```bash
   npm run dev
   ```

4. **Attendre le démarrage** :
   Vous devriez voir :
   ```
   ✓ Ready in X ms
   ○ Local: http://localhost:3000
   ```

5. **Ouvrir dans le navigateur** :
   - Cliquer sur le lien `http://localhost:3000` dans le terminal
   - Ou ouvrir manuellement dans votre navigateur

---

### Méthode 2 : Dans Terminal natif macOS

1. **Ouvrir Terminal** (Applications → Utilitaires → Terminal)

2. **Naviguer vers le projet** :
   ```bash
   cd "/Users/benjaminbel/nokta-app/Nokta One"
   ```

3. **Lancer le serveur** :
   ```bash
   npm run dev
   ```

---

## ⚙️ Commandes utiles

### Arrêter le serveur
- Dans le terminal : `Ctrl + C`

### Vérifier si le serveur tourne
```bash
curl http://localhost:3000
```

### Utiliser un autre port
```bash
PORT=8080 npm run dev
```

---

## 🔧 En cas de problème

### Le serveur ne démarre pas
- Vérifier que les permissions réseau sont autorisées (voir `TROUBLESHOOTING.md`)
- Vérifier qu'aucun autre processus n'utilise le port 3000 :
  ```bash
  lsof -i :3000
  ```

### Erreur "port already in use"
- Arrêter le processus existant :
  ```bash
  pkill -f "next dev"
  ```
- Ou utiliser un autre port (voir ci-dessus)

---

## 📝 Note

Le serveur de développement Next.js :
- ✅ Recharge automatiquement lors des modifications de code (hot reload)
- ✅ Affiche les erreurs directement dans le navigateur
- ✅ Fonctionne uniquement en développement (pas pour la production)

Pour la production, utilisez :
```bash
npm run build
npm start
```
