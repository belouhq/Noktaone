/**
 * Stripe Service
 * Handles all Stripe operations: checkout sessions, webhooks, customer portal
 */

import Stripe from 'stripe';
import type { SupportedCurrency } from '@/lib/paywall/types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || '',
  annual: process.env.STRIPE_PRICE_ANNUAL || '',
};

export interface InfluencerCodeData {
  code: string;
  influencerName: string;
  influencerId: string;
  tier: string;
  discountPercent: number;
  commissionPercent: number;
  isActive: boolean;
  validUntil: Date | null;
  usageCount: number;
  maxUsage: number | null;
}

export interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  plan: 'monthly' | 'annual';
  locale: string;
  influencerCode?: InfluencerCodeData | null;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const { userId, email, plan, locale, influencerCode } = params;

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${plan}`);
  }

  // Calculate price with influencer discount if applicable
  let priceData: Stripe.Checkout.SessionCreateParams.LineItem = {
    price: priceId,
    quantity: 1,
  };

  // Apply influencer discount if provided and valid
  if (influencerCode && influencerCode.isActive && influencerCode.discountPercent > 0) {
    // Check if discount is still valid
    if (influencerCode.validUntil && influencerCode.validUntil < new Date()) {
      console.warn('Influencer code expired:', influencerCode.code);
    } else if (influencerCode.maxUsage && influencerCode.usageCount >= influencerCode.maxUsage) {
      console.warn('Influencer code max usage reached:', influencerCode.code);
    } else {
      // Create a coupon for the discount
      const couponId = `influencer_${influencerCode.code.toLowerCase()}`;
      
      // Try to create or retrieve coupon
      try {
        await stripe.coupons.retrieve(couponId);
      } catch {
        // Coupon doesn't exist, create it
        await stripe.coupons.create({
          id: couponId,
          percent_off: influencerCode.discountPercent,
          duration: 'once', // One-time discount
          name: `Influencer: ${influencerCode.influencerName}`,
        });
      }

      priceData = {
        ...priceData,
        discounts: [{ coupon: couponId }],
      };
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    client_reference_id: userId,
    mode: 'subscription',
    line_items: [priceData],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/subscription?canceled=true`,
    locale: locale === 'fr' ? 'fr' : 'en',
    metadata: {
      userId,
      plan,
      influencerCode: influencerCode?.code || '',
      influencerId: influencerCode?.influencerId || '',
    },
    subscription_data: {
      metadata: {
        userId,
        plan,
        influencerCode: influencerCode?.code || '',
      },
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Create a Customer Portal Session
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Handle webhook events
 */
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<{ action: string; data: any }> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customerId = subscription.customer as string;
      
      // Extract metadata
      const userId = session.metadata?.userId || session.client_reference_id || '';
      const plan = session.metadata?.plan || 'monthly';
      const influencerCode = session.metadata?.influencerCode || null;

      return {
        action: 'subscription_created',
        data: {
          userId,
          customerId,
          subscriptionId,
          plan,
          influencerCode,
        },
      };
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Get user ID from customer metadata or subscription metadata
      const userId = subscription.metadata?.userId || '';

      return {
        action: 'subscription_updated',
        data: {
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          userId,
        },
      };
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId || '';

      return {
        action: 'subscription_canceled',
        data: {
          subscriptionId: subscription.id,
          userId,
        },
      };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;
      
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.userId || '';

        return {
          action: 'payment_failed',
          data: {
            subscriptionId,
            attemptCount: invoice.attempt_count,
            userId,
          },
        };
      }

      return { action: 'payment_failed', data: {} };
    }

    default:
      return { action: 'unknown', data: {} };
  }
}
