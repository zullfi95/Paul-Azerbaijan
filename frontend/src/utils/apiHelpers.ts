import { getApiUrl } from '../config/api';

// Стандартизированные типы для API ответов
export interface StandardApiResponse<T> {
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
export function extractApiData<T>(response: { data?: T[]; [key: string]: unknown } | T[]): T[] {
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
export function extractApiItem<T>(response: { data?: T; [key: string]: unknown } | T): T | null {
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
): Promise<StandardApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  try {
    // Получаем токен из localStorage или из переданного параметра
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

    console.log('🔍 API Request:', {
      url: getApiUrl(endpoint),
      method,
      hasToken: !!authToken,
      endpoint
    });

    const response = await fetch(getApiUrl(endpoint), {
      method,
      headers: {
        'Accept': 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      credentials: 'include', // Оставляем для совместимости с CSRF, если нужно
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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

