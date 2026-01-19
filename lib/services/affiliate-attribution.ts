// ============================================
// NOKTA ONE - Affiliate Attribution Service
// ============================================
// Fichier: lib/services/affiliate-attribution.ts
// Gère l'attribution des conversions aux affiliés
// ============================================

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONSTANTS
// ============================================

const COMMISSION_PER_MONTH = 7; // $7/mois
const DISCOUNT_DURATION_MONTHS = 3; // Réduction valable 3 mois

// ============================================
// TYPES
// ============================================

interface AttributionResult {
  success: boolean;
  affiliateId?: string;
  discountApplied?: number;
  error?: string;
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Attribuer un signup à un affilié
 * À appeler lors de l'inscription d'un nouvel utilisateur
 */
export async function attributeSignup(
  supabase: ReturnType<typeof createClient>,
  newUserId: string,
  email: string,
  refCode: string | null
): Promise<AttributionResult> {
  
  if (!refCode) {
    return { success: false, error: 'No referral code' };
  }

  try {
    // Trouver l'affilié
    const { data: affiliate, error: findError } = await supabase
      .from('affiliate_tracking')
      .select('id, user_id, affiliate_tier')
      .eq('referral_code', refCode)
      .eq('is_active', true)
      .single();

    if (findError || !affiliate) {
      console.log('Affiliate not found for code:', refCode);
      return { success: false, error: 'Affiliate not found' };
    }

    // Éviter l'auto-parrainage
    if (affiliate.user_id === newUserId) {
      return { success: false, error: 'Self-referral not allowed' };
    }

    // Créer la conversion (type: signup)
    const { error: conversionError } = await supabase
      .from('affiliate_conversions')
      .insert({
        affiliate_id: affiliate.id,
        converted_user_id: newUserId,
        conversion_type: 'signup',
        status: 'pending',
      });

    if (conversionError) {
      console.error('Error creating conversion:', conversionError);
      return { success: false, error: 'Failed to create conversion' };
    }

    // Incrémenter le compteur de signups
    const { data: currentAffiliate } = await supabase
      .from('affiliate_tracking')
      .select('signups_count')
      .eq('id', affiliate.id)
      .single();

    await supabase
      .from('affiliate_tracking')
      .update({
        signups_count: (currentAffiliate?.signups_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', affiliate.id);

    // Stocker la référence dans le profil du nouvel utilisateur
    await supabase
      .from('user_profile')
      .update({
        // On pourrait ajouter un champ referred_by_code ou referred_by_affiliate_id
      })
      .eq('user_id', newUserId);

    // Déterminer le discount à appliquer
    const discounts: Record<string, number> = {
      nano: 30,
      micro: 25,
      mid: 20,
    };
    const discountApplied = discounts[affiliate.affiliate_tier] || 30;

    return {
      success: true,
      affiliateId: affiliate.id,
      discountApplied,
    };

  } catch (error) {
    console.error('Attribution error:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Attribuer une conversion payée à un affilié
 * À appeler lors du premier paiement (webhook Stripe)
 */
export async function attributeConversion(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  paymentAmount: number,
  currency: string = 'USD'
): Promise<AttributionResult> {
  
  try {
    // Trouver la conversion signup existante pour cet utilisateur
    const { data: existingConversion, error: findError } = await supabase
      .from('affiliate_conversions')
      .select(`
        id,
        affiliate_id,
        conversion_type,
        affiliate:affiliate_tracking(id, user_id)
      `)
      .eq('converted_user_id', userId)
      .eq('conversion_type', 'signup')
      .single();

    if (findError || !existingConversion) {
      // Pas de signup attribué, pas de commission
      return { success: false, error: 'No attributed signup found' };
    }

    // Mettre à jour la conversion en "paid"
    const { error: updateError } = await supabase
      .from('affiliate_conversions')
      .update({
        conversion_type: 'paid',
        status: 'approved',
        commission_amount: COMMISSION_PER_MONTH,
        currency,
        processed_at: new Date().toISOString(),
      })
      .eq('id', existingConversion.id);

    if (updateError) {
      console.error('Error updating conversion:', updateError);
      return { success: false, error: 'Failed to update conversion' };
    }

    // Récupérer les compteurs actuels
    const { data: currentAffiliate } = await supabase
      .from('affiliate_tracking')
      .select('conversions_count, total_commission_earned, commission_pending')
      .eq('id', existingConversion.affiliate_id)
      .single();

    // Mettre à jour les compteurs de l'affilié
    await supabase
      .from('affiliate_tracking')
      .update({
        conversions_count: (currentAffiliate?.conversions_count || 0) + 1,
        total_commission_earned: (currentAffiliate?.total_commission_earned || 0) + COMMISSION_PER_MONTH,
        commission_pending: (currentAffiliate?.commission_pending || 0) + COMMISSION_PER_MONTH,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingConversion.affiliate_id);

    return {
      success: true,
      affiliateId: existingConversion.affiliate_id,
    };

  } catch (error) {
    console.error('Conversion attribution error:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Traiter les commissions mensuelles récurrentes
 * À appeler via un cron job mensuel
 */
export async function processMonthlyCommissions(
  supabase: ReturnType<typeof createClient>
): Promise<{ processed: number; errors: number }> {
  
  const now = new Date();
  let processed = 0;
  let errors = 0;

  try {
    // Récupérer toutes les conversions actives (moins de 12 mois)
    const { data: activeConversions, error } = await supabase
      .from('affiliate_conversions')
      .select(`
        id,
        affiliate_id,
        converted_user_id,
        subscription_months,
        created_at
      `)
      .eq('conversion_type', 'paid')
      .eq('status', 'approved');

    if (error || !activeConversions) {
      console.error('Error fetching conversions:', error);
      return { processed: 0, errors: 1 };
    }

    for (const conversion of activeConversions) {
      const createdAt = new Date(conversion.created_at);
      const monthsSince = monthsDifference(createdAt, now);

      // Vérifier si encore dans la période de commission (12 mois max)
      if (monthsSince >= 12) {
        // Marquer comme terminée
        await supabase
          .from('affiliate_conversions')
          .update({ status: 'completed' })
          .eq('id', conversion.id);
        continue;
      }

      // Vérifier si l'abonné est toujours actif
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', conversion.converted_user_id)
        .single();

      if (!subscription || subscription.status !== 'active') {
        continue; // Pas de commission si l'abonné a annulé
      }

      // Récupérer les compteurs actuels
      const { data: currentAffiliate } = await supabase
        .from('affiliate_tracking')
        .select('total_commission_earned, commission_pending')
        .eq('id', conversion.affiliate_id)
        .single();

      // Ajouter la commission mensuelle
      const { error: commissionError } = await supabase
        .from('affiliate_tracking')
        .update({
          total_commission_earned: (currentAffiliate?.total_commission_earned || 0) + COMMISSION_PER_MONTH,
          commission_pending: (currentAffiliate?.commission_pending || 0) + COMMISSION_PER_MONTH,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversion.affiliate_id);

      if (commissionError) {
        errors++;
      } else {
        processed++;
      }

      // Mettre à jour le compteur de mois
      await supabase
        .from('affiliate_conversions')
        .update({
          subscription_months: (conversion.subscription_months || 1) + 1,
        })
        .eq('id', conversion.id);
    }

    return { processed, errors };

  } catch (error) {
    console.error('Monthly commission processing error:', error);
    return { processed, errors: errors + 1 };
  }
}

/**
 * Annuler les commissions d'un utilisateur (refund/chargeback)
 */
export async function cancelConversion(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  
  try {
    // Trouver la conversion
    const { data: conversion } = await supabase
      .from('affiliate_conversions')
      .select('id, affiliate_id, commission_amount')
      .eq('converted_user_id', userId)
      .eq('conversion_type', 'paid')
      .single();

    if (!conversion) return;

    // Marquer comme refund
    await supabase
      .from('affiliate_conversions')
      .update({
        status: 'refunded',
        processed_at: new Date().toISOString(),
      })
      .eq('id', conversion.id);

    // Récupérer les compteurs actuels
    const { data: currentAffiliate } = await supabase
      .from('affiliate_tracking')
      .select('conversions_count, commission_pending')
      .eq('id', conversion.affiliate_id)
      .single();

    // Décrémenter les compteurs (si commission en attente)
    if (conversion.commission_amount) {
      await supabase
        .from('affiliate_tracking')
        .update({
          conversions_count: Math.max(0, (currentAffiliate?.conversions_count || 0) - 1),
          commission_pending: Math.max(0, (currentAffiliate?.commission_pending || 0) - conversion.commission_amount),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversion.affiliate_id);
    }

  } catch (error) {
    console.error('Cancel conversion error:', error);
  }
}

// ============================================
// HELPERS
// ============================================

function monthsDifference(date1: Date, date2: Date): number {
  return (
    (date2.getFullYear() - date1.getFullYear()) * 12 +
    (date2.getMonth() - date1.getMonth())
  );
}

/**
 * Obtenir le code referral depuis les cookies/localStorage côté client
 */
export function getStoredRefCode(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Priorité: localStorage > cookie
  const fromStorage = localStorage.getItem('nokta_ref');
  if (fromStorage) return fromStorage;

  // Fallback: cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'nokta_ref') return value;
  }

  return null;
}

/**
 * Calculer le prix avec réduction affilié
 */
export function calculateDiscountedPrice(
  basePrice: number,
  affiliateTier: 'nano' | 'micro' | 'mid' | null
): { price: number; discount: number } {
  
  const discounts: Record<string, number> = {
    nano: 30,
    micro: 25,
    mid: 20,
  };

  const discountPercent = affiliateTier ? discounts[affiliateTier] || 0 : 0;
  const discountedPrice = basePrice * (1 - discountPercent / 100);

  return {
    price: Math.round(discountedPrice * 100) / 100,
    discount: discountPercent,
  };
}
