// ============================================
// /api/stripe/create-checkout/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-helpers';
import { createCheckoutSession } from '@/lib/services/stripe';
import type { SupportedLocale, SubscriptionPlan } from '@/types/subscription';

interface CreateCheckoutBody {
  plan: SubscriptionPlan;
  locale: SupportedLocale;
  influencerCode?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parser le body
    const body: CreateCheckoutBody = await request.json();
    const { plan, locale, influencerCode } = body;
    
    // Valider les paramètres
    if (!plan || !['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }
    
    // Récupérer le code influenceur si fourni
    let influencerData = null;
    if (influencerCode) {
      const { data } = await supabase
        .from('influencer_codes')
        .select('*')
        .eq('code', influencerCode.toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (data) {
        influencerData = {
          code: data.code,
          influencerName: data.influencer_name,
          influencerId: data.influencer_id,
          tier: data.tier,
          discountPercent: data.discount_percent,
          commissionPercent: data.commission_percent,
          isActive: data.is_active,
          validUntil: data.valid_until ? new Date(data.valid_until) : null,
          usageCount: data.usage_count,
          maxUsage: data.max_usage,
        };
      }
    }
    
    // Créer la session Stripe
    const { sessionId, url } = await createCheckoutSession({
      userId: user.id,
      email: user.email!,
      plan,
      locale: locale || 'fr',
      influencerCode: influencerData,
    });
    
    // Logger l'événement
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'checkout_started',
      properties: {
        plan,
        locale,
        influencerCode: influencerCode || null,
        sessionId,
      },
    });
    
    return NextResponse.json({ sessionId, url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
