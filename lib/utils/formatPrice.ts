/**
 * Format price utility
 * Formats a price according to currency and locale
 */

export type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'AUD';

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  EUR: 'fr-FR',
  USD: 'en-US',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

/**
 * Format a price with currency symbol
 * @param price Price in the smallest currency unit (cents for EUR/USD, etc.)
 * @param currency Currency code
 * @returns Formatted price string (e.g., "9,99 €" or "$9.99")
 */
export function formatPrice(price: number, currency: SupportedCurrency = 'EUR'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const locale = CURRENCY_LOCALES[currency];
  
  // Convert to major unit (e.g., cents to euros)
  const majorUnit = currency === 'EUR' || currency === 'USD' || currency === 'GBP' 
    ? price / 100 
    : price;
  
  // Format with locale
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorUnit);
  
  // Add symbol (before for USD, after for EUR)
  if (currency === 'USD' || currency === 'CAD' || currency === 'AUD') {
    return `${symbol}${formatted}`;
  }
  
  return `${formatted} ${symbol}`;
}
