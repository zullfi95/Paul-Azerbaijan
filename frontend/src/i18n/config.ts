/**
 * Internationalization Configuration
 * 
 * Centralized i18n configuration following DRY principle
 * Supports: English (en), Azerbaijani (az)
 */

export const LOCALES = ['en', 'az'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  az: 'Azərbaycan',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  az: '🇦🇿',
};

/**
 * Validates if the given locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * Gets a valid locale or returns the default
 */
export function getValidLocale(locale?: string): Locale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Storage key for persisting user's language preference
 */
export const LOCALE_STORAGE_KEY = 'paul-locale';

