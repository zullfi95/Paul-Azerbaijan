import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { getValidLocale, DEFAULT_LOCALE } from './config';

export default getRequestConfig(async () => {
  // Get locale from headers (set by middleware)
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || DEFAULT_LOCALE;
  
  return {
    locale: getValidLocale(locale),
    messages: (await import(`../../messages/${getValidLocale(locale)}.json`)).default,
  };
});

