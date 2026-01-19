// ============================================
// NOKTA ONE - Track Affiliate Click
// ============================================
// Fichier: app/api/affiliate/track-click/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { refCode } = await req.json();

    if (!refCode) {
      return NextResponse.json({ error: 'refCode required' }, { status: 400 });
    }

    // Récupérer l'affilié actuel pour incrémenter
    const { data: affiliate } = await supabase
      .from('affiliate_tracking')
      .select('id, clicks_count')
      .eq('referral_code', refCode)
      .single();

    if (!affiliate) {
      // Si l'affilié n'existe pas, on ne fait rien (lien invalide)
      return NextResponse.json({ success: true, message: 'Invalid referral code' });
    }

    // Incrémenter le compteur de clics
    const { error } = await supabase
      .from('affiliate_tracking')
      .update({
        clicks_count: (affiliate.clicks_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', affiliate.id);

    if (error) {
      console.error('Error tracking click:', error);
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
