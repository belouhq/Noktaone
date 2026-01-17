# NOKTA ONE

Application Next.js 14 pour le bien-être et la régulation physiologique.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Backend & Database)
- **OpenAI GPT-4 Vision** (Analyse faciale)
- **Framer Motion** (Animations)
- **react-i18next** (Internationalisation - 12 langues)

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase
- Clé API OpenAI

## 🔧 Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Puis remplir avec vos clés

# Lancer le serveur de développement
npm run dev
```

## 🔐 Variables d'environnement

Créez un fichier `.env.local` à la racine :

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

## 🗄️ Base de données Supabase

### 1. Créer les tables

Exécutez le schéma SQL dans votre dashboard Supabase :

```bash
# Via SQL Editor dans Supabase Dashboard
# Copiez-collez le contenu de supabase/schema.sql
```

### 2. Seed les données initiales

```bash
# Via SQL Editor dans Supabase Dashboard
# Copiez-collez le contenu de supabase/seed.sql
```

### Structure des tables

- `user_profile` - Profils utilisateurs (compte + invités)
- `skane_sessions` - Sessions SKANE (scan + état)
- `micro_actions` - Catalogue des micro-actions avec base_weight
- `micro_action_events` - Événements (action lancée + feedback)
- `state_action_map` - Mapping état → actions candidates

## 🧠 Algorithme de sélection

L'application utilise un algorithme simple et robuste pour choisir la meilleure micro-action :

```
score = base_weight + user_lift - fatigue_penalty
```

- **base_weight** : % ressenti initial (0-100) depuis `micro_actions`
- **user_lift** : Effet moyen perso calculé sur les N derniers feedbacks
- **fatigue_penalty** : Pénalité si action répétée récemment

Sélection : Top-2 actions → random pondéré par score

## 📱 Fonctionnalités

- ✅ Scan facial avec GPT-4 Vision
- ✅ 11 micro-actions guidées (respiration, posture, etc.)
- ✅ Feedback 3 smileys (🙂😐🙁)
- ✅ Mode invité (sans compte)
- ✅ Mode compte (historique + personnalisation)
- ✅ 12 langues supportées
- ✅ PWA ready

## 🌍 Langues supportées

Français, English, Español, Deutsch, Italiano, Português, العربية, हिन्दी, Bahasa Indonesia, 日本語, 한국어, 中文

## 📂 Structure du projet

```
├── app/                    # Pages Next.js (App Router)
│   ├── skane/             # Flow SKANE complet
│   ├── settings/           # Paramètres utilisateur
│   └── signup/             # Inscription
├── components/             # Composants React
│   ├── modals/            # Modals (Profile, Language, etc.)
│   ├── skane/             # Composants SKANE
│   └── ui/                # Composants UI réutilisables
├── lib/
│   ├── skane/             # Algorithme SKANE
│   │   ├── analyzer.ts    # Analyse GPT-4 Vision
│   │   ├── selector.ts    # Sélection V1 (localStorage)
│   │   ├── selector-v2.ts # Sélection V2 (Supabase)
│   │   └── supabase-tracker.ts # Tracking Supabase
│   ├── supabase/          # Clients Supabase
│   └── i18n/              # Configuration i18n
└── supabase/               # Schémas SQL
    ├── schema.sql          # Structure des tables
    └── seed.sql            # Données initiales
```

## 🚀 Scripts disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Production
npm run lint         # Linter
npm run translate    # Traduire les clés manquantes
npm run test-supabase # Tester la connexion Supabase
```

## 📊 Tracking Supabase

Le système track automatiquement :

1. **Session SKANE** : État détecté + Skane Index
2. **Micro-action lancée** : Action sélectionnée + timestamp
3. **Feedback utilisateur** : Effect (-1/0/1) après l'action

Ces données alimentent l'algorithme de sélection pour personnaliser les recommandations.

## 🔒 Sécurité

- Variables d'environnement dans `.env.local` (non commitées)
- Row Level Security (RLS) activé sur Supabase
- Clés API jamais exposées côté client

## 📝 License

Propriétaire - Tous droits réservés

## 🤝 Contribution

Ce projet est privé. Pour toute question, contactez l'équipe.
