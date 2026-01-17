# 🔗 Connexion à GitHub

## Étape 1 : Créer un repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"New repository"** (ou **"+"** → **"New repository"**)
3. Nommez-le : `nokta-one` (ou le nom de votre choix)
4. Choisissez **Private** (recommandé pour un projet privé)
5. **Ne cochez PAS** "Initialize with README" (on a déjà un README)
6. Cliquez sur **"Create repository"**

## Étape 2 : Connecter le projet local

Une fois le repository créé, GitHub vous affichera des commandes. Utilisez celles-ci :

```bash
# Depuis le dossier du projet
cd "/Users/benjaminbel/nokta-app/Nokta One"

# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/nokta-one.git

# Ou si vous utilisez SSH :
# git remote add origin git@github.com:VOTRE_USERNAME/nokta-one.git

# Vérifier que c'est bien ajouté
git remote -v
```

## Étape 3 : Premier commit et push

```bash
# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit: NOKTA ONE app with Supabase tracking"

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

## ✅ Vérification

Allez sur votre repository GitHub, vous devriez voir tous vos fichiers !

## 🔄 Workflow quotidien

```bash
# Voir les changements
git status

# Ajouter les fichiers modifiés
git add .

# Créer un commit
git commit -m "Description de vos changements"

# Pousser vers GitHub
git push
```

## 🔒 Sécurité

⚠️ **IMPORTANT** : Le fichier `.env.local` est déjà dans `.gitignore` et ne sera **jamais** commité sur GitHub.

Vos clés API restent locales et sécurisées.

## 📝 Branches (optionnel)

Pour travailler sur des features séparément :

```bash
# Créer une nouvelle branche
git checkout -b feature/nom-de-la-feature

# Faire vos modifications, puis :
git add .
git commit -m "Ajout de la feature X"
git push -u origin feature/nom-de-la-feature

# Revenir sur main
git checkout main
```
