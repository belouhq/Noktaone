# Guide de mise à jour Next.js 14 → 15

## ✅ Mise à jour effectuée

- **Next.js** : `^14.2.35` → `^15.1.6`
- **React** : `^18.3.1` → `^19.0.0`
- **React DOM** : `^18.3.1` → `^19.0.0`
- **@types/react** : `^18.3.12` → `^19.0.0`
- **@types/react-dom** : `^18.3.1` → `^19.0.0`

## ⚠️ Breaking Changes à vérifier

### 1. APIs asynchrones (cookies, headers, params, searchParams)

Dans Next.js 15, ces APIs sont maintenant asynchrones dans les Server Components :

```typescript
// ❌ Avant (Next.js 14)
export default function Page({ params, searchParams }) {
  const cookies = cookies();
  const headers = headers();
  // ...
}

// ✅ Après (Next.js 15)
export default async function Page({ params, searchParams }) {
  const cookies = await cookies();
  const headers = await headers();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  // ...
}
```

**Action requise** : Vérifier les pages/layouts qui utilisent ces APIs.

### 2. Caching par défaut

- `fetch` requests ne sont plus cachées par défaut
- `GET` Route Handlers ne sont plus cachés par défaut
- Client navigations ne sont plus cachées par défaut

**Action requise** : Si vous avez besoin de caching, utiliser explicitement `cache: 'force-cache'` ou `revalidate`.

### 3. React 19

- `useFormState` → `useActionState`
- `useFormStatus` inclut maintenant `data`, `method`, `action`

**Action requise** : Vérifier l'utilisation de ces hooks.

## 📝 Commandes à exécuter

```bash
# 1. Installer les nouvelles dépendances
npm install

# 2. Vérifier les erreurs de compilation
npm run build

# 3. Tester l'application
npm run dev
```

## 🔍 Points à vérifier après la mise à jour

1. ✅ Vérifier que toutes les pages client (`"use client"`) fonctionnent
2. ⚠️ Vérifier les Server Components qui utilisent `cookies()`, `headers()`, `params`, `searchParams`
3. ⚠️ Vérifier les routes API qui utilisent `fetch` avec caching implicite
4. ⚠️ Vérifier l'utilisation de `useFormState` (remplacé par `useActionState`)

## 🛠️ Outil de migration automatique

Next.js fournit un outil de codemod pour automatiser certaines migrations :

```bash
npx @next/codemod@canary upgrade latest
```

## 📚 Documentation

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
