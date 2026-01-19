# 🎯 Configuration des Comptes Influenceurs - FirstPromoter

## Vue d'ensemble

Le panneau d'affiliation est **uniquement accessible aux comptes d'influenceurs** avec un code FirstPromoter valide.

## Critères d'identification d'un influenceur

Un utilisateur est considéré comme influenceur si **au moins un** de ces critères est rempli :

1. **Note FirstPromoter** : La note du promoteur contient le mot "influencer" (insensible à la casse)
2. **Campagne spéciale** : Le promoteur a une promotion dans une campagne nommée "influencer"
3. **Code de parrainage spécial** : Le code de parrainage commence par `@influencer-` ou `@influ-`

## Configuration dans FirstPromoter

### Méthode 1 : Via la note du promoteur

1. Aller dans **FirstPromoter Dashboard** > **Promoters**
2. Sélectionner le promoteur
3. Dans le champ **Note**, ajouter : `influencer`
4. Sauvegarder

### Méthode 2 : Via une campagne spéciale

1. Créer une campagne nommée **"Influencer"** dans FirstPromoter
2. Assigner le promoteur à cette campagne
3. Le promoteur sera automatiquement identifié comme influenceur

### Méthode 3 : Via le code de parrainage

1. Dans Supabase, mettre à jour le `referral_code` dans `affiliate_tracking` :
   ```sql
   UPDATE affiliate_tracking 
   SET referral_code = '@influencer-USERNAME-1234'
   WHERE user_id = 'user-uuid-here';
   ```

   Ou dans `user_profile` :
   ```sql
   UPDATE user_profile 
   SET referral_code = '@influencer-USERNAME-1234'
   WHERE user_id = 'user-uuid-here';
   ```

## Vérification du statut

### Via l'API

```bash
GET /api/affiliate/check-influencer?userId=xxx
```

Réponse :
```json
{
  "isInfluencer": true,
  "promoterId": 123,
  "referralCode": "@influencer-username-1234",
  "message": "User is an influencer"
}
```

### Via le panneau Settings

Le panneau d'affiliation dans Settings vérifie automatiquement le statut :
- ✅ **Influenceur** : Panneau complet affiché avec toutes les stats
- ❌ **Non-influenceur** : Message d'accès refusé affiché

## Sécurité

- L'API `/api/affiliate/stats` vérifie automatiquement le statut avant de retourner les données
- Si l'utilisateur n'est pas influenceur, l'API retourne une erreur 403
- Le composant `AffiliatePanel` vérifie le statut avant d'afficher le contenu

## Migration des comptes existants

Pour convertir un compte existant en compte influenceur :

```sql
-- Option 1 : Mettre à jour le referral_code
UPDATE affiliate_tracking 
SET referral_code = '@influencer-' || SUBSTRING(referral_code FROM 2)
WHERE user_id = 'user-uuid-here';

-- Option 2 : Ajouter une note dans FirstPromoter (via API ou dashboard)
```

## Test

1. Créer un compte test dans FirstPromoter
2. Ajouter "influencer" dans la note
3. Synchroniser avec Supabase via `syncAffiliateWithSupabase()`
4. Vérifier l'accès au panneau dans Settings

## Support

Pour toute question, contacter support@noktaone.com
