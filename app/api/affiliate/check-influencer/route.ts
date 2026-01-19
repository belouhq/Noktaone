// ============================================
// NOKTA ONE - Check Influencer Status
// ============================================
// Fichier: app/api/affiliate/check-influencer/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { firstPromoterService } from '@/lib/services/firstpromoter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Vérifier dans Supabase si l'utilisateur a un profil affilié
    const { data: affiliate } = await supabase
      .from('affiliate_tracking')
      .select('firstpromoter_id, referral_code')
      .eq('user_id', userId)
      .single();

    if (!affiliate || !affiliate.firstpromoter_id) {
      return NextResponse.json({ 
        isInfluencer: false, 
        message: 'No FirstPromoter account found' 
      });
    }

    // Vérifier dans FirstPromoter si c'est un influenceur
    try {
      const promoter = await firstPromoterService.getPromoter({ 
        custId: userId 
      });

      if (!promoter) {
        return NextResponse.json({ 
          isInfluencer: false, 
          message: 'Promoter not found in FirstPromoter' 
        });
      }

      // Vérifier si c'est un influenceur
      // Critères : 
      // 1. Tag "influencer" dans les tags
      // 2. Note contient "influencer"
      // 3. Campaign spéciale "influencer"
      const isInfluencer = 
        promoter.note?.toLowerCase().includes('influencer') ||
        promoter.promotions?.some(p => 
          p.campaign?.name?.toLowerCase().includes('influencer')
        ) ||
        // Vérifier dans les tags (si FirstPromoter expose les tags)
        false; // À adapter selon l'API FirstPromoter

      // Alternative : vérifier dans Supabase si un flag est défini
      const { data: profile } = await supabase
        .from('user_profile')
        .select('referral_code')
        .eq('user_id', userId)
        .single();

      // Si le referral_code commence par un préfixe spécial (ex: @influencer-)
      const hasInfluencerCode = profile?.referral_code?.startsWith('@influencer-') ||
                                 profile?.referral_code?.startsWith('@influ-') ||
                                 affiliate.referral_code?.startsWith('@influencer-') ||
                                 affiliate.referral_code?.startsWith('@influ-');

      const finalIsInfluencer = isInfluencer || hasInfluencerCode;

      return NextResponse.json({
        isInfluencer: finalIsInfluencer,
        promoterId: promoter.id,
        referralCode: affiliate.referral_code,
        message: finalIsInfluencer 
          ? 'User is an influencer' 
          : 'User is not an influencer'
      });

    } catch (error) {
      console.error('Error checking influencer status:', error);
      return NextResponse.json({ 
        isInfluencer: false, 
        message: 'Error checking FirstPromoter status' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Check influencer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
