import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE } from './config';

export default getRequestConfig(async () => {
  // Always use default locale for server-side rendering
  // Client-side language switching is handled by LanguageContext
  return {
    locale: DEFAULT_LOCALE,
    messages: (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default,
  };
});

