#!/usr/bin/env node
/**
 * NOKTA Stripe setup script
 *
 * Creates (or reuses) product + monthly/annual prices and prints env vars.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.js
 */

const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is missing. Set it in .env.local before running this script.');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const NOKTA_CONFIG = {
  product: {
    name: 'Nokta One Premium',
    description:
      'Accès illimité à Nokta One - Body Reset System. Skanes illimités, historique complet, insights personnalisés.',
    metadata: {
      app: 'nokta_one',
      tier: 'premium',
    },
  },
  prices: {
    monthly: {
      unit_amount: 1899, // €18.99 in cents
      currency: 'eur',
      recurring: { interval: 'month', interval_count: 1 },
      metadata: { plan_type: 'monthly', display_name: 'Premium Mensuel' },
    },
    annual: {
      unit_amount: 18999, // €189.99 in cents
      currency: 'eur',
      recurring: { interval: 'year', interval_count: 1 },
      metadata: { plan_type: 'annual', display_name: 'Premium Annuel', savings_percent: '17' },
    },
  },
  trial_days: 10,
};

async function setup() {
  console.log('🚀 Setting up Stripe for Nokta One...\n');

  // Step 1: product
  console.log('📦 Checking for existing Nokta product...');
  const existingProducts = await stripe.products.list({ limit: 100 });

  let product = existingProducts.data.find(
    (p) => p.metadata?.app === 'nokta_one' && p.metadata?.tier === 'premium'
  );

  if (!product) {
    console.log('   Creating new product...');
    product = await stripe.products.create(NOKTA_CONFIG.product);
  }
  console.log(`   ✓ Product: ${product.id}`);

  // Step 2: prices
  const existingPrices = await stripe.prices.list({ product: product.id, limit: 100 });

  console.log('\n💰 Setting up Monthly price (€18.99/month)...');
  let monthlyPrice = existingPrices.data.find(
    (p) =>
      p.recurring?.interval === 'month' &&
      p.unit_amount === NOKTA_CONFIG.prices.monthly.unit_amount &&
      p.active
  );
  if (!monthlyPrice) {
    monthlyPrice = await stripe.prices.create({ product: product.id, ...NOKTA_CONFIG.prices.monthly });
  }
  console.log(`   ✓ Monthly price: ${monthlyPrice.id}`);

  console.log('\n💰 Setting up Annual price (€189.99/year)...');
  let annualPrice = existingPrices.data.find(
    (p) =>
      p.recurring?.interval === 'year' &&
      p.unit_amount === NOKTA_CONFIG.prices.annual.unit_amount &&
      p.active
  );
  if (!annualPrice) {
    annualPrice = await stripe.prices.create({ product: product.id, ...NOKTA_CONFIG.prices.annual });
  }
  console.log(`   ✓ Annual price: ${annualPrice.id}`);

  // Output env vars
  console.log('\n' + '='.repeat(60));
  console.log('✅ SETUP COMPLETE! Add these to your .env.local:');
  console.log('='.repeat(60));
  console.log(`
# Stripe Product & Prices
STRIPE_PRODUCT_PREMIUM=${product.id}
STRIPE_PRICE_MONTHLY=${monthlyPrice.id}
STRIPE_PRICE_ANNUAL=${annualPrice.id}

# Trial configuration
STRIPE_TRIAL_DAYS=${NOKTA_CONFIG.trial_days}
`);
  console.log('='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('='.repeat(60));
  console.log(`
1) Create a webhook endpoint in Stripe Dashboard:
   - URL: https://your-domain.com/api/stripe/webhook
   - Events: checkout.session.completed, customer.subscription.* , invoice.payment_*
2) Copy the webhook signing secret into:
   STRIPE_WEBHOOK_SECRET=whsec_...
3) Local test (Stripe CLI):
   stripe listen --forward-to localhost:3000/api/stripe/webhook
`);

  return { productId: product.id, monthlyPriceId: monthlyPrice.id, annualPriceId: annualPrice.id };
}

if (require.main === module) {
  setup()
    .then((result) => {
      console.log('\n🎉 Done! IDs:', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Setup failed:', err?.message || err);
      process.exit(1);
    });
}

module.exports = { setup, NOKTA_CONFIG };

