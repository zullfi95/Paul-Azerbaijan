"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getApiUrl, getAuthHeaders, API_CONFIG } from '@/config/api';
import { makeApiRequest } from '@/utils/apiHelpers';
import { User, Order, Application, CartItem, Address } from '@/types/unified';
import { getToken, setToken, removeToken } from '@/utils/tokenManager';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; user: User | null }>;
  register: (email: string, password: string, name: string, surname: string, phone: string) => Promise<{ ok: boolean; user: User | null }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Token-based auth: Sanctum tokens stored in localStorage
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {

    const token = getToken();
    const userData = localStorage.getItem('user');


    if (!token) {
      setUser(null);
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
      }
    }

    try {
      const url = getApiUrl('user');

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });


      if (!response.ok) {
        // При любой ошибке аутентификации - logout
        if (response.status === 401 || response.status === 403) {
          setUser(null);
          localStorage.removeItem('user');
          removeToken();
        } else {
          // При других ошибках - просто логируем, не logout
          console.warn('⚠️ Token verification failed with status:', response.status);
        }
      } else {
                // Токен валиден, обновляем данные пользователя
        try {
          const userData = await response.json();

          if (userData.success && userData.data) {
            setUser(userData.data.user);
            localStorage.setItem('user', JSON.stringify(userData.data.user));
          } else {
            console.warn('⚠️ Unexpected user data format:', userData);
            // Если неожиданный формат, очищаем состояние
            setUser(null);
            localStorage.removeItem('user');
            removeToken();
          }
        } catch (parseError) {
          console.warn('❌ Failed to parse user data:', parseError);
          // При ошибке парсинга очищаем состояние
          setUser(null);
          localStorage.removeItem('user');
          removeToken();
        }
      }
    } catch (error) {
      // Сетевые ошибки - очищаем состояние аутентификации
      console.warn('🌐 Token verification network error:', error);
      setUser(null);
      localStorage.removeItem('user');
      removeToken();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = getToken();
      if (token) {
        await makeApiRequest('/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    // Очищаем локальное состояние
    setUser(null);
    localStorage.removeItem('user');
    removeToken();
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No auth token found');
        return false;
      }


      const response = await makeApiRequest('/user', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });


      if (!response.success) {
        console.error('❌ Update user failed - Response message:', response.message);
        return false;
      }

        if (response.success && response.data && user) {
          // Обновляем данные пользователя
          const updatedUser = { ...user, ...response.data } as User;
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return true;
        } else {
          return false;
        }
    } catch (error) {
      console.error('🌐 Update user network error:', error);
      return false;
    }
  }, [user]);

  useEffect(() => {

    // При token-аутентификации проверяем наличие токена и валидность
    fetchUser().finally(() => setIsLoading(false));
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const url = getApiUrl('login');
      
      // CSRF отключен для API, но оставляем cookie для совместимости
      // const baseUrl = API_CONFIG.BASE_URL;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });


      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Login failed - Response text:', responseText);

        try {
          const errorData = JSON.parse(responseText);
          console.error('❌ Login failed - Parsed error:', errorData);
        } catch (parseError) {
          console.error('❌ Login failed - Could not parse response as JSON:', parseError);
        }
        return { ok: false, user: null };
      }

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Could not parse successful response as JSON:', parseError);
        return { ok: false, user: null };
      }

      if (data.success && data.data) {
        // Сохраняем токен в localStorage
        const token = data.data.token;
        setToken(token);

        // Сохраняем пользователя
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { ok: true, user: data.data.user };
      } else {
        console.warn('⚠️ Unexpected login response format:', data);
        return { ok: false, user: null };
      }
    } catch (error) {
      console.error('🌐 Login network error:', error);
      return { ok: false, user: null };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, surname: string, phone: string) => {
    try {
      const url = getApiUrl('register');
      const requestData = { 
        email, 
        password, 
        name, 
        surname, 
        phone 
      };
      
      
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });


      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Register failed - Response text:', responseText);

        try {
          const errorData = JSON.parse(responseText);
          console.error('❌ Register failed - Parsed error:', errorData);
        } catch (parseError) {
          console.error('❌ Register failed - Could not parse response as JSON:', parseError);
        }
        return { ok: false, user: null };
      }

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Could not parse successful response as JSON:', parseError);
        return { ok: false, user: null };
      }

      if (data.success && data.data) {
        // Сохраняем токен в localStorage
        const token = data.data.token;
        setToken(token);

        // Сохраняем пользователя
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { ok: true, user: data.data.user };
      } else {
        console.warn('⚠️ Unexpected register response format:', data);
        return { ok: false, user: null };
      }
    } catch (error) {
      console.error('🌐 Register network error:', error);
      return { ok: false, user: null };
    }
  }, []);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
