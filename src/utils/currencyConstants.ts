/**
 * Константы для работы с валютами
 */

// Основная валюта системы
export const DEFAULT_CURRENCY = 'USD';

// Символы валют
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  AZN: '₼',
  RUB: '₽',
} as const;

// Коды валют
export const CURRENCY_CODES = {
  USD: 'USD',
  EUR: 'EUR', 
  AZN: 'AZN',
  RUB: 'RUB',
} as const;

// Типы валют
export type CurrencyCode = keyof typeof CURRENCY_CODES;

/**
 * Получить символ валюты
 */
export const getCurrencySymbol = (currency: string = DEFAULT_CURRENCY): string => {
  return CURRENCY_SYMBOLS[currency as CurrencyCode] || currency;
};

/**
 * Форматировать сумму с валютой
 */
export const formatCurrency = (
  amount: number | string | null | undefined, 
  currency: string = DEFAULT_CURRENCY
): string => {
  if (amount === null || amount === undefined || amount === '') {
    return `0.00 ${getCurrencySymbol(currency)}`;
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `0.00 ${getCurrencySymbol(currency)}`;
  }
  
  return `${numAmount.toFixed(2)} ${getCurrencySymbol(currency)}`;
};
