# Supabase Configuration

Ce dossier contient la configuration et les clients Supabase pour l'application NOKTA ONE.

## 📋 Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

### Où trouver vos clés Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ gardez-la secrète !)

## 🔧 Utilisation

### Client-side (React Components)

```typescript
import { supabase } from '@/lib/supabase/client';

// Exemple : récupérer des données
const { data, error } = await supabase
  .from('users')
  .select('*');
```

### Server-side (API Routes)

```typescript
import { supabaseAdmin } from '@/lib/supabase/server';

// Exemple : opération admin
const { data, error } = await supabaseAdmin
  .from('users')
  .delete()
  .eq('id', userId);
```

## ✅ Tester la connexion

### Méthode 1 : Script de test

```bash
npm run test-supabase
```

### Méthode 2 : API Route

Lancez votre serveur de développement et visitez :

```
http://localhost:3000/api/supabase/test
```

### Méthode 3 : Dans le code

```typescript
import { testSupabaseConnection } from '@/lib/supabase/client';

const result = await testSupabaseConnection();
console.log(result);
```

## 📁 Structure des fichiers

- `config.ts` - Configuration et variables d'environnement
- `client.ts` - Client Supabase pour le côté client (React)
- `server.ts` - Client Supabase pour le côté serveur (API routes)
- `README.md` - Cette documentation

## 🔒 Sécurité

- ⚠️ **Ne jamais** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- ✅ Utilisez `supabase` (client) dans les composants React
- ✅ Utilisez `supabaseAdmin` (server) uniquement dans les API routes
- ✅ Les variables `NEXT_PUBLIC_*` sont accessibles côté client
- ✅ Les autres variables sont uniquement côté serveur
