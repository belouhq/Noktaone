#!/usr/bin/env node
// ============================================
// NOKTA STRIPE SETUP SCRIPT
// Run: node scripts/stripe-setup.js
// ============================================

const Stripe = require('stripe');

// Use environment variable or fallback to test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51SKjgjAMF4ixGcvos4ECGHN3G2OFdU2VaBDj5lWybrfmH4vokgDqYtomvVgmiDBc3OoXoTzb2XR4Dk7infsxT48z00NK9fSX09');

const NOKTA_CONFIG = {
  product: {
    name: 'Nokta One Premium',
    description: 'Accès illimité à Nokta One - Body Reset System. Skanes illimités, historique complet, insights personnalisés.',
    metadata: {
      app: 'nokta_one',
      tier: 'premium',
    },
  },
  prices: {
    monthly: {
      unit_amount: 1899, // €18.99 in cents
      currency: 'eur',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      metadata: {
        plan_type: 'monthly',
        display_name: 'Premium Mensuel',
      },
    },
    annual: {
      unit_amount: 18999, // €189.99 in cents (save ~17%)
      currency: 'eur',
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
      metadata: {
        plan_type: 'annual',
        display_name: 'Premium Annuel',
        savings_percent: '17',
      },
    },
  },
  trial_days: 10,
};

async function setup() {
  console.log('🚀 Setting up Stripe for Nokta One...\n');

  try {
    // ========================
    // Step 1: Check existing products
    // ========================
    console.log('📦 Checking for existing Nokta product...');
    const existingProducts = await stripe.products.list({
      limit: 100,
    });

    let product = existingProducts.data.find(
      (p) => p.metadata?.app === 'nokta_one' && p.metadata?.tier === 'premium'
    );

    if (product) {
      console.log(`   ✓ Found existing product: ${product.id}`);
    } else {
      // Create new product
      console.log('   Creating new product...');
      product = await stripe.products.create(NOKTA_CONFIG.product);
      console.log(`   ✓ Created product: ${product.id}`);
    }

    // ========================
    // Step 2: Check/Create Monthly Price
    // ========================
    console.log('\n💰 Setting up Monthly price (€18.99/month)...');
    const existingPrices = await stripe.prices.list({
      product: product.id,
      limit: 100,
    });

    let monthlyPrice = existingPrices.data.find(
      (p) =>
        p.recurring?.interval === 'month' &&
        p.unit_amount === NOKTA_CONFIG.prices.monthly.unit_amount &&
        p.active
    );

    if (monthlyPrice) {
      console.log(`   ✓ Found existing monthly price: ${monthlyPrice.id}`);
    } else {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        ...NOKTA_CONFIG.prices.monthly,
      });
      console.log(`   ✓ Created monthly price: ${monthlyPrice.id}`);
    }

    // ========================
    // Step 3: Check/Create Annual Price
    // ========================
    console.log('\n💰 Setting up Annual price (€189.99/year)...');
    let annualPrice = existingPrices.data.find(
      (p) =>
        p.recurring?.interval === 'year' &&
        p.unit_amount === NOKTA_CONFIG.prices.annual.unit_amount &&
        p.active
    );

    if (annualPrice) {
      console.log(`   ✓ Found existing annual price: ${annualPrice.id}`);
    } else {
      annualPrice = await stripe.prices.create({
        product: product.id,
        ...NOKTA_CONFIG.prices.annual,
      });
      console.log(`   ✓ Created annual price: ${annualPrice.id}`);
    }

    // ========================
    // Step 4: Create Customer Portal Configuration
    // ========================
    console.log('\n🔧 Setting up Customer Portal...');
    try {
      const portalConfig = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: 'Nokta One - Gérer ton abonnement',
        },
        features: {
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            cancellation_reason: {
              enabled: true,
              options: [
                'too_expensive',
                'missing_features',
                'switched_service',
                'unused',
                'other',
              ],
            },
          },
          subscription_pause: {
            enabled: false,
          },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ['price'],
            proration_behavior: 'create_prorations',
            products: [
              {
                product: product.id,
                prices: [monthlyPrice.id, annualPrice.id],
              },
            ],
          },
          payment_method_update: {
            enabled: true,
          },
          invoice_history: {
            enabled: true,
          },
        },
      });
      console.log(`   ✓ Created portal configuration: ${portalConfig.id}`);
    } catch (err) {
      if (err.code === 'resource_already_exists') {
        console.log('   ✓ Portal configuration already exists');
      } else {
        console.log(`   ⚠ Portal setup skipped: ${err.message}`);
      }
    }

    // ========================
    // Step 5: Output Environment Variables
    // ========================
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETE! Add these to your .env.local:');
    console.log('='.repeat(60));
    console.log(`
# Stripe Product & Prices (generated ${new Date().toISOString()})
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
1. Copy the env variables above to your .env.local
2. Set up webhook endpoint in Stripe Dashboard:
   - URL: https://your-domain.com/api/stripe/webhook
   - Events: checkout.session.completed, customer.subscription.updated,
             customer.subscription.deleted, invoice.payment_failed
3. Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET
4. Test with Stripe CLI:
   stripe listen --forward-to localhost:3000/api/stripe/webhook
`);

    return {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      annualPriceId: annualPrice.id,
    };
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setup()
    .then((result) => {
      console.log('\n🎉 Done! IDs:', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { setup, NOKTA_CONFIG };
