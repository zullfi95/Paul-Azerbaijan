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
    'nav.cakes_pies': 'Cakes&Pies',
    'nav.viennoiserie': 'Viennoiserie',
    'nav.patisserie': 'Patisserie',
    'nav.platters': 'Platters',
    'nav.bread': 'Bread',
    'nav.macarons': 'Macarons',
    'action.find_paul': 'Find a PAUL',
    'action.click_collect': 'Click & Collect',
    'action.catering_menu': 'Catering Menu',
    'action.plan_event': 'Plan an Event',
    'aria.profile': 'Profile',
    'aria.login': 'Login',
    'aria.cart': 'Shopping Cart',
    'aria.menu': 'Menu',
    'aria.language': 'Select Language',
  },
  ru: {
    'search.placeholder': 'поиск товара',
    'nav.cakes_pies': 'Торты Пироги',
    'nav.viennoiserie': 'Венская выпечка',
    'nav.patisserie': 'Кондитерские изделия',
    'nav.platters': 'Плато',
    'nav.bread': 'Хлеб',
    'nav.macarons': 'Макароны',
    'action.find_paul': 'Найти PAUL',
    'action.click_collect': 'Click & Collect',
    'action.catering_menu': 'Меню кейтеринга',
    'action.plan_event': 'Спланировать мероприятие',
    'aria.profile': 'Профиль',
    'aria.login': 'Войти',
    'aria.cart': 'Корзина',
    'aria.menu': 'Меню',
    'aria.language': 'Выбрать язык',
  },
  az: {
    'search.placeholder': 'məhsul axtar',
    'nav.cakes_pies': 'Tortlar piroglar',
    'nav.viennoiserie': 'Vyana çörəkləri',
    'nav.patisserie': 'Şirniyyat',
    'nav.platters': 'Platolar',
    'nav.bread': 'Çörək',
    'nav.macarons': 'Makaronlar',
    'action.find_paul': 'PAUL tap',
    'action.click_collect': 'Click & Collect',
    'action.catering_menu': 'Katerinq menyusu',
    'action.plan_event': 'Tədbir planla',
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
