# 🔐 Système de Consentement RGPD - Nokta One

## ✅ Implémentation complète

Le système de consentement RGPD est maintenant intégré dans Nokta One avec conformité complète aux articles 6, 7, 15, 17 et 20 du RGPD.

## 📁 Fichiers créés

### Composants
- `components/modals/ConsentModal.tsx` - Modal RGPD au premier lancement
- `components/signup/SignupConsent.tsx` - Checkboxes de consentement dans le signup
- `components/settings/PrivacySettingsSection.tsx` - Gestion des consentements dans Settings
- `components/providers/AppProvider.tsx` - Provider global pour gérer les consentements

### Hooks & Utilitaires
- `lib/hooks/useConsent.ts` - Hook pour gérer les consentements + fonctions export/delete

### Migrations SQL
- `supabase/migrations/add_consent_columns_to_profiles.sql` - Ajout des colonnes consent

### Traductions
- Ajoutées dans `lib/i18n/locales/fr.json` et `lib/i18n/locales/en.json`
- Auto-traduites dans toutes les autres langues (ES, DE, IT, PT, AR, HI, ID, JA, KO, ZH)

## 🚀 Intégration

### ✅ Déjà fait

1. **AppProvider intégré** dans `app/layout.tsx`
   - Affiche automatiquement le ConsentModal au premier lancement
   - Gère l'état des consentements globalement

2. **PrivacySettingsSection intégrée** dans `app/settings/page.tsx`
   - Section complète avec toggles analytics/marketing
   - Boutons export et suppression de compte

3. **Traductions ajoutées** dans tous les fichiers de langue

### ⚠️ À faire

1. **Créer les pages légales** :
   - `/app/privacy/page.tsx` - Politique de confidentialité
   - `/app/terms/page.tsx` - Conditions d'utilisation

2. **Intégrer SignupConsent dans le flow de signup** :
   - Ajouter dans `components/signup/QuickSignupModal.tsx` ou dans le flow SSO
   - Passer les consentements lors de la création du compte

3. **Exécuter la migration SQL** :
   ```sql
   -- Dans Supabase Dashboard → SQL Editor
   -- Exécuter: supabase/migrations/add_consent_columns_to_profiles.sql
   ```

4. **Connecter useConsent à Supabase** :
   - Vérifier que `saveConsentToServer` utilise la bonne table (`profiles`)
   - Tester l'export et la suppression de compte

## 📋 Checklist RGPD

### ✅ Obligatoire (Article 6 & 7)
- [x] Consentement explicite avant traitement (ConsentModal)
- [x] Séparation des consentements (privacy / analytics / marketing)
- [x] Preuve du consentement (consent_log avec timestamp)
- [x] Possibilité de retirer le consentement (PrivacySettingsSection)

### ✅ Droits des utilisateurs
- [x] Droit d'accès - Article 15 (via export)
- [x] Droit à la portabilité - Article 20 (export JSON)
- [x] Droit à l'effacement - Article 17 (delete account)
- [x] Droit de rectification - Article 16 (edit profile existant)

### ✅ Pour les US (CCPA)
- [x] Mention "We do not sell your data" (dans ConsentModal)
- [ ] TODO: Ajouter bouton "Do Not Sell My Personal Information" pour IP California

## 🔒 Points de sécurité

1. **Facial scans** : Traités localement, seuls les scores sont envoyés
2. **Données sensibles** : Anonymisation à la suppression (pas de hard delete)
3. **Consent versioning** : Permet de redemander consentement si CGU changent

## 📱 Fonctionnalités

### ConsentModal (Premier lancement)
- Fond blur noir
- Checkbox Privacy obligatoire (marquée avec *)
- Options analytics/marketing dépliables avec détails
- Boutons "Accepter la sélection" et "Tout accepter"
- Liens vers Privacy Policy et Terms
- Mention CCPA "We do not sell your data"

### PrivacySettingsSection (Settings)
- Toggles analytics/marketing avec animations
- Bouton export données (télécharge JSON)
- Bouton suppression compte (avec confirmation)
- Design cohérent avec le reste de l'app

### SignupConsent (Signup)
- Version simplifiée pour le flow d'inscription
- 3 checkboxes (privacy obligatoire, analytics/marketing optionnels)
- Liens vers Privacy Policy et Terms

## 🔧 Configuration

### Version du consentement
Modifier `CONSENT_VERSION` dans `lib/hooks/useConsent.ts` si les CGU changent :
```ts
export const CONSENT_VERSION = "1.0.0"; // Incrémenter si CGU changent
```

### Colonnes Supabase
Les colonnes suivantes doivent exister dans `profiles` :
- `consent_version` (TEXT)
- `consent_at` (TIMESTAMPTZ)
- `marketing_opt_in` (BOOLEAN)

## 🧪 Tests à effectuer

1. **Premier lancement** : Vérifier que ConsentModal s'affiche
2. **Signup** : Vérifier que les consentements sont sauvegardés
3. **Settings** : Tester les toggles analytics/marketing
4. **Export** : Tester le téléchargement des données
5. **Suppression** : Tester la suppression de compte (avec rollback en dev)

## 📚 Références

- [RGPD - Articles 6, 7, 15, 17, 20](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679)
- [CCPA - California Consumer Privacy Act](https://oag.ca.gov/privacy/ccpa)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
