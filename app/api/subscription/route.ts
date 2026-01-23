// ============================================
// /api/subscription/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-helpers';
import { getSubscription } from '@/lib/services/stripe';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Récupérer le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        subscription_status,
        subscription_plan,
        subscription_end_date,
        trial_start_date,
        trial_end_date,
        stripe_subscription_id,
        influencer_code,
        influencer_discount_end_date
      `)
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    // Calculer les détails
    let subscription = {
      status: profile.subscription_status || 'free',
      plan: profile.subscription_plan,
      currentPeriodStart: null as Date | null,
      currentPeriodEnd: profile.subscription_end_date ? new Date(profile.subscription_end_date) : null,
      cancelAtPeriodEnd: false,
      trialDaysRemaining: null as number | null,
      influencerDiscount: null as any,
    };
    
    // Si abonnement Stripe actif, récupérer les détails
    if (profile.stripe_subscription_id) {
      try {
        const stripeSubscription = await getSubscription(profile.stripe_subscription_id);
        subscription = {
          ...subscription,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        };
      } catch {
        // Subscription not found in Stripe
      }
    }
    
    // Calculer les jours de trial restants
    if (profile.subscription_status === 'trial' && profile.trial_end_date) {
      const now = new Date();
      const trialEnd = new Date(profile.trial_end_date);
      const diffTime = trialEnd.getTime() - now.getTime();
      subscription.trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    
    // Récupérer la réduction influenceur si active
    if (profile.influencer_code && profile.influencer_discount_end_date) {
      const discountEnd = new Date(profile.influencer_discount_end_date);
      if (discountEnd > new Date()) {
        const { data: influencer } = await supabase
          .from('influencer_codes')
          .select('code, influencer_name, discount_percent')
          .eq('code', profile.influencer_code)
          .single();
        
        if (influencer) {
          subscription.influencerDiscount = {
            code: influencer.code,
            influencerName: influencer.influencer_name,
            percent: influencer.discount_percent,
            expiresAt: discountEnd,
          };
        }
      }
    }
    
    const canAccessPremium = ['active', 'trial', 'past_due'].includes(subscription.status);
    
    return NextResponse.json({
      subscription,
      canAccessPremium,
      daysUntilExpiry: subscription.trialDaysRemaining,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
