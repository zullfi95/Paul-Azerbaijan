"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys - you can expand this as needed
const translations = {
  en: {
    'search.placeholder': 'search for product',
    'nav.cakes': 'Cakes',
    'nav.platters': 'Platters',
    'nav.patisserie': 'Patisserie',
    'nav.tarts': 'Tarts',
    'nav.bread': 'Bread',
    'nav.macarons': 'Macarons',
    'action.find_paul': 'Find a PAUL',
    'action.click_collect': 'Click & Collect',
    'action.catering_menu': 'Catering Menu',
    'action.calculate_budget': 'Calculate budget',
    'aria.profile': 'Profile',
    'aria.login': 'Login',
    'aria.cart': 'Shopping Cart',
    'aria.menu': 'Menu',
    'aria.language': 'Select Language',
  },
  ru: {
    'search.placeholder': 'поиск товара',
    'nav.cakes': 'Торты',
    'nav.platters': 'Плато',
    'nav.patisserie': 'Патиссери',
    'nav.tarts': 'Тарты',
    'nav.bread': 'Хлеб',
    'nav.macarons': 'Макароны',
    'action.find_paul': 'Найти PAUL',
    'action.click_collect': 'Клик и забери',
    'action.catering_menu': 'Меню кейтеринга',
    'action.calculate_budget': 'Рассчитать бюджет',
    'aria.profile': 'Профиль',
    'aria.login': 'Войти',
    'aria.cart': 'Корзина',
    'aria.menu': 'Меню',
    'aria.language': 'Выбрать язык',
  },
  az: {
    'search.placeholder': 'məhsul axtar',
    'nav.cakes': 'Tortlar',
    'nav.platters': 'Platolar',
    'nav.patisserie': 'Patisserie',
    'nav.tarts': 'Tartlar',
    'nav.bread': 'Çörək',
    'nav.macarons': 'Makaronlar',
    'action.find_paul': 'PAUL tap',
    'action.click_collect': 'Klik və götür',
    'action.catering_menu': 'Katerinq menyusu',
    'action.calculate_budget': 'Büdcə hesabla',
    'aria.profile': 'Profil',
    'aria.login': 'Daxil ol',
    'aria.cart': 'Səbət',
    'aria.menu': 'Menyu',
    'aria.language': 'Dil seç',
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && ['en', 'ru', 'az'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations];
    return currentTranslations?.[key as keyof typeof currentTranslations] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
