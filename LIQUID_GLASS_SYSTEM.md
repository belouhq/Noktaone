# 🎨 Système de Design Liquid Glass - Nokta One

## Vue d'ensemble

Système de design harmonisé basé sur le **liquid glass** (glassmorphism) pour créer une expérience visuelle cohérente dans toute l'application.

## Classes CSS disponibles

### Boutons

#### `.glass-button-primary`
Bouton CTA principal avec accent bleu Nokta.

```tsx
<button className="glass-button-primary w-full py-4 text-lg font-semibold">
  Commencer
</button>
```

#### `.glass-button-secondary`
Bouton secondaire avec effet glass standard.

```tsx
<button className="glass-button-secondary w-full py-4 font-medium">
  Plus tard
</button>
```

#### `.glass-button-ghost`
Bouton discret, transparent par défaut, glass au hover.

```tsx
<button className="glass-button-ghost py-2 text-sm">
  Annuler
</button>
```

#### `.glass-icon-button`
Bouton icône circulaire ou carré.

```tsx
<button className="glass-icon-button w-10 h-10 rounded-full">
  <Icon size={20} />
</button>
```

### Encarts / Cards

#### `.glass-card`
Encart principal avec effet liquid glass.

```tsx
<div className="glass-card p-4">
  <h3>Titre</h3>
  <p>Contenu</p>
</div>
```

### Inputs

#### `.glass-input`
Champ de saisie avec effet glass.

```tsx
<input
  type="email"
  className="glass-input w-full pl-12 pr-4 py-4 text-white"
  placeholder="ton@email.com"
/>
```

### Badges

#### `.glass-badge`
Badge/étiquette avec effet glass.

```tsx
<span className="glass-badge">Nouveau</span>
```

## Variables CSS

Toutes les variables sont définies dans `app/globals.css` :

```css
--glass-bg: rgba(255, 255, 255, 0.08);
--glass-bg-hover: rgba(255, 255, 255, 0.12);
--glass-border: rgba(255, 255, 255, 0.15);
--glass-border-hover: rgba(255, 255, 255, 0.25);
--glass-blur: blur(20px);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
--glass-shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

## Caractéristiques du style

### Effet Glass
- **Backdrop blur** : `blur(20px)` pour l'effet de verre dépoli
- **Transparence** : `rgba(255, 255, 255, 0.08)` pour le fond
- **Bordure subtile** : `rgba(255, 255, 255, 0.15)` pour la profondeur
- **Ombres** : Ombres douces pour la profondeur

### Interactions
- **Hover** : Augmentation légère de l'opacité et de la bordure
- **Active** : Légère réduction d'échelle pour le feedback tactile
- **Transitions** : `cubic-bezier(0.4, 0, 0.2, 1)` pour des animations fluides

## Composants mis à jour

### ✅ Composants UI
- `components/ui/GlassButton.tsx` - Support des variants primary/secondary/ghost
- `components/settings/SettingItem.tsx` - Utilise `.glass-card`
- `components/settings/ProfileCard.tsx` - Utilise `.glass-card` et `.glass-icon-button`

### ✅ Pages
- `app/welcome/page.tsx` - Bouton principal avec `.glass-button-primary`
- `app/login/page.tsx` - Inputs avec `.glass-input`, boutons avec classes glass
- `app/forgot-password/page.tsx` - Inputs et boutons harmonisés
- `app/skane/share-prompt-v1/page.tsx` - Bouton principal harmonisé
- `app/dictionary/page.tsx` - Bouton retour avec `.glass-icon-button`
- `app/settings/page.tsx` - Bouton logout harmonisé

## Migration en cours

### À migrer
- Autres pages dans `app/` (onboarding, skane, etc.)
- Modals dans `components/modals/`
- Autres composants avec styles inline

## Guide de migration

### Avant
```tsx
<button
  className="w-full py-4 rounded-xl text-white"
  style={{
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  }}
>
  Bouton
</button>
```

### Après
```tsx
<button className="glass-button-secondary w-full py-4 text-white">
  Bouton
</button>
```

### Avant (Input)
```tsx
<input
  className="w-full py-4 rounded-xl"
  style={{
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  }}
/>
```

### Après
```tsx
<input className="glass-input w-full py-4 text-white" />
```

## Bonnes pratiques

1. **Utiliser les classes CSS** plutôt que les styles inline
2. **Respecter la hiérarchie** : primary pour les CTAs, secondary pour les actions secondaires
3. **Cohérence** : Tous les boutons et encarts doivent utiliser le système
4. **Accessibilité** : Les classes incluent déjà les états disabled et focus

## Notes techniques

- Le système utilise `backdrop-filter` qui nécessite un support navigateur moderne
- Les transitions sont optimisées pour les performances
- Compatible avec Framer Motion pour les animations
- Responsive par défaut
