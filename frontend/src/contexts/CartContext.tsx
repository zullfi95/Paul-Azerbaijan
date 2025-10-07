"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { CartItem } from '../config/api';

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
  const broadcastChannelRef = React.useRef<BroadcastChannel | null>(null);

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
        if (Array.isArray(parsedCart)) {
          // Валидация данных корзины
          const validatedCart = parsedCart.filter((item: Record<string, unknown>) => {
            return item.id && item.name && typeof item.price === 'number' && item.price >= 0;
          });
          setItems(validatedCart);
        } else {
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Пытаемся восстановить корзину из бэкапа
      try {
        const backupKey = `${getStorageKey()}_backup`;
        const backupCart = localStorage.getItem(backupKey);
        if (backupCart) {
          const parsedBackup = JSON.parse(backupCart);
          setItems(Array.isArray(parsedBackup) ? parsedBackup : []);
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      }
    }
  }, [getStorageKey]);

  // Сохраняем корзину в localStorage
  const saveCart = useCallback((cartItems: CartItem[]) => {
    try {
      const storageKey = getStorageKey();
      // normalize prices to 2 decimals
      const normalized = cartItems.map(it => ({
        ...it,
        price: Math.round((it.price + Number.EPSILON) * 100) / 100,
        quantity: Math.max(0, it.quantity || 0)
      }));
      
      const cartData = JSON.stringify(normalized);
      
      // Проверка размера данных (localStorage limit ~5MB)
      const sizeInBytes = new Blob([cartData]).size;
      const maxSize = 4.5 * 1024 * 1024; // 4.5 MB для безопасности
      
      if (sizeInBytes > maxSize) {
        console.warn('Cart size exceeds localStorage limit');
        // Удаляем самые старые товары (FIFO)
        const reducedCart = normalized.slice(-50); // Оставляем последние 50 товаров
        localStorage.setItem(storageKey, JSON.stringify(reducedCart));
      } else {
        localStorage.setItem(storageKey, cartData);
        // Создаём бэкап для восстановления
        try {
          localStorage.setItem(`${storageKey}_backup`, cartData);
        } catch {
          // Игнорируем ошибки бэкапа
        }
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      // Пытаемся очистить старые данные
      try {
        const storageKey = getStorageKey();
        localStorage.removeItem(`${storageKey}_backup`);
        const cartData = JSON.stringify(cartItems.slice(-30)); // Уменьшаем до 30 товаров
        localStorage.setItem(storageKey, cartData);
      } catch {
        console.error('Failed to save cart even after cleanup');
      }
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
              try { localStorage.removeItem('cart_guest'); } catch {}
              return normalized;
            });
          }
        }
      }
    } catch (e) {
      console.error('Error merging guest cart on login:', e);
    }
  }, [loadCart, isAuthenticated, user]);

  // Инициализация BroadcastChannel один раз
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window && !broadcastChannelRef.current) {
        broadcastChannelRef.current = new BroadcastChannel('paul_cart');
      }
    } catch (e) {
      console.error('Failed to create BroadcastChannel:', e);
    }
    
    return () => {
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.close();
          broadcastChannelRef.current = null;
        } catch (e) {
          console.error('Error closing BroadcastChannel:', e);
        }
      }
    };
  }, []);

  // Сохраняем корзину при изменении items
  useEffect(() => {
    // Always save (allow empty to clear storage) and broadcast
    saveCart(items);

    // Broadcast to other tabs
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'cart:update', items });
      } else {
        // Fallback: write a marker to localStorage to trigger storage events
        localStorage.setItem('cart_last_update', String(Date.now()));
      }
    } catch (e) {
      console.error('BroadcastChannel error:', e);
      // Fallback в случае ошибки
      try {
        localStorage.setItem('cart_last_update', String(Date.now()));
      } catch {}
    }
  }, [items, saveCart]);

  // Listen for cart updates from other tabs
  useEffect(() => {
    let storageHandler: ((e: StorageEvent) => void) | null = null;
    const onMessage = (ev: MessageEvent) => {
      try {
        const data = ev.data as { type?: string; items?: CartItem[] } | undefined;
        if (data && data.type === 'cart:update' && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch {
        console.error('Error processing BroadcastChannel message');
      }
    };

    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.addEventListener('message', onMessage);
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
    } catch {
      console.error('Error setting up cart synchronization:');
    }

    return () => {
      try {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.removeEventListener('message', onMessage);
        }
      } catch {}
      try {
        if (storageHandler) {
          (window as unknown as { removeEventListener: (type: 'storage', listener: (e: StorageEvent) => void) => void }).removeEventListener('storage', storageHandler);
        }
      } catch {}
    };
  }, [loadCart]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      // Константы ограничений
      const MAX_ITEMS_IN_CART = 100; // Максимум разных товаров
      const MAX_QUANTITY_PER_ITEM = 999; // Максимум единиц одного товара
      
      if (existingItem) {
        // Увеличиваем количество существующего товара
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { 
                ...cartItem, 
                quantity: Math.min(cartItem.quantity + 1, MAX_QUANTITY_PER_ITEM) 
              }
            : cartItem
        );
      } else {
        // Проверяем лимит товаров перед добавлением нового
        if (prevItems.length >= MAX_ITEMS_IN_CART) {
          console.warn(`Cart limit reached: ${MAX_ITEMS_IN_CART} items`);
          return prevItems;
        }
        // Добавляем новый товар
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const MAX_QUANTITY_PER_ITEM = 999;
    
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId 
          ? { ...item, quantity: Math.min(Math.max(1, quantity), MAX_QUANTITY_PER_ITEM) } 
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    const total = items.reduce((total, item) => {
      const itemPrice = Math.max(0, item.price); // Защита от отрицательных цен
      const itemQuantity = Math.max(0, item.quantity); // Защита от отрицательного количества
      return total + (itemPrice * itemQuantity);
    }, 0);
    return Math.max(0, Math.round((total + Number.EPSILON) * 100) / 100);
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
