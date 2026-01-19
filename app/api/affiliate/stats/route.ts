// ============================================
// NOKTA ONE - Affiliate Stats API v2
// ============================================
// Fichier: app/api/affiliate/stats/route.ts
// Basé sur le pricing réel: $7/mois/abonné, cap 12 mois
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CONSTANTS
// ============================================

const COMMISSION_PER_MONTH = 7; // $7/mois/abonné
const COMMISSION_CAP_MONTHS = 12; // Max 12 mois
const MAX_PER_USER = 84; // $84 max/utilisateur

// Tiers influenceurs
const INFLUENCER_TIERS = {
  nano: { discount: 30, userPrice: 13.29 },
  micro: { discount: 25, userPrice: 14.24 },
  mid: { discount: 20, userPrice: 15.19 },
} as const;

// ============================================
// SUPABASE CLIENT
// ============================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// GET - Récupérer les stats affilié
// ============================================

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Récupérer le profil affilié
    const { data: affiliate, error } = await supabase
      .from('affiliate_tracking')
      .select(`
        *,
        conversions:affiliate_conversions(
          id,
          converted_user_id,
          conversion_type,
          commission_amount,
          status,
          subscription_months,
          created_at
        )
      `)
      .eq('user_id', userId)
      .single();

    // Si pas encore affilié, créer le profil
    if (error || !affiliate) {
      return await createNewAffiliate(userId);
    }

    // Calculer les stats
    const stats = calculateAffiliateStats(affiliate);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Affiliate stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// HELPER: Créer un nouvel affilié
// ============================================

async function createNewAffiliate(userId: string) {
  // Récupérer le username pour le code
  const { data: profile } = await supabase
    .from('user_profile')
    .select('username, first_name')
    .eq('user_id', userId)
    .single();

  // Générer le code
  const baseName = profile?.username || profile?.first_name || userId.slice(0, 6);
  const cleanName = baseName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
  const referralCode = `NOKTA${cleanName}`;

  // Créer l'entrée
  const { data: newAffiliate, error } = await supabase
    .from('affiliate_tracking')
    .insert({
      user_id: userId,
      referral_code: referralCode,
      referral_link: `https://noktaone.com/?ref=${referralCode}`,
      affiliate_tier: 'nano', // Par défaut: 30% discount
      commission_rate: COMMISSION_PER_MONTH,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating affiliate:', error);
    return NextResponse.json({ error: 'Failed to create affiliate' }, { status: 500 });
  }

  // Retourner les stats initiales
  return NextResponse.json({
    referralCode: newAffiliate.referral_code,
    referralLink: newAffiliate.referral_link,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    monthlyEarnings: 0,
    totalClicks: 0,
    totalSignups: 0,
    activeSubscribers: 0,
    influencerTier: 'nano',
    projectedMonthly: 0,
  });
}

// ============================================
// HELPER: Calculer les stats affilié
// ============================================

function calculateAffiliateStats(affiliate: any) {
  const conversions = affiliate.conversions || [];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filtrer les conversions payées
  const paidConversions = conversions.filter(
    (c: any) => c.conversion_type === 'paid' && ['approved', 'paid'].includes(c.status)
  );

  // Abonnés actifs (moins de 12 mois depuis leur conversion)
  const activeSubscribers = paidConversions.filter((c: any) => {
    const conversionDate = new Date(c.created_at);
    const monthsSince = monthsDifference(conversionDate, now);
    return monthsSince < COMMISSION_CAP_MONTHS;
  });

  // Revenus ce mois
  const monthlyConversions = paidConversions.filter(
    (c: any) => new Date(c.created_at) >= startOfMonth
  );
  const monthlyEarnings = monthlyConversions.reduce(
    (sum: number, c: any) => sum + (c.commission_amount || COMMISSION_PER_MONTH),
    0
  );

  // Revenus récurrents projetés (abonnés actifs × $7)
  const projectedMonthly = activeSubscribers.length * COMMISSION_PER_MONTH;

  // Revenus en attente
  const pendingConversions = conversions.filter(
    (c: any) => c.status === 'pending'
  );
  const pendingEarnings = pendingConversions.reduce(
    (sum: number, c: any) => sum + (c.commission_amount || COMMISSION_PER_MONTH),
    0
  );

  return {
    referralCode: affiliate.referral_code,
    referralLink: affiliate.referral_link || `https://noktaone.com/?ref=${affiliate.referral_code}`,
    totalEarnings: affiliate.total_commission_earned || 0,
    pendingEarnings,
    paidEarnings: affiliate.commission_paid || 0,
    monthlyEarnings,
    totalClicks: affiliate.clicks_count || 0,
    totalSignups: affiliate.signups_count || 0,
    activeSubscribers: activeSubscribers.length,
    influencerTier: affiliate.affiliate_tier || 'nano',
    projectedMonthly,
  };
}

// ============================================
// HELPER: Calculer la différence en mois
// ============================================

function monthsDifference(date1: Date, date2: Date): number {
  return (
    (date2.getFullYear() - date1.getFullYear()) * 12 +
    (date2.getMonth() - date1.getMonth())
  );
}

// ============================================
// POST - Tracker un clic sur le lien
// ============================================

export async function POST(req: NextRequest) {
  try {
    const { refCode, action } = await req.json();

    if (!refCode) {
      return NextResponse.json({ error: 'refCode required' }, { status: 400 });
    }

    // Trouver l'affilié
    const { data: affiliate } = await supabase
      .from('affiliate_tracking')
      .select('id, clicks_count')
      .eq('referral_code', refCode)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    // Action: click (par défaut)
    if (!action || action === 'click') {
      await supabase
        .from('affiliate_tracking')
        .update({
          clicks_count: (affiliate.clicks_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', affiliate.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Track action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
