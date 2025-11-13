import { getRequestConfig } from 'next-intl/server';
import { getValidLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
  
  // Ensure a valid locale is used
  locale = getValidLocale(locale);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

