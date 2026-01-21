# 🚀 Guide d'Intégration - Signup SMS Optimisé

## Vue d'ensemble

Ce guide explique comment intégrer le nouveau flow d'inscription SMS-first dans Nokta One.

## Flow Utilisateur Final

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ARRIVÉE SUR L'APP (nouveau visiteur)                       │
│                    │                                        │
│                    ▼                                        │
│  ┌─────────────────────────────────────┐                   │
│  │      PREMIER SKANE (guest)          │                   │
│  │   - Camera access                    │                   │
│  │   - Scan facial IA                   │                   │
│  │   - Résultat + Micro-action          │                   │
│  │   - Feedback                         │                   │
│  └──────────────────┬──────────────────┘                   │
│                     │                                       │
│                     ▼                                       │
│  ┌─────────────────────────────────────┐                   │
│  │   QuickSignupModal (bottom sheet)   │                   │
│  │                                      │                   │
│  │   "87 → 32 - Sauvegardez votre      │                   │
│  │    reset et recevez vos rappels"    │                   │
│  │                                      │                   │
│  │   [🇫🇷 +33] [6 12 34 56 78    ] [→] │ ← PRINCIPAL      │
│  │   ☑️ J'accepte les rappels SMS       │                   │
│  │                                      │                   │
│  │   ─────────── ou ───────────        │                   │
│  │                                      │                   │
│  │   [  Apple  ] [  Google  ]          │ ← SECONDAIRE     │
│  │                                      │                   │
│  │   "Plus tard"                        │ ← SKIP           │
│  └──────────────────┬──────────────────┘                   │
│                     │                                       │
│            ┌────────┼────────┐                             │
│            │        │        │                             │
│            ▼        ▼        ▼                             │
│         [OTP]   [OAuth]   [Skip]                           │
│            │        │        │                             │
│            ▼        ▼        ▼                             │
│         [HOME]  [HOME]   [Share ou Home]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Fichiers Créés

### Composants
- `components/signup/QuickSignupModal.tsx` - Modal d'inscription SMS-first

### API Routes
- `app/api/auth/send-otp/route.ts` - Envoie un code OTP par SMS
- `app/api/auth/verify-otp/route.ts` - Vérifie le code OTP et crée/connecte l'utilisateur
- `app/api/webhooks/twilio/incoming/route.ts` - Webhook pour gérer STOP/START/HELP

### Services
- `lib/services/twilio.ts` - Service Twilio pour l'envoi de SMS

### Base de données
- `supabase/migrations/phone_auth.sql` - Migration SQL pour OTP et consentement SMS

### Intégrations
- `app/skane/feedback/page.tsx` - Intégration du modal après feedback

## Configuration Twilio

### Étape 1: Créer un compte
1. Aller sur https://www.twilio.com/try-twilio
2. Créer un compte (gratuit pour tester)
3. Vérifier votre email et téléphone

### Étape 2: Obtenir un numéro
1. Console → Phone Numbers → Buy a number
2. Choisir un numéro avec capacité SMS
3. Pour la France: ~6€/mois
4. Pour les US: ~1.15$/mois

### Étape 3: Configurer le webhook STOP
1. Console → Phone Numbers → Manage → Active Numbers
2. Cliquer sur votre numéro
3. Section "Messaging":
   - "A MESSAGE COMES IN" → Webhook
   - URL: `https://votre-domaine.com/api/webhooks/twilio/incoming`
   - Method: HTTP POST

### Étape 4: Variables d'environnement
```bash
# Dans .env.local
TWILIO_ACCOUNT_SID=ACxxxxxxxx  # Dashboard → Account SID
TWILIO_AUTH_TOKEN=xxxxxxxx     # Dashboard → Auth Token
TWILIO_PHONE_NUMBER=+33xxxxxx  # Votre numéro Twilio
OTP_SALT=random-32-char-string # openssl rand -hex 32
```

### Étape 5: Pour la production (US)
Si vous ciblez les US, vous devez:
1. Enregistrer votre "Brand" (A2P 10DLC)
2. Créer une "Campaign" 
3. Attendre l'approbation des opérateurs (~2-5 jours)
4. Sans ça: SMS filtrés ou bloqués

## Installation

### 1. Exécuter la migration SQL
```sql
-- Dans Supabase SQL Editor
\i supabase/migrations/phone_auth.sql
```

### 2. Configurer les variables d'environnement
Voir section "Configuration Twilio" ci-dessus.

### 3. Tester le flow
1. Faire un Skane en mode guest
2. Donner un feedback
3. Le modal d'inscription devrait apparaître
4. Tester l'envoi d'OTP
5. Vérifier la réception du SMS
6. Entrer le code et vérifier la connexion

## Coûts Estimés

| Élément | Coût | Notes |
|---------|------|-------|
| Numéro FR | ~6€/mois | |
| Numéro US | ~1.15$/mois | |
| SMS sortant FR | ~0.07€ | Par message |
| SMS sortant US | ~0.008$ | Par message |
| SMS entrant | ~0.006$ | Réponses STOP |

**Estimation 1000 users actifs:**
- ~2000 SMS/mois (rappels) = ~15€/mois en France
- Numéro: ~6€/mois
- **Total: ~21€/mois**

## Alternatives à Twilio

Si Twilio est trop cher ou complexe:

### MessageBird
- Meilleur pour l'Europe
- Pricing compétitif
- Bonne conformité RGPD

### Vonage (Nexmo)
- Bon support WhatsApp
- API similaire à Twilio

### AWS SNS
- Le moins cher en volume
- Plus complexe à configurer

## Checklist de Déploiement

- [ ] Créer compte Twilio et acheter numéro
- [ ] Configurer variables d'environnement
- [ ] Exécuter migration SQL (`phone_auth.sql`)
- [ ] Configurer webhook Twilio pour STOP
- [ ] Tester le flow complet en staging
- [ ] Configurer Vercel Cron pour les rappels (si nécessaire)
- [ ] (US) Soumettre A2P 10DLC registration
- [ ] Monitorer les coûts SMS
- [ ] Ajouter analytics sur conversion signup

## Métriques à Tracker

```typescript
// Événements à envoyer à Mixpanel/PostHog

// Signup funnel
track("signup_modal_shown", { source: "post_feedback" });
track("signup_phone_entered", { country_code: "+33" });
track("signup_otp_sent");
track("signup_otp_verified");
track("signup_completed", { method: "phone" | "apple" | "google" });
track("signup_skipped");

// SMS engagement
track("sms_reminder_sent");
track("sms_reminder_clicked"); // Si vous utilisez des liens trackés
track("sms_unsubscribed");
```

## Questions Fréquentes

**Q: Pourquoi SMS plutôt que email?**
- Taux d'ouverture SMS: ~98% vs Email: ~20%
- Temps de lecture: 3 min vs 6h pour email
- Engagement significativement meilleur

**Q: Et le coût des SMS?**
- ROI généralement excellent si bien ciblé
- ~0.07€/SMS FR = négligeable vs valeur du rappel
- Limiter à 1-2 SMS/jour max

**Q: RGPD compliance?**
- Consentement explicite ✅
- Horodatage du consentement ✅
- STOP facile ✅
- Logs d'audit ✅

**Q: Et si l'utilisateur n'a pas de smartphone?**
- Les boutons Apple/Google sont là en fallback
- Représente <2% des utilisateurs cibles

## Sécurité

- OTP hashé avec SHA256 + salt
- Expiration après 10 minutes
- Un seul OTP valide par téléphone
- Rate limiting recommandé (à ajouter)
- Validation format E.164 pour les numéros

## Prochaines Étapes

1. **Rappels SMS automatiques**: Créer un cron job pour envoyer des rappels quotidiens
2. **Rate limiting**: Ajouter rate limiting sur les API OTP
3. **Analytics**: Intégrer tracking des conversions
4. **A/B Testing**: Tester différents messages dans le modal
5. **Localisation**: Adapter les messages SMS par pays
