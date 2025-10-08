// API Configuration
export const API_CONFIG = {
  // Base URL for API requests (Laravel automatically adds /api/ prefix to routes/api.php)
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',

  // API endpoints
  ENDPOINTS: {
    APPLICATIONS: '/applications',
    USERS: '/users',
    ORDERS: '/orders',
    CLIENTS: '/clients',
    CLIENT_ORDERS: '/client/orders',
    CLIENT_ORDERS_ACTIVE: '/client/orders/active',
    CLIENT_NOTIFICATIONS: '/client/notifications',
    CLIENT_NOTIFICATIONS_UNREAD: '/client/notifications/unread-count',
  }
};

// Helper function to build full API URL
export const getApiUrl = (endpoint: string): string => {
  // BASE_URL уже содержит полный URL с /api, поэтому добавляем endpoint без лишнего /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

// Function to get auth headers with token
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Use provided token or get from localStorage
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
};

