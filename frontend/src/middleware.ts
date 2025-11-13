import createMiddleware from 'next-intl/middleware';
import { LOCALES, DEFAULT_LOCALE } from './i18n/config';

export default createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'never' // Don't add locale prefix to URLs
});

export const config = {
  matcher: [
    // Enable for all routes
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Include root
    '/'
  ]
};

