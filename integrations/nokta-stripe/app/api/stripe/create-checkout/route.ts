// ============================================
// NOKTA STRIPE CHECKOUT API ROUTE
// Path: app/api/stripe/create-checkout/route.ts
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

// Price IDs from environment
const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
};

const TRIAL_DAYS = parseInt(process.env.STRIPE_TRIAL_DAYS || '10', 10);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface CheckoutRequest {
  plan: 'monthly' | 'annual';
  userId: string;
  email: string;
  locale?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { plan, userId, email, locale = 'fr' } = body;

    // Validate plan
    if (!['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "monthly" or "annual".' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email' },
        { status: 400 }
      );
    }

    const priceId = PRICES[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    // Check if user already has a Stripe customer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, trial_used')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: userId,
          app: 'nokta_one',
        },
      });
      customerId = customer.id;

      // Store customer ID in Supabase
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Determine if user gets trial (only if not used before)
    const hasUsedTrial = profile?.trial_used === true;

    // Create Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/subscription/cancel`,
      locale: locale as Stripe.Checkout.SessionCreateParams.Locale,
      metadata: {
        user_id: userId,
        plan,
        app: 'nokta_one',
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan,
          app: 'nokta_one',
        },
      },
      // Billing address collection
      billing_address_collection: 'auto',
      // Allow promotion codes
      allow_promotion_codes: true,
      // Tax collection (if configured in Stripe)
      automatic_tax: {
        enabled: true,
      },
    };

    // Add trial if user hasn't used it
    if (!hasUsedTrial) {
      sessionConfig.subscription_data!.trial_period_days = TRIAL_DAYS;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET method to retrieve session status (for success page)
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    return NextResponse.json({
      status: session.status,
      customerEmail: session.customer_details?.email,
      subscriptionId: (session.subscription as Stripe.Subscription)?.id,
      plan: session.metadata?.plan,
    });
  } catch (error) {
    console.error('Stripe Session Retrieve Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
