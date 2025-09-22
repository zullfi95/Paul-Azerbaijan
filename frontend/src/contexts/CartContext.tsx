"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  isSet: boolean;
  persons?: number;
  quantity: number;
}

type GuestCartItem = Partial<CartItem> & { id: string; quantity?: number; price?: number };

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isInCart: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Генерируем уникальный ключ для localStorage на основе пользователя
  const getStorageKey = useCallback(() => {
    if (isAuthenticated && user) {
      return `cart_${user.id}`;
    }
    return 'cart_guest';
  }, [isAuthenticated, user]);

  // Загружаем корзину из localStorage
  const loadCart = useCallback(() => {
    try {
      const storageKey = getStorageKey();
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(Array.isArray(parsedCart) ? parsedCart : []);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setItems([]);
    }
  }, [getStorageKey]);

  // Сохраняем корзину в localStorage
  const saveCart = useCallback((cartItems: CartItem[]) => {
    try {
      const storageKey = getStorageKey();
      // normalize prices to 2 decimals
      const normalized = cartItems.map(it => ({
        ...it,
        price: Math.round((it.price + Number.EPSILON) * 100) / 100
      }));
      localStorage.setItem(storageKey, JSON.stringify(normalized));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [getStorageKey]);

  // Загружаем корзину при изменении пользователя
  useEffect(() => {
    loadCart();
    // If user just logged in, merge guest cart into user cart
    try {
      if (isAuthenticated && user) {
        const guestCartRaw = localStorage.getItem('cart_guest');
        if (guestCartRaw) {
          const parsed: unknown = JSON.parse(guestCartRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const guestCart = parsed as GuestCartItem[];
            setItems(prev => {
              // merge by id, summing quantities
              const map: Record<string, CartItem> = {};
              prev.forEach((it: CartItem) => { map[it.id] = { ...it }; });
              guestCart.forEach((it: GuestCartItem) => {
                if (!it.id) return;
                if (map[it.id]) {
                  map[it.id].quantity = (map[it.id].quantity || 0) + (Number(it.quantity) || 0);
                } else {
                  // create a CartItem from GuestCartItem with sensible defaults
                  map[it.id] = {
                    id: it.id,
                    name: String(it.name || ''),
                    description: String(it.description || ''),
                    price: Math.round((Number(it.price || 0) + Number.EPSILON) * 100) / 100,
                    image: String(it.image || ''),
                    category: String(it.category || ''),
                    available: typeof it.available === 'boolean' ? it.available : true,
                    isSet: typeof it.isSet === 'boolean' ? it.isSet : false,
                    persons: typeof it.persons === 'number' ? it.persons : undefined,
                    quantity: Number(it.quantity || 0),
                  };
                }
              });
              const merged = Object.values(map);
              // normalize prices on merge
              const normalized = merged.map((it: CartItem) => ({
                ...it,
                price: Math.round((Number(it.price || 0) + Number.EPSILON) * 100) / 100,
                quantity: Number(it.quantity || 0)
              }));
              // save merged under user key
              try { localStorage.removeItem('cart_guest'); } catch (_e) {}
              return normalized;
            });
          }
        }
      }
    } catch (e) {
      console.error('Error merging guest cart on login:', e);
    }
  }, [loadCart, isAuthenticated, user]);

  // Сохраняем корзину при изменении items
  useEffect(() => {
    // Always save (allow empty to clear storage) and broadcast
    saveCart(items);

    // Broadcast to other tabs
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('paul_cart');
        bc.postMessage({ type: 'cart:update', items });
        bc.close();
      } else {
        // Fallback: write a marker to localStorage to trigger storage events
        localStorage.setItem('cart_last_update', String(Date.now()));
      }
    } catch (e) {
      console.error('BroadcastChannel error:', e);
    }
  }, [items, saveCart]);

  // Listen for cart updates from other tabs
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    let storageHandler: ((e: StorageEvent) => void) | null = null;
    const onMessage = (ev: MessageEvent) => {
      try {
        const data = ev.data as { type?: string; items?: CartItem[] } | undefined;
        if (data && data.type === 'cart:update' && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch (_err: unknown) {
        console.error('Error processing BroadcastChannel message');
      }
    };

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('paul_cart');
        bc.addEventListener('message', onMessage);
      } else if (typeof window !== 'undefined') {
        // fallback to storage event
        storageHandler = (e: StorageEvent) => {
          if (e.key === 'cart_last_update') {
            loadCart();
          }
        };
          // Type the window as having addEventListener for storage events
          (window as unknown as { addEventListener: (type: 'storage', listener: (e: StorageEvent) => void) => void }).addEventListener('storage', storageHandler);
      }
    } catch (_err: unknown) {
      console.error('Error setting up cart synchronization:');
    }

    return () => {
      try {
        if (bc) bc.removeEventListener('message', onMessage);
      } catch (_err) {}
      try {
        if (storageHandler) (window as unknown as { removeEventListener: (type: 'storage', listener: (e: StorageEvent) => void) => void }).removeEventListener('storage', storageHandler);
      } catch (_err) {}
    };
  }, [loadCart]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Увеличиваем количество существующего товара
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Добавляем новый товар
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    const total = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const isInCart = useCallback((itemId: string) => {
    return items.some(item => item.id === itemId);
  }, [items]);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  }, [items]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
