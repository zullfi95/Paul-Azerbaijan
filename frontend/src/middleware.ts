import createMiddleware from 'next-intl/middleware';
import { LOCALES, DEFAULT_LOCALE } from './i18n/config';

export default createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed' //Default locale won't have prefix
});

export const config = {
  matcher: [
    '/',
    '/(az|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

