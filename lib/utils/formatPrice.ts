/**
 * Format price utility
 * Formats a price according to currency and locale
 */

import type { SupportedCurrency } from '@/lib/paywall/types';

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  JPY: '¥',
  KRW: '₩',
  CNY: '¥',
  HKD: 'HK$',
  SGD: 'S$',
  INR: '₹',
  AED: 'د.إ',
  BRL: 'R$',
  MXN: 'MX$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  ILS: '₪',
  ZAR: 'R',
  TRY: '₺',
  THB: '฿',
  PHP: '₱',
  IDR: 'Rp',
  MYR: 'RM',
  VND: '₫',
  NZD: 'NZ$',
  TWD: 'NT$',
  HUF: 'Ft',
  RON: 'lei',
  RUB: '₽',
};

const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  EUR: 'fr-FR',
  USD: 'en-US',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
  CHF: 'de-CH',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
  CNY: 'zh-CN',
  HKD: 'zh-HK',
  SGD: 'en-SG',
  INR: 'en-IN',
  AED: 'ar-AE',
  BRL: 'pt-BR',
  MXN: 'es-MX',
  SEK: 'sv-SE',
  NOK: 'nb-NO',
  DKK: 'da-DK',
  PLN: 'pl-PL',
  CZK: 'cs-CZ',
  ILS: 'he-IL',
  ZAR: 'en-ZA',
  TRY: 'tr-TR',
  THB: 'th-TH',
  PHP: 'en-PH',
  IDR: 'id-ID',
  MYR: 'ms-MY',
  VND: 'vi-VN',
  NZD: 'en-NZ',
  TWD: 'zh-TW',
  HUF: 'hu-HU',
  RON: 'ro-RO',
  RUB: 'ru-RU',
};

/**
 * Check if a currency uses decimal places (e.g., EUR, USD) or not (e.g., JPY, KRW)
 */
const ZERO_DECIMAL_CURRENCIES: SupportedCurrency[] = ['JPY', 'KRW', 'IDR', 'VND', 'HUF', 'TWD'];

/**
 * Format a price with currency symbol
 * @param price Price in the smallest currency unit (cents for EUR/USD, whole units for JPY/KRW)
 * @param currency Currency code
 * @returns Formatted price string (e.g., "9,99 €" or "$9.99" or "¥2,480")
 */
export function formatPrice(price: number, currency: SupportedCurrency = 'EUR'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const locale = CURRENCY_LOCALES[currency];
  const isDecimal = !ZERO_DECIMAL_CURRENCIES.includes(currency);
  
  // Convert to major unit (e.g., cents to euros for decimal currencies)
  const majorUnit = isDecimal 
    ? price / 100 
    : price;
  
  // Format with locale
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: isDecimal ? 2 : 0,
    maximumFractionDigits: isDecimal ? 2 : 0,
  }).format(majorUnit);
  
  // Add symbol (before for USD, CAD, AUD, JPY, KRW, CNY, INR, AED, RUB; after for EUR, GBP)
  // In practice: most currencies put the symbol/code before; EUR/GBP often appear after in FR formatting.
  if (currency === 'EUR' || currency === 'GBP' || currency === 'PLN' || currency === 'CZK' || currency === 'HUF' || currency === 'RON') {
    return `${formatted} ${symbol}`;
  }

  if (
    currency === 'USD' || currency === 'CAD' || currency === 'AUD' || currency === 'NZD' ||
    currency === 'JPY' || currency === 'KRW' || currency === 'CNY' || currency === 'TWD' ||
    currency === 'INR' || currency === 'AED' || currency === 'ILS' ||
    currency === 'HKD' || currency === 'SGD' ||
    currency === 'BRL' || currency === 'MXN' ||
    currency === 'SEK' || currency === 'NOK' || currency === 'DKK' ||
    currency === 'TRY' || currency === 'THB' || currency === 'PHP' || currency === 'IDR' || currency === 'MYR' || currency === 'VND' ||
    currency === 'CHF' ||
    currency === 'ZAR' ||
    currency === 'RUB'
  ) {
    return `${symbol}${formatted}`;
  }

  return `${formatted} ${symbol}`;
}
