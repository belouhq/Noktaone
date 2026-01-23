// ============================================
// /api/stripe/webhook/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server-helpers';
import { verifyWebhookSignature, handleWebhookEvent } from '@/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }
    
    // Vérifier la signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    // Traiter l'événement
    const { action, data } = await handleWebhookEvent(event);
    
    // Mettre à jour la base de données
    const supabase = createAdminClient();
    
    switch (action) {
      case 'subscription_created': {
        const { userId, customerId, subscriptionId, plan, influencerCode } = data as any;
        
        // Mettre à jour le profil utilisateur
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_plan: plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            trial_end_date: null, // Plus en trial
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        
        // Tracker la conversion influenceur
        if (influencerCode) {
          // Incrémenter le compteur d'usage
          await supabase.rpc('increment_influencer_usage', { code: influencerCode });
          
          // Enregistrer la conversion
          await supabase.from('influencer_conversions').insert({
            user_id: userId,
            influencer_code: influencerCode,
            subscription_id: subscriptionId,
            plan,
            converted_at: new Date().toISOString(),
          });
        }
        
        // Analytics
        await supabase.from('analytics_events').insert({
          user_id: userId,
          event_type: 'subscription_started',
          properties: { plan, influencerCode, subscriptionId },
        });
        
        break;
      }
      
      case 'subscription_updated': {
        const { subscriptionId, status, currentPeriodEnd, cancelAtPeriodEnd, userId } = data as any;
        
        let subscriptionStatus = 'active';
        if (status === 'past_due') subscriptionStatus = 'past_due';
        if (status === 'canceled' || status === 'unpaid') subscriptionStatus = 'expired';
        if (cancelAtPeriodEnd) subscriptionStatus = 'canceled';
        
        await supabase
          .from('profiles')
          .update({
            subscription_status: subscriptionStatus,
            subscription_end_date: currentPeriodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        break;
      }
      
      case 'subscription_canceled': {
        const { subscriptionId, userId } = data as any;
        
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'expired',
            subscription_plan: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        // Analytics
        await supabase.from('analytics_events').insert({
          user_id: userId,
          event_type: 'churn',
          properties: { subscriptionId },
        });
        
        break;
      }
      
      case 'payment_failed': {
        const { subscriptionId, attemptCount } = data as any;
        
        // Mettre à jour le statut
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        // TODO: Envoyer une notification via OneSignal
        
        break;
      }
    }
    
    return NextResponse.json({ received: true, action });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
