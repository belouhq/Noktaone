#!/usr/bin/env node
/**
 * NOKTA Stripe setup script (multi-currency pricing)
 *
 * Creates (or reuses) product + monthly/annual prices for each currency in the pricing grid
 * and prints env vars (STRIPE_PRICE_MONTHLY_USD, STRIPE_PRICE_ANNUAL_EUR, ...).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup-pricing.js
 */

const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is missing. Set it in .env.local before running this script.');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'IDR', 'VND', 'HUF', 'TWD']);

const PRICING = [
  // Tier 1
  { currency: 'USD', monthly: 18.99, annual: 169, savings: 26, displayMonthly: '$18.99', displayAnnual: '$169' },
  { currency: 'EUR', monthly: 18.99, annual: 169, savings: 26, displayMonthly: '18,99 €', displayAnnual: '169 €' },
  { currency: 'GBP', monthly: 15.99, annual: 139, savings: 28, displayMonthly: '£15.99', displayAnnual: '£139' },

  // Tier 2
  { currency: 'CAD', monthly: 25.99, annual: 229, savings: 27, displayMonthly: 'CA$25.99', displayAnnual: 'CA$229' },
  { currency: 'AUD', monthly: 29.99, annual: 269, savings: 25, displayMonthly: 'A$29.99', displayAnnual: 'A$269' },
  { currency: 'CHF', monthly: 17.9, annual: 159, savings: 26, displayMonthly: 'CHF 17.90', displayAnnual: 'CHF 159' },

  // Tier 3
  { currency: 'JPY', monthly: 2900, annual: 25900, savings: 26, displayMonthly: '¥2,900', displayAnnual: '¥25,900' },
  { currency: 'CNY', monthly: 138, annual: 1199, savings: 28, displayMonthly: '¥138', displayAnnual: '¥1,199' },
  { currency: 'HKD', monthly: 148, annual: 1299, savings: 27, displayMonthly: 'HK$148', displayAnnual: 'HK$1,299' },
  { currency: 'SGD', monthly: 25.9, annual: 229, savings: 26, displayMonthly: 'S$25.90', displayAnnual: 'S$229' },
  { currency: 'KRW', monthly: 25900, annual: 229000, savings: 26, displayMonthly: '₩25,900', displayAnnual: '₩229,000' },
  { currency: 'INR', monthly: 1599, annual: 13999, savings: 27, displayMonthly: '₹1,599', displayAnnual: '₹13,999' },

  // Tier 4
  { currency: 'BRL', monthly: 99.9, annual: 899, savings: 25, displayMonthly: 'R$99,90', displayAnnual: 'R$899' },
  { currency: 'MXN', monthly: 349, annual: 2999, savings: 28, displayMonthly: 'MX$349', displayAnnual: 'MX$2,999' },

  // Tier 5
  { currency: 'SEK', monthly: 199, annual: 1749, savings: 27, displayMonthly: '199 kr', displayAnnual: '1 749 kr' },
  { currency: 'NOK', monthly: 199, annual: 1749, savings: 27, displayMonthly: '199 kr', displayAnnual: '1 749 kr' },
  { currency: 'DKK', monthly: 139, annual: 1199, savings: 28, displayMonthly: '139 kr', displayAnnual: '1 199 kr' },
  { currency: 'PLN', monthly: 79.99, annual: 699, savings: 27, displayMonthly: '79,99 zł', displayAnnual: '699 zł' },
  { currency: 'CZK', monthly: 449, annual: 3999, savings: 26, displayMonthly: '449 Kč', displayAnnual: '3 999 Kč' },

  // Tier 6
  { currency: 'AED', monthly: 69.99, annual: 619, savings: 26, displayMonthly: 'AED 69.99', displayAnnual: 'AED 619' },
  { currency: 'ILS', monthly: 69.9, annual: 619, savings: 26, displayMonthly: '₪69.90', displayAnnual: '₪619' },
  { currency: 'ZAR', monthly: 349, annual: 2999, savings: 28, displayMonthly: 'R349', displayAnnual: 'R2,999' },

  // Tier 7
  { currency: 'TRY', monthly: 599, annual: 5299, savings: 26, displayMonthly: '₺599', displayAnnual: '₺5,299' },
  { currency: 'THB', monthly: 649, annual: 5799, savings: 26, displayMonthly: '฿649', displayAnnual: '฿5,799' },
  { currency: 'PHP', monthly: 1099, annual: 9499, savings: 28, displayMonthly: '₱1,099', displayAnnual: '₱9,499' },
  { currency: 'IDR', monthly: 299000, annual: 2599000, savings: 28, displayMonthly: 'Rp299.000', displayAnnual: 'Rp2.599.000' },
  { currency: 'MYR', monthly: 89.9, annual: 799, savings: 26, displayMonthly: 'RM89.90', displayAnnual: 'RM799' },
  { currency: 'VND', monthly: 479000, annual: 4199000, savings: 27, displayMonthly: '479.000₫', displayAnnual: '4.199.000₫' },

  // Tier 8
  { currency: 'NZD', monthly: 32.99, annual: 289, savings: 27, displayMonthly: 'NZ$32.99', displayAnnual: 'NZ$289' },
  { currency: 'TWD', monthly: 599, annual: 5299, savings: 26, displayMonthly: 'NT$599', displayAnnual: 'NT$5,299' },
  { currency: 'HUF', monthly: 6990, annual: 61900, savings: 26, displayMonthly: '6 990 Ft', displayAnnual: '61 900 Ft' },
  { currency: 'RON', monthly: 89.9, annual: 799, savings: 26, displayMonthly: '89,90 lei', displayAnnual: '799 lei' },
];

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
  trial_days: 10,
};

function toUnitAmount(currency, value) {
  if (ZERO_DECIMAL.has(currency)) {
    return Math.round(value);
  }
  return Math.round(value * 100);
}

async function findOrCreateProduct() {
  const existing = await stripe.products.list({ limit: 100 });
  const found = existing.data.find((p) => p.metadata?.app === 'nokta_one' && p.metadata?.tier === 'premium');
  if (found) return found;
  return await stripe.products.create(NOKTA_CONFIG.product);
}

async function findOrCreatePrice({ productId, currency, interval, unitAmount, metadata }) {
  const existingPrices = await stripe.prices.list({ product: productId, limit: 100 });

  const found = existingPrices.data.find(
    (p) =>
      p.active &&
      p.currency?.toUpperCase() === currency &&
      p.recurring?.interval === interval &&
      p.unit_amount === unitAmount
  );

  if (found) return found;

  return await stripe.prices.create({
    product: productId,
    currency: currency.toLowerCase(),
    unit_amount: unitAmount,
    recurring: { interval },
    metadata,
  });
}

async function setup() {
  console.log('Setting up Stripe multi-currency pricing for Nokta One...\n');

  const product = await findOrCreateProduct();
  console.log(`Product: ${product.id}`);

  const created = {
    productId: product.id,
    monthly: {},
    annual: {},
  };

  for (const row of PRICING) {
    const currency = row.currency;
    const monthlyAmount = toUnitAmount(currency, row.monthly);
    const annualAmount = toUnitAmount(currency, row.annual);

    const monthlyPrice = await findOrCreatePrice({
      productId: product.id,
      currency,
      interval: 'month',
      unitAmount: monthlyAmount,
      metadata: {
        plan_type: 'monthly',
        currency,
        display: row.displayMonthly,
      },
    });

    const annualPrice = await findOrCreatePrice({
      productId: product.id,
      currency,
      interval: 'year',
      unitAmount: annualAmount,
      metadata: {
        plan_type: 'annual',
        currency,
        display: row.displayAnnual,
        savings_percent: String(row.savings),
      },
    });

    created.monthly[currency] = monthlyPrice.id;
    created.annual[currency] = annualPrice.id;
  }

  console.log('\n' + '='.repeat(72));
  console.log('Add these to your .env.local:');
  console.log('='.repeat(72));

  // Keep the "default" env vars (USD) for backward compatibility.
  const usdMonthly = created.monthly.USD || '';
  const usdAnnual = created.annual.USD || '';

  console.log(`STRIPE_PRODUCT_PREMIUM=${created.productId}`);
  console.log(`STRIPE_PRICE_MONTHLY=${usdMonthly}  # USD default`);
  console.log(`STRIPE_PRICE_ANNUAL=${usdAnnual}   # USD default`);
  console.log(`STRIPE_TRIAL_DAYS=${NOKTA_CONFIG.trial_days}`);
  console.log('');

  for (const row of PRICING) {
    const c = row.currency;
    console.log(`STRIPE_PRICE_MONTHLY_${c}=${created.monthly[c]}`);
    console.log(`STRIPE_PRICE_ANNUAL_${c}=${created.annual[c]}`);
  }

  console.log('='.repeat(72));
  console.log('Next steps:');
  console.log('- Configure webhooks and set STRIPE_WEBHOOK_SECRET');
  console.log('- Test checkout in USD / EUR / GBP');

  return created;
}

if (require.main === module) {
  setup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Setup failed:', err?.message || err);
      process.exit(1);
    });
}

module.exports = { setup };

