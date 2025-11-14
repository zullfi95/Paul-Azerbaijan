"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { Locale, LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isValidLocale, getValidLocale } from '@/i18n/config';

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
  const [isClient, setIsClient] = useState(false);

  // Mark as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Read locale from localStorage on client-side only (once on mount)
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') {
      return;
    }

    try {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale && isValidLocale(savedLocale)) {
        const validLocale = getValidLocale(savedLocale);
        setLocaleState(validLocale);
      }
    } catch (error) {
      // If localStorage is not available, keep the initial locale
      console.warn('Failed to read locale from localStorage:', error);
    }
  }, [isClient]); // Only run when isClient changes (once on mount)

  /**
   * Changes the application locale
   * Persists choice to localStorage and reloads the page to apply changes
   * 
   * Note: This implementation doesn't modify the URL because the app
   * doesn't use server-side locale routing. The locale is stored in
   * localStorage and applied on client-side.
   */
  const setLocale = useCallback((newLocale: Locale) => {
    if (!isValidLocale(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}. Falling back to ${DEFAULT_LOCALE}`);
      newLocale = DEFAULT_LOCALE;
    }

    // Persist to localStorage first
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      
      // Reload the current page to apply the new locale
      // This ensures all components re-render with the new locale from localStorage
      window.location.reload();
    } else {
      // Server-side: just update state
      setLocaleState(newLocale);
    }
  }, []);

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

