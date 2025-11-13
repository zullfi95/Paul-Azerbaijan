"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CartModalProvider } from "@/contexts/CartModalContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import enMessages from '../../messages/en.json';
import azMessages from '../../messages/az.json';

interface ProvidersProps {
  children: React.ReactNode;
}

function IntlProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  const messages = locale === 'az' ? azMessages : enMessages;
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Кэширование на 5 минут
        staleTime: 5 * 60 * 1000,
        // Данные остаются в кэше 10 минут
        gcTime: 10 * 60 * 1000,
        // Повторные запросы при потере фокуса
        refetchOnWindowFocus: false,
        // Повторные запросы при переподключении
        refetchOnReconnect: true,
        // Количество повторных попыток при ошибке
        retry: 2,
        // Задержка между повторными попытками
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Повторные попытки для мутаций
        retry: 1,
      },
    },
  }));

  return (
    <LanguageProvider initialLocale="en">
      <IntlProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <CartModalProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </CartModalProvider>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </IntlProvider>
    </LanguageProvider>
  );
}
