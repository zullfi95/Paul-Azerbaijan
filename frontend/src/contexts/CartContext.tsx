"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { CartItem, User, Order, Application, Address } from '@/types/unified';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const broadcastChannelRef = React.useRef<BroadcastChannel | null>(null);

  // Убираем избыточные логи для улучшения производительности

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
          const validatedCart = parsedCart.filter((item: Record<string, string | number | boolean>) => {
            return item.id && item.name && typeof item.price === 'number' && item.price >= 0;
          });
          setItems(validatedCart);
        } else {
          console.warn('Invalid cart data format, keeping current items');
        }
      } else {
        // При перезагрузке страницы, если нет данных в localStorage, 
        // устанавливаем пустую корзину (это нормально)
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Пытаемся восстановить корзину из бэкапа
      try {
        const backupKey = `${getStorageKey()}_backup`;
        const backupCart = localStorage.getItem(backupKey);
        if (backupCart) {
          const parsedBackup = JSON.parse(backupCart);
          if (Array.isArray(parsedBackup)) {
            setItems(parsedBackup);
          }
        } else {
          // Если нет бэкапа, устанавливаем пустую корзину
          setItems([]);
        }
      } catch {
        console.error('Failed to restore cart from backup');
        // При ошибке устанавливаем пустую корзину
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

  // Инициализация и загрузка корзины
  useEffect(() => {
    
    // Инициализируем корзину при первом запуске
    if (!isInitialized) {
      loadCart();
      setIsInitialized(true);
      return;
    }
    
    // If user just logged in, check for guest cart and merge
    if (isAuthenticated && user) {
      const userCartKey = `cart_${user.id}`;
      const guestCartRaw = localStorage.getItem('cart_guest');
      const userCartRaw = localStorage.getItem(userCartKey);
      
      // If user cart is empty but guest cart has items, merge them
      if (guestCartRaw && (!userCartRaw || userCartRaw === '[]')) {
        try {
          const parsed: CartItem[] = JSON.parse(guestCartRaw);
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
              // save merged under user key and remove guest cart
              try { 
                localStorage.setItem(userCartKey, JSON.stringify(normalized));
                localStorage.removeItem('cart_guest'); 
              } catch (e) {
                console.error('Error saving merged cart:', e);
              }
              return normalized;
            });
          }
        } catch (e) {
          console.error('Error merging guest cart on login:', e);
        }
      } else if (userCartRaw) {
        // User cart exists, load it
        loadCart();
      }
    }
  }, [isAuthenticated, user, isInitialized, getStorageKey]);

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
          // Не обновляем корзину, если пришла пустая корзина, а у нас уже есть товары
          // Это предотвращает случайную очистку корзины при открытии новой вкладки
          if (data.items.length === 0 && items.length > 0) {
            return;
          }
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
            // Загружаем корзину только если она действительно изменилась
            // и не является пустой при наличии товаров в текущей корзине
            const currentStorageKey = getStorageKey();
            const currentCart = localStorage.getItem(currentStorageKey);
            if (currentCart) {
              try {
                const parsedCart = JSON.parse(currentCart);
                if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                  loadCart();
                } else if (Array.isArray(parsedCart) && parsedCart.length === 0 && items.length === 0) {
                  // Загружаем пустую корзину только если текущая тоже пустая
                  loadCart();
                }
              } catch {
                // При ошибке парсинга не загружаем
              }
            }
          }
        };
        // Type the window as having addEventListener for storage events
        window.addEventListener('storage', storageHandler);
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
          window.removeEventListener('storage', storageHandler);
        }
      } catch {}
    };
  }, [getStorageKey, items.length]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(cartItem => String(cartItem.id) === String(item.id));
      
      // Константы ограничений
      const MAX_ITEMS_IN_CART = 100; // Максимум разных товаров
      const MAX_QUANTITY_PER_ITEM = 999; // Максимум единиц одного товара
      
      if (existingItem) {
        // Увеличиваем количество существующего товара
        return prevItems.map(cartItem =>
          String(cartItem.id) === String(item.id)
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
    setItems(prevItems => prevItems.filter(item => String(item.id) !== String(itemId)));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const MAX_QUANTITY_PER_ITEM = 999;
    
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        String(item.id) === String(itemId) 
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
    return items.some(item => String(item.id) === String(itemId));
  }, [items]);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = items.find(item => String(item.id) === String(itemId));
    return item ? item.quantity : 0;
  }, [items]);

  const value: CartContextType = React.useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart,
    getItemQuantity,
  }), [items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems, isInCart, getItemQuantity]);

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
