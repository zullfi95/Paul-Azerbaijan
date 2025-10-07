"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "../contexts/LanguageContext";
import { CartModalProvider } from "../contexts/CartModalContext";
import { NotificationProvider } from "../contexts/NotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
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
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CartModalProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </CartModalProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
