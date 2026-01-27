// ============================================
// NOKTA STRIPE WEBHOOK API ROUTE
// Path: app/api/stripe/webhook/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Initialize Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Relevant events to handle
const RELEVANT_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Only process relevant events
  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, processed: false });
  }

  console.log(`📩 Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error(`Error processing ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ========================
// EVENT HANDLERS
// ========================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout completed:', session.id);

  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error('No user_id in checkout session metadata');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Update user profile
  await supabaseAdmin
    .from('profiles')
    .update({
      is_premium: true,
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      subscription_plan: session.metadata?.plan || 'monthly',
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      trial_used: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log(`✅ User ${userId} upgraded to premium`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id, subscription.status);

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    // Try to find user by customer ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!profile) {
      console.error('Could not find user for subscription:', subscription.id);
      return;
    }

    await updateUserSubscription(profile.id, subscription);
  } else {
    await updateUserSubscription(userId, subscription);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);

  const userId = subscription.metadata?.user_id;
  
  // Find user
  let targetUserId = userId;
  if (!targetUserId) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!profile) {
      console.error('Could not find user for deleted subscription');
      return;
    }
    targetUserId = profile.id;
  }

  // Downgrade to free
  await supabaseAdmin
    .from('profiles')
    .update({
      is_premium: false,
      subscription_status: 'canceled',
      subscription_current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetUserId);

  console.log(`✅ User ${targetUserId} downgraded to free`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded:', invoice.id);

  // Only process subscription invoices
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // Update period end
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('⚠️ Payment failed:', invoice.id);

  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // Update status to past_due
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // TODO: Send notification to user about payment failure
  console.log(`⚠️ User ${userId} payment failed - status: past_due`);
}

// ========================
// HELPER FUNCTIONS
// ========================

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  const isPremium = ['active', 'trialing'].includes(subscription.status);

  // Get plan from price metadata or subscription metadata
  const priceId = subscription.items.data[0]?.price.id;
  const plan = subscription.metadata?.plan || 
    (priceId === process.env.STRIPE_PRICE_ANNUAL ? 'annual' : 'monthly');

  await supabaseAdmin
    .from('profiles')
    .update({
      is_premium: isPremium,
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      subscription_plan: plan,
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log(`✅ User ${userId} subscription updated: ${subscription.status}`);
}
