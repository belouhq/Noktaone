/**
 * Format price utility
 * Formats a price according to currency and locale
 */

export type SupportedCurrency = 
  | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
  | 'JPY' | 'KRW' | 'CNY' | 'INR' | 'AED' | 'RUB';

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  KRW: '₩',
  CNY: '¥',
  INR: '₹',
  AED: 'د.إ',
  RUB: '₽',
};

const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  EUR: 'fr-FR',
  USD: 'en-US',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
  CNY: 'zh-CN',
  INR: 'en-IN',
  AED: 'ar-AE',
  RUB: 'ru-RU',
};

/**
 * Check if a currency uses decimal places (e.g., EUR, USD) or not (e.g., JPY, KRW)
 */
const DECIMAL_CURRENCIES: SupportedCurrency[] = ['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'CNY', 'INR', 'AED', 'RUB'];

/**
 * Format a price with currency symbol
 * @param price Price in the smallest currency unit (cents for EUR/USD, whole units for JPY/KRW)
 * @param currency Currency code
 * @returns Formatted price string (e.g., "9,99 €" or "$9.99" or "¥2,480")
 */
export function formatPrice(price: number, currency: SupportedCurrency = 'EUR'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const locale = CURRENCY_LOCALES[currency];
  const isDecimal = DECIMAL_CURRENCIES.includes(currency);
  
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
  if (currency === 'USD' || currency === 'CAD' || currency === 'AUD' || 
      currency === 'JPY' || currency === 'KRW' || currency === 'CNY' || 
      currency === 'INR' || currency === 'AED' || currency === 'RUB') {
    return `${symbol}${formatted}`;
  }
  
  return `${formatted} ${symbol}`;
}
