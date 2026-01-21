# 📱 Configuration Cron Job SMS - Nokta One

## Vue d'ensemble

Le cron job `/api/cron/send-reminders` envoie automatiquement des rappels SMS quotidiens aux utilisateurs consentants.

## Configuration Vercel Cron

### 1. Créer `vercel.json` à la racine du projet

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 8,14,20 * * *"
    }
  ]
}
```

**Explication du schedule :**
- `0 8,14,20 * * *` = 3 fois par jour (8h, 14h, 20h UTC)
- Ajustez selon vos besoins (ex: `0 9 * * *` = une fois par jour à 9h UTC)

### 2. Variable d'environnement

Ajoutez dans Vercel Dashboard → Settings → Environment Variables :

```
CRON_SECRET=your-super-secret-random-string-here
```

**Important :** Utilisez un secret fort (minimum 32 caractères aléatoires).

### 3. Configuration Twilio

Assurez-vous que ces variables sont configurées :

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...
```

## Fonctionnalités

### ✅ Sécurité
- Authentification via `CRON_SECRET` (Bearer token)
- Vérification de la signature (à implémenter pour Twilio)

### ✅ Respect des préférences
- Vérifie `sms_consent = true`
- Respecte `sms_frequency` (daily, weekly, none)
- Vérifie les désabonnements (`sms_unsubscribes`)
- Évite le spam (minimum 12h entre 2 SMS)

### ✅ Messages intelligents
- **3 moments de la journée** : morning (6h-12h), afternoon (12h-18h), evening (18h+)
- **19 pays supportés** avec timezone automatique
- **Messages variés** pour éviter la lassitude (3 variantes par moment)

### ✅ Rate Limiting
- Délai de 100ms entre chaque envoi
- Protection contre les rate limits Twilio

### ✅ Tracking complet
- Logs dans `sms_logs` (succès/échecs)
- Mise à jour de `last_sms_sent_at`
- Statistiques détaillées (sent, failed, unsubscribed, skipped)

## Pays et Timezones supportés

| Pays | Code | Timezone |
|------|------|----------|
| France | FR | Europe/Paris |
| États-Unis | US | America/New_York |
| Royaume-Uni | GB | Europe/London |
| Allemagne | DE | Europe/Berlin |
| Espagne | ES | Europe/Madrid |
| Italie | IT | Europe/Rome |
| Belgique | BE | Europe/Brussels |
| Suisse | CH | Europe/Zurich |
| Canada | CA | America/Toronto |
| Maroc | MA | Africa/Casablanca |
| Sénégal | SN | Africa/Dakar |
| Côte d'Ivoire | CI | Africa/Abidjan |
| Madagascar | MG | Indian/Antananarivo |
| Brésil | BR | America/Sao_Paulo |
| Mexique | MX | America/Mexico_City |
| Japon | JP | Asia/Tokyo |
| Corée du Sud | KR | Asia/Seoul |
| Inde | IN | Asia/Kolkata |
| Émirats Arabes Unis | AE | Asia/Dubai |

**Fallback :** UTC si le pays n'est pas reconnu.

## Test manuel

### Via curl

```bash
curl -X GET "https://your-domain.vercel.app/api/cron/send-reminders" \
  -H "Authorization: Bearer your-cron-secret"
```

### Via Vercel Dashboard

1. Aller dans **Deployments**
2. Ouvrir le dernier déploiement
3. Cliquer sur **Functions** → `/api/cron/send-reminders`
4. Tester avec l'onglet **Test**

## Monitoring

### Logs Vercel

Les logs sont disponibles dans :
- Vercel Dashboard → **Logs**
- Filtrer par fonction : `send-reminders`

### Statistiques retournées

```json
{
  "success": true,
  "stats": {
    "total": 150,
    "sent": 142,
    "skipped": 3,
    "failed": 2,
    "unsubscribed": 3
  },
  "duration": 15234
}
```

### Requête SQL pour analytics

```sql
-- SMS envoyés aujourd'hui
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM sms_logs
WHERE message_type = 'reminder'
  AND DATE(sent_at) = CURRENT_DATE;

-- Taux de désabonnement
SELECT 
  COUNT(DISTINCT phone) as unsubscribed_count
FROM sms_unsubscribes
WHERE unsubscribed_at >= CURRENT_DATE - INTERVAL '30 days';
```

## Personnalisation

### Modifier les messages

Éditez `REMINDER_MESSAGES` dans `/app/api/cron/send-reminders/route.ts` :

```typescript
const REMINDER_MESSAGES = {
  morning: [
    "Votre message personnalisé ici → nokta.app",
    // ...
  ],
  // ...
};
```

### Modifier la fréquence

Changez le schedule dans `vercel.json` :
- `0 9 * * *` = Une fois par jour à 9h UTC
- `0 */6 * * *` = Toutes les 6 heures
- `0 8,20 * * *` = Matin et soir

### Ajouter un pays

Ajoutez dans `getTimezoneFromCountry()` :

```typescript
const timezoneMap: Record<string, string> = {
  // ...
  YOUR_COUNTRY_CODE: "Timezone/Name",
};
```

## Troubleshooting

### Erreur 401 Unauthorized
- Vérifiez que `CRON_SECRET` est bien configuré dans Vercel
- Vérifiez que le header `Authorization: Bearer ...` est correct

### Aucun SMS envoyé
- Vérifiez que des utilisateurs ont `sms_consent = true`
- Vérifiez que `sms_frequency != 'none'`
- Vérifiez les logs pour voir pourquoi les utilisateurs sont skipped

### Rate limiting Twilio
- Augmentez le délai entre les envois (actuellement 100ms)
- Divisez les envois en plusieurs batches

### Messages non reçus
- Vérifiez les logs Twilio dans le dashboard
- Vérifiez que le numéro Twilio est valide
- Vérifiez les `sms_logs` pour les erreurs

## Conformité légale

✅ **TCPA (US)** : Respect des désabonnements STOP  
✅ **RGPD (EU)** : Consentement explicite requis  
✅ **Opt-out facile** : Réponse STOP pour se désabonner  
✅ **Audit trail** : Tous les SMS sont loggés dans `sms_logs`
