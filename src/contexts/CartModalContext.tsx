"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(undefined);

export const CartModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const value: CartModalContextType = {
    isOpen,
    openModal,
    closeModal
  };

  return (
    <CartModalContext.Provider value={value}>
      {children}
    </CartModalContext.Provider>
  );
};

export const useCartModal = (): CartModalContextType => {
  const context = useContext(CartModalContext);
  if (context === undefined) {
    throw new Error('useCartModal must be used within a CartModalProvider');
  }
  return context;
};
