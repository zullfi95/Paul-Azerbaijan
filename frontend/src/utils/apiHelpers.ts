import {
  User,
  Order,
  Application,
  CartItem,
  Address,
  LoginRequest,
  RegisterRequest,
  ApplicationRequest,
  ApiResponse,
  MenuItem,
  MenuCategory,
  PaginatedResponse,
} from '../types/common';
import { API_CONFIG } from '../config/api';
import { getToken } from './tokenManager';

// Стандартизированные типы для API ответов
export interface StandardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Для случаев когда data может отсутствовать
export interface StandardApiResponseOptional<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedData<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

// function getCookie(name: string): string | null {
//   if (typeof document === 'undefined') return null;
//   const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
//   return match ? match[1] : null;
// }

// Утилита для безопасного извлечения данных из API ответов
export function extractApiData<T>(response: { data?: T[]; [key: string]: any } | T[]): T[] {
  // Обрабатываем различные структуры ответов
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response?.data) {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
      const nestedData = (response.data as { data?: T[] }).data;
      if (Array.isArray(nestedData)) {
        return nestedData;
      }
    }
  }
  
  return [];
}

// Утилита для безопасного извлечения одного элемента
export function extractApiItem<T>(response: { data?: T; [key: string]: any } | T): T | null {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return (response as { data?: T }).data || null;
  }
  return response as T;
}

// Стандартизированная функция для API запросов
export async function makeApiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: string | FormData;
    token?: string;
  } = {}
): Promise<StandardApiResponseOptional<T>> {
  const { method = 'GET', body, token } = options;

  try {
    const authToken = token || getToken();

    const headers: HeadersInit = {
      'Accept': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    };

    // Если тело запроса - не FormData, добавляем Content-Type: application/json
    if (typeof body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(API_CONFIG.BASE_URL + endpoint, {
      method,
      headers: headers,
      credentials: 'include',
      body: body,
    });


    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Если не JSON, создаем базовую ошибку
        errorData = { message: `HTTP ${response.status}` };
      }
      
      return {
        success: false,
        message: errorData.message || `HTTP ${response.status}`,
        errors: errorData.errors,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Утилита для обработки ошибок
export function handleApiError(error: StandardApiResponse<unknown>, fallbackMessage = 'Произошла ошибка'): string {
  if (error.errors) {
    const errorMessages = Object.entries(error.errors)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
      .join('\n');
    return errorMessages;
  }
  
  return error.message || fallbackMessage;
}

/**
 * API функции для управления меню
 */

export async function fetchMenuItems(
  params?: { search?: string, category_id?: number | string, is_active?: boolean, is_available?: boolean, page?: number, per_page?: number }
): Promise<StandardApiResponseOptional<PaginatedResponse<MenuItem>>> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.category_id) query.append('category_id', String(params.category_id));
  if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
  if (params?.is_available !== undefined) query.append('is_available', String(params.is_available));
  if (params?.page) query.append('page', String(params.page));
  if (params?.per_page) query.append('per_page', String(params.per_page));

  const queryString = query.toString();
  const endpoint = `/menu-items${queryString ? `?${queryString}` : ''}`;
  return makeApiRequest<PaginatedResponse<MenuItem>>(endpoint);
}

export async function fetchMenuItem(id: number): Promise<StandardApiResponseOptional<MenuItem>> {
  return makeApiRequest<MenuItem>(`/menu-items/${id}`);
}

export async function fetchMenuCategories(): Promise<StandardApiResponseOptional<MenuCategory[]>> {
  return makeApiRequest<MenuCategory[]>(`/menu-categories`);
}

export async function createMenuItem(itemData: FormData): Promise<StandardApiResponseOptional<MenuItem>> {
  return makeApiRequest<MenuItem>('/menu-items', {
    method: 'POST',
    body: itemData,
  });
}

export async function updateMenuItem(id: number, itemData: FormData): Promise<StandardApiResponseOptional<MenuItem>> {
  // Для отправки FormData с методом PUT/PATCH, Laravel ожидает _method=PUT/PATCH
  itemData.append('_method', 'PUT');
  return makeApiRequest<MenuItem>(`/menu-items/${id}`, {
    method: 'POST', // Отправляем как POST, но с _method=PUT
    body: itemData,
  });
}

export async function deleteMenuItem(id: number): Promise<StandardApiResponseOptional<null>> {
  return makeApiRequest<null>(`/menu-items/${id}`, {
    method: 'DELETE',
  });
}

