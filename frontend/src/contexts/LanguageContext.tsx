"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Locale, LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isValidLocale } from '@/i18n/config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: readonly Locale[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

/**
 * Language Provider Component
 * 
 * Manages language state and locale switching across the application
 * Follows Single Responsibility Principle - only handles language logic
 */
export function LanguageProvider({ children, initialLocale = DEFAULT_LOCALE }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize locale from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale && isValidLocale(savedLocale) && savedLocale !== initialLocale) {
        setLocaleState(savedLocale);
      }
    }
  }, [initialLocale]);

  /**
   * Changes the application locale
   * Persists choice to localStorage and updates URL
   */
  const setLocale = useCallback((newLocale: Locale) => {
    if (!isValidLocale(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}. Falling back to ${DEFAULT_LOCALE}`);
      newLocale = DEFAULT_LOCALE;
    }

    setLocaleState(newLocale);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }

    // Update URL with new locale
    const currentPathname = pathname || '/';
    
    // Remove current locale from pathname if present
    let newPathname = currentPathname;
    for (const loc of LOCALES) {
      if (currentPathname.startsWith(`/${loc}/`) || currentPathname === `/${loc}`) {
        newPathname = currentPathname.slice(loc.length + 1) || '/';
        break;
      }
    }

    // Add new locale to pathname (unless it's default and we're using 'as-needed' strategy)
    if (newLocale !== DEFAULT_LOCALE) {
      newPathname = `/${newLocale}${newPathname}`;
    }

    router.push(newPathname);
  }, [pathname, router]);

  const value: LanguageContextType = {
    locale,
    setLocale,
    availableLocales: LOCALES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Custom hook to access language context
 * 
 * @throws Error if used outside LanguageProvider
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

/**
 * Hook to get current locale (simplified version)
 */
export function useLocale(): Locale {
  const { locale } = useLanguage();
  return locale;
}

