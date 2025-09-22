"use client";

import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { CartModalProvider } from '../contexts/CartModalContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <CartModalProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </CartModalProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
