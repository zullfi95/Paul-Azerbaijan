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

// Types for API responses
export interface CartItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  quantity: number;
  notes?: string;
  persons?: number;
  category?: string;
  available?: boolean;
  isSet?: boolean;
  currency?: string;
  allergens?: string[];
  is_available?: boolean;
  sort_order?: number;
  iiko_id?: string;
  menu_category_id?: number;
  organization_id?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  images?: string[];
  allergens?: string[];
  is_available: boolean;
  sort_order: number;
  iiko_id?: string;
  menu_category_id?: number;
  organization_id?: string;
}

export interface Order {
  id: number;
  company_name: string;
  client_type?: 'corporate' | 'one_time';
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
  };
  employees?: {
    count?: number;
    roles?: string[];
    dietary_requirements?: string[];
  };
  menu_items: MenuItem[];
  comment?: string;
  status: string;
  payment_status?: string;
  coordinator_id?: number;
  client_id?: number;
  total_amount: number;
  discount_fixed?: number;
  discount_percent?: number;
  discount_amount?: number;
  items_total?: number;
  final_amount?: number;
  delivery_date?: string;
  delivery_time?: string;
  delivery_type?: 'delivery' | 'pickup' | 'buffet';
  delivery_address?: string;
  delivery_cost?: number;
  created_at: string;
  updated_at: string;
}

