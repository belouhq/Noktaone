import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log l'événement
    const userId = await getUserIdFromStripeEvent(event);
    await supabase.from('payment_events').insert({
      user_id: userId,
      stripe_event_id: event.id,
      event_type: event.type,
      metadata: event.data.object,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Trouver l'utilisateur
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!existingSub) {
    console.error('No user found for customer:', customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const price = subscription.items.data[0]?.price;

  await supabase.from('subscriptions').upsert({
    user_id: existingSub.user_id,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    stripe_product_id: price?.product as string,
    plan_interval: price?.recurring?.interval as any,
    plan_amount: (price?.unit_amount || 0) / 100,
    plan_currency: price?.currency,
    status: subscription.status as any,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  // Mettre à jour le plan dans user_profile
  const plan = mapStripePlanToNoktaPlan(priceId);
  await supabase.from('user_profile').update({
    plan,
    plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
  }).eq('user_id', existingSub.user_id);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await supabase.from('subscriptions').update({
    status: 'canceled',
    canceled_at: new Date().toISOString(),
    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('stripe_customer_id', customerId);

  // Downgrade le plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (sub) {
    await supabase.from('user_profile').update({
      plan: 'free',
      plan_expires_at: null,
    }).eq('user_id', sub.user_id);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (sub) {
    await supabase.from('payment_events').insert({
      user_id: sub.user_id,
      subscription_id: sub.id,
      stripe_event_id: `invoice_${invoice.id}`,
      stripe_invoice_id: invoice.id,
      event_type: 'invoice.paid',
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency,
      status: 'succeeded',
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (sub) {
    await supabase.from('payment_events').insert({
      user_id: sub.user_id,
      subscription_id: sub.id,
      stripe_event_id: `invoice_failed_${invoice.id}`,
      stripe_invoice_id: invoice.id,
      event_type: 'invoice.payment_failed',
      amount: (invoice.amount_due || 0) / 100,
      currency: invoice.currency,
      status: 'failed',
      failure_message: invoice.last_finalization_error?.message,
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Tracker la conversion si c'est un referral
  if (session.customer_email && session.amount_total) {
    const { trackReferralConversion } = await import('@/lib/services/firstpromoter');
    await trackReferralConversion(
      supabase,
      session.client_reference_id || '',
      session.customer_email,
      session.amount_total / 100,
      session.metadata?.plan || 'premium'
    );
  }
}

async function getUserIdFromStripeEvent(event: Stripe.Event): Promise<string | null> {
  const obj = event.data.object as any;
  const customerId = obj.customer;
  
  if (!customerId) return null;

  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  return data?.user_id || null;
}

function mapStripePlanToNoktaPlan(priceId: string): string {
  const mapping: Record<string, string> = {
    [process.env.STRIPE_PRICE_PREMIUM_MONTHLY!]: 'premium',
    [process.env.STRIPE_PRICE_PREMIUM_YEARLY!]: 'premium',
    [process.env.STRIPE_PRICE_PRO_MONTHLY!]: 'pro',
    [process.env.STRIPE_PRICE_PRO_YEARLY!]: 'pro',
    [process.env.STRIPE_PRICE_LIFETIME!]: 'lifetime',
  };
  return mapping[priceId] || 'premium';
}
