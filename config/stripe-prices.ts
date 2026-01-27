import type { SupportedCurrency } from '@/lib/paywall/types';

// Keep this list aligned with your pricing rollout.
export const SUPPORTED_STRIPE_CURRENCIES = [
  'USD', 'EUR', 'GBP',
  'CAD', 'AUD', 'CHF',
  'JPY', 'CNY', 'HKD', 'SGD', 'KRW', 'INR',
  'BRL', 'MXN',
  'SEK', 'NOK', 'DKK', 'PLN', 'CZK',
  'AED', 'ILS', 'ZAR',
  'TRY', 'THB', 'PHP', 'IDR', 'MYR', 'VND',
  'NZD', 'TWD', 'HUF', 'RON',
] as const satisfies readonly SupportedCurrency[];

type PriceMap = Partial<Record<SupportedCurrency, string>>;

function env(name: string): string {
  return process.env[name] || '';
}

function buildPlanMap(plan: 'MONTHLY' | 'ANNUAL'): PriceMap {
  const map: PriceMap = {};

  for (const currency of SUPPORTED_STRIPE_CURRENCIES) {
    const perCurrency = env(`STRIPE_PRICE_${plan}_${currency}`);
    if (perCurrency) {
      map[currency] = perCurrency;
      continue;
    }

    // Fallback: allow USD to use legacy/default env names.
    if (currency === 'USD') {
      const legacy = plan === 'MONTHLY'
        ? (env('STRIPE_PRICE_MONTHLY') || env('STRIPE_PRICE_PREMIUM_MONTHLY'))
        : (env('STRIPE_PRICE_ANNUAL') || env('STRIPE_PRICE_PREMIUM_YEARLY'));
      if (legacy) map[currency] = legacy;
    }
  }

  return map;
}

export const STRIPE_PRICE_IDS = {
  monthly: buildPlanMap('MONTHLY'),
  annual: buildPlanMap('ANNUAL'),
} as const;

export function getStripePriceId(plan: 'monthly' | 'annual', currency: SupportedCurrency): string {
  const planMap = plan === 'monthly' ? STRIPE_PRICE_IDS.monthly : STRIPE_PRICE_IDS.annual;

  const direct = planMap[currency];
  if (direct) return direct;

  const usd = planMap.USD;
  if (usd) return usd;

  throw new Error(
    `Stripe Price ID missing for plan="${plan}" currency="${currency}". ` +
    `Set STRIPE_PRICE_${plan.toUpperCase()}_${currency} (recommended) or (USD fallback) STRIPE_PRICE_${plan.toUpperCase()}.`
  );
}

