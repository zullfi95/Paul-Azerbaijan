"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getApiUrl, getAuthHeaders, User } from '../config/api';

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
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const fetchUser = useCallback(async () => {
    console.log('🔍 Fetching current user via token...');

    // Проверяем наличие токена
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    console.log('🔑 Auth token present:', !!token);
    console.log('👤 User data present:', !!userData);

    if (!token) {
      console.log('❌ No auth token found');
      setUser(null);
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('👤 Parsed user data:', parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
      }
    }

    try {
      const url = getApiUrl('user');
      console.log('🌐 Making request to:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          // Токен недействителен - только тогда logout
          console.log('❌ Token invalid, logging out');
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          setVerificationAttempts(0); // Сбрасываем счетчик
        } else if (response.status === 403) {
          // Доступ запрещен - возможно пользователь заблокирован
          console.warn('🚫 Access forbidden, user might be blocked');
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          setVerificationAttempts(0); // Сбрасываем счетчик
        } else {
          // Другие ошибки (500, 404) - не logout, возможно временные проблемы
          console.warn('⚠️ Token verification failed with status:', response.status);
          // При ошибках сервера оставляем пользователя в системе
          // Увеличиваем счетчик неудачных попыток
          const newAttempts = verificationAttempts + 1;
          setVerificationAttempts(newAttempts);

          // Logout только после 3 неудачных попыток (защита от временных проблем)
          if (newAttempts >= 3) {
            console.warn('🔄 Too many verification failures, logging out');
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
            setVerificationAttempts(0);
          }
        }
      } else {
                // Токен валиден, обновляем данные пользователя
        try {
          const userData = await response.json();
          console.log('✅ User data received:', userData);
          console.log('✅ User data structure:', {
            success: userData.success,
            hasData: !!userData.data,
            userInData: userData.data?.user,
            userType: userData.data?.user?.user_type,
            staffRole: userData.data?.user?.staff_role
          });

          if (userData.success && userData.data) {
            console.log('✅ Setting user data:', userData.data.user);
            setUser(userData.data.user);
            localStorage.setItem('user', JSON.stringify(userData.data.user));
            setVerificationAttempts(0);
          } else {
            console.warn('⚠️ Unexpected user data format:', userData);
            // Если неожиданный формат, очищаем состояние
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
          }
        } catch (parseError) {
          console.warn('❌ Failed to parse user data:', parseError);
          // При ошибке парсинга очищаем состояние
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      // Сетевые ошибки - очищаем состояние аутентификации
      console.warn('🌐 Token verification network error:', error);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      setVerificationAttempts(0);
    }
  }, [verificationAttempts]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch(getApiUrl('logout'), {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    // Очищаем локальное состояние
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        return false;
      }

      console.log('🔄 Updating user data:', userData);

      const response = await fetch(getApiUrl('user'), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(userData),
      });

      console.log('📡 Update user response:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Update user failed - Response text:', responseText);
        return false;
      }

      const responseText = await response.text();
      console.log('📄 Update user response body:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Could not parse update response as JSON:', parseError);
        return false;
      }

      if (data.success && data.data) {
        // Обновляем данные пользователя
        const updatedUser = { ...user, ...data.data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ User updated successfully:', updatedUser);
        return true;
      } else {
        console.warn('⚠️ Unexpected update response format:', data);
        return false;
      }
    } catch (error) {
      console.error('🌐 Update user network error:', error);
      return false;
    }
  }, [user]);

  useEffect(() => {
    console.log('🚀 AuthContext: Initializing...');

    // При token-аутентификации проверяем наличие токена и валидность
    console.log('🔄 AuthContext: Checking token with backend...');
    fetchUser().finally(() => setIsLoading(false));
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const url = getApiUrl('login');
      console.log('🔐 Login attempt:', { 
        email, 
        url,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      });
      
      // CSRF отключен для API, но оставляем cookie для совместимости
      // const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Login response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
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
      console.log('📄 Login response body:', responseText);

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
        console.log('💾 Saving auth token:', !!token);
        console.log('💾 Login response data:', data.data);
        console.log('💾 User data:', data.data.user);
        localStorage.setItem('auth_token', token);

        // Сохраняем пользователя
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('✅ Login successful, user:', data.data.user.name);
        console.log('✅ User type:', data.data.user.user_type);
        console.log('✅ Staff role:', data.data.user.staff_role);
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
      console.log('🔐 Register attempt:', { 
        email, 
        name,
        surname,
        phone,
        url,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          surname, 
          phone 
        }),
      });

      console.log('📡 Register response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
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
      console.log('📄 Register response body:', responseText);

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
        console.log('💾 Saving auth token:', !!token);
        console.log('💾 Register response data:', data.data);
        console.log('💾 User data:', data.data.user);
        localStorage.setItem('auth_token', token);

        // Сохраняем пользователя
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('✅ Register successful, user:', data.data.user.name);
        console.log('✅ User type:', data.data.user.user_type);
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
