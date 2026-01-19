import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { event, data } = payload;

    console.log('FirstPromoter webhook:', event, data);

    switch (event) {
      case 'new_referral':
        // Un nouveau signup via lien affilié
        await handleNewReferral(data);
        break;

      case 'referral_converted':
        // Le referral a payé
        await handleReferralConverted(data);
        break;

      case 'reward_created':
        // Commission créée
        await handleRewardCreated(data);
        break;

      case 'reward_approved':
        // Commission approuvée
        await handleRewardApproved(data);
        break;

      case 'payout_created':
        // Paiement envoyé à l'affilié
        await handlePayoutCreated(data);
        break;

      default:
        console.log('Unhandled FirstPromoter event:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('FirstPromoter webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

async function handleNewReferral(data: any) {
  const { promoter_id, referral_id, email } = data;

  // Trouver l'affilié
  const { data: affiliate } = await supabase
    .from('affiliate_tracking')
    .select('id')
    .eq('firstpromoter_id', promoter_id.toString())
    .single();

  if (affiliate) {
    // Incrémenter le compteur
    await supabase.rpc('increment_affiliate_signups', { affiliate_id: affiliate.id });
  }
}

async function handleReferralConverted(data: any) {
  const { promoter_id, referral_id, amount, currency } = data;

  const { data: affiliate } = await supabase
    .from('affiliate_tracking')
    .select('id')
    .eq('firstpromoter_id', promoter_id.toString())
    .single();

  if (affiliate) {
    // Créer la conversion
    await supabase.from('affiliate_conversions').insert({
      affiliate_id: affiliate.id,
      conversion_type: 'paid',
      commission_amount: amount / 100, // FirstPromoter envoie en cents
      currency: currency || 'EUR',
      status: 'pending',
      firstpromoter_conversion_id: referral_id.toString(),
    });

    // Incrémenter le compteur
    await supabase.rpc('increment_affiliate_conversions', { affiliate_id: affiliate.id });
  }
}

async function handleRewardCreated(data: any) {
  const { promoter_id, reward_id, amount } = data;

  const { data: affiliate } = await supabase
    .from('affiliate_tracking')
    .select('id')
    .eq('firstpromoter_id', promoter_id.toString())
    .single();

  if (affiliate) {
    await supabase.from('affiliate_tracking').update({
      commission_pending: supabase.rpc('add_to_commission_pending', { 
        affiliate_id: affiliate.id, 
        amount: amount / 100 
      }),
      updated_at: new Date().toISOString(),
    }).eq('id', affiliate.id);
  }
}

async function handleRewardApproved(data: any) {
  const { promoter_id, reward_id, amount } = data;

  const { data: affiliate } = await supabase
    .from('affiliate_tracking')
    .select('id, commission_pending')
    .eq('firstpromoter_id', promoter_id.toString())
    .single();

  if (affiliate) {
    const amountInEur = amount / 100;
    await supabase.from('affiliate_tracking').update({
      total_commission_earned: supabase.rpc('add_to_total_commission', { 
        affiliate_id: affiliate.id, 
        amount: amountInEur 
      }),
      commission_pending: Math.max(0, (affiliate.commission_pending || 0) - amountInEur),
      updated_at: new Date().toISOString(),
    }).eq('id', affiliate.id);

    // Mettre à jour la conversion
    await supabase.from('affiliate_conversions').update({
      status: 'approved',
      processed_at: new Date().toISOString(),
    }).eq('firstpromoter_reward_id', reward_id.toString());
  }
}

async function handlePayoutCreated(data: any) {
  const { promoter_id, amount } = data;

  const { data: affiliate } = await supabase
    .from('affiliate_tracking')
    .select('id')
    .eq('firstpromoter_id', promoter_id.toString())
    .single();

  if (affiliate) {
    await supabase.from('affiliate_tracking').update({
      commission_paid: supabase.rpc('add_to_commission_paid', { 
        affiliate_id: affiliate.id, 
        amount: amount / 100 
      }),
      last_payout_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', affiliate.id);
  }
}
