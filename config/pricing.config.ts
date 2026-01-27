import type { SupportedCurrency } from '@/lib/paywall/types';

export interface CurrencyPricing {
  currency: SupportedCurrency;
  monthlyMinor: number; // smallest unit (cents for EUR/USD, whole units for JPY/KRW/etc.)
  annualMinor: number;  // smallest unit
  monthlyDisplay: string;
  annualDisplay: string;
  savingsPercent: number;
}

// Only currencies explicitly defined here are considered “supported” for localized display.
// Others should fall back to USD.
export const PRICING_BY_CURRENCY: Partial<Record<SupportedCurrency, CurrencyPricing>> = {
  // Tier 1
  USD: { currency: 'USD', monthlyMinor: 1899, annualMinor: 16900, monthlyDisplay: '$18.99', annualDisplay: '$169', savingsPercent: 26 },
  EUR: { currency: 'EUR', monthlyMinor: 1899, annualMinor: 16900, monthlyDisplay: '18,99 €', annualDisplay: '169 €', savingsPercent: 26 },
  GBP: { currency: 'GBP', monthlyMinor: 1599, annualMinor: 13900, monthlyDisplay: '£15.99', annualDisplay: '£139', savingsPercent: 28 },

  // Tier 2
  CAD: { currency: 'CAD', monthlyMinor: 2599, annualMinor: 22900, monthlyDisplay: 'CA$25.99', annualDisplay: 'CA$229', savingsPercent: 27 },
  AUD: { currency: 'AUD', monthlyMinor: 2999, annualMinor: 26900, monthlyDisplay: 'A$29.99', annualDisplay: 'A$269', savingsPercent: 25 },
  CHF: { currency: 'CHF', monthlyMinor: 1790, annualMinor: 15900, monthlyDisplay: 'CHF 17.90', annualDisplay: 'CHF 159', savingsPercent: 26 },

  // Tier 3
  JPY: { currency: 'JPY', monthlyMinor: 2900, annualMinor: 25900, monthlyDisplay: '¥2,900', annualDisplay: '¥25,900', savingsPercent: 26 },
  CNY: { currency: 'CNY', monthlyMinor: 13800, annualMinor: 119900, monthlyDisplay: '¥138', annualDisplay: '¥1,199', savingsPercent: 28 },
  HKD: { currency: 'HKD', monthlyMinor: 14800, annualMinor: 129900, monthlyDisplay: 'HK$148', annualDisplay: 'HK$1,299', savingsPercent: 27 },
  SGD: { currency: 'SGD', monthlyMinor: 2590, annualMinor: 22900, monthlyDisplay: 'S$25.90', annualDisplay: 'S$229', savingsPercent: 26 },
  KRW: { currency: 'KRW', monthlyMinor: 25900, annualMinor: 229000, monthlyDisplay: '₩25,900', annualDisplay: '₩229,000', savingsPercent: 26 },
  INR: { currency: 'INR', monthlyMinor: 159900, annualMinor: 1399900, monthlyDisplay: '₹1,599', annualDisplay: '₹13,999', savingsPercent: 27 },

  // Tier 4
  BRL: { currency: 'BRL', monthlyMinor: 9990, annualMinor: 89900, monthlyDisplay: 'R$99,90', annualDisplay: 'R$899', savingsPercent: 25 },
  MXN: { currency: 'MXN', monthlyMinor: 34900, annualMinor: 299900, monthlyDisplay: 'MX$349', annualDisplay: 'MX$2,999', savingsPercent: 28 },

  // Tier 5
  SEK: { currency: 'SEK', monthlyMinor: 19900, annualMinor: 174900, monthlyDisplay: '199 kr', annualDisplay: '1 749 kr', savingsPercent: 27 },
  NOK: { currency: 'NOK', monthlyMinor: 19900, annualMinor: 174900, monthlyDisplay: '199 kr', annualDisplay: '1 749 kr', savingsPercent: 27 },
  DKK: { currency: 'DKK', monthlyMinor: 13900, annualMinor: 119900, monthlyDisplay: '139 kr', annualDisplay: '1 199 kr', savingsPercent: 28 },
  PLN: { currency: 'PLN', monthlyMinor: 7999, annualMinor: 69900, monthlyDisplay: '79,99 zł', annualDisplay: '699 zł', savingsPercent: 27 },
  CZK: { currency: 'CZK', monthlyMinor: 44900, annualMinor: 399900, monthlyDisplay: '449 Kč', annualDisplay: '3 999 Kč', savingsPercent: 26 },

  // Tier 6
  AED: { currency: 'AED', monthlyMinor: 6999, annualMinor: 61900, monthlyDisplay: 'AED 69.99', annualDisplay: 'AED 619', savingsPercent: 26 },
  ILS: { currency: 'ILS', monthlyMinor: 6990, annualMinor: 61900, monthlyDisplay: '₪69.90', annualDisplay: '₪619', savingsPercent: 26 },
  ZAR: { currency: 'ZAR', monthlyMinor: 34900, annualMinor: 299900, monthlyDisplay: 'R349', annualDisplay: 'R2,999', savingsPercent: 28 },

  // Tier 7
  TRY: { currency: 'TRY', monthlyMinor: 59900, annualMinor: 529900, monthlyDisplay: '₺599', annualDisplay: '₺5,299', savingsPercent: 26 },
  THB: { currency: 'THB', monthlyMinor: 64900, annualMinor: 579900, monthlyDisplay: '฿649', annualDisplay: '฿5,799', savingsPercent: 26 },
  PHP: { currency: 'PHP', monthlyMinor: 109900, annualMinor: 949900, monthlyDisplay: '₱1,099', annualDisplay: '₱9,499', savingsPercent: 28 },
  IDR: { currency: 'IDR', monthlyMinor: 299000, annualMinor: 2599000, monthlyDisplay: 'Rp299.000', annualDisplay: 'Rp2.599.000', savingsPercent: 28 },
  MYR: { currency: 'MYR', monthlyMinor: 8990, annualMinor: 79900, monthlyDisplay: 'RM89.90', annualDisplay: 'RM799', savingsPercent: 26 },
  VND: { currency: 'VND', monthlyMinor: 479000, annualMinor: 4199000, monthlyDisplay: '479.000₫', annualDisplay: '4.199.000₫', savingsPercent: 27 },

  // Tier 8
  NZD: { currency: 'NZD', monthlyMinor: 3299, annualMinor: 28900, monthlyDisplay: 'NZ$32.99', annualDisplay: 'NZ$289', savingsPercent: 27 },
  TWD: { currency: 'TWD', monthlyMinor: 599, annualMinor: 5299, monthlyDisplay: 'NT$599', annualDisplay: 'NT$5,299', savingsPercent: 26 },
  HUF: { currency: 'HUF', monthlyMinor: 6990, annualMinor: 61900, monthlyDisplay: '6 990 Ft', annualDisplay: '61 900 Ft', savingsPercent: 26 },
  RON: { currency: 'RON', monthlyMinor: 8990, annualMinor: 79900, monthlyDisplay: '89,90 lei', annualDisplay: '799 lei', savingsPercent: 26 },
};

export const DEFAULT_CURRENCY: SupportedCurrency = 'USD';

export function getPricingForCurrency(currency: SupportedCurrency): CurrencyPricing {
  return PRICING_BY_CURRENCY[currency] ?? PRICING_BY_CURRENCY[DEFAULT_CURRENCY]!;
}

export function isPricingCurrencySupported(currency: SupportedCurrency): boolean {
  return Boolean(PRICING_BY_CURRENCY[currency]);
}

