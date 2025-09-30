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
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Legacy function for backward compatibility
export const getApiUrl = (endpoint: string): string => {
  // BASE_URL уже содержит полный URL с /api, поэтому добавляем endpoint без /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return buildApiUrl(`/${cleanEndpoint}`);
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

// ===== TYPES =====

// User Types - единая модель для всех пользователей
export interface User {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  company_name?: string;
  position?: string;
  contact_person?: string;
  email_verified_at?: string;
  user_type: 'client' | 'staff';
  staff_role?: 'coordinator' | 'observer';
  client_category?: 'corporate' | 'one_time';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

// Client Types - теперь это User с user_type: 'client'

// Application Types
export interface Application {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  message?: string;
  event_address?: string;
  event_date?: string;
  event_time?: string;
  event_lat?: number;
  event_lng?: number;
  cart_items: CartItem[] | null;
  status: 'new' | 'processing' | 'approved' | 'rejected';
  coordinator_comment?: string;
  coordinator_id?: number;
  client_id?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  coordinator?: User;
  client?: User;
}

// Menu Item Types - базовый интерфейс для всех элементов меню
export interface MenuItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Cart Item Types - расширенный интерфейс для корзины с дополнительными полями
export interface CartItem extends MenuItem {
  description: string;
  image: string;
  category: string;
  available: boolean;
  isSet: boolean;
  persons?: number;
}

// Product Item Types - для отображения продуктов в каталоге
export interface ProductItem extends CartItem {
  // Дополнительные поля для продуктов, если нужны
}

// Order Types
export interface Order {
  id: number;
  company_name: string;
  client_type?: 'corporate' | 'one_time';
  customer?: any;
  employees?: any;
  menu_items: MenuItem[];
  comment?: string;
  status: 'draft' | 'submitted' | 'processing' | 'completed' | 'cancelled';
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
  recurring_schedule?: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly';
    days: string[];
    delivery_time: string;
    notes: string;
  };
  // Новые поля
  equipment_required?: number;
  staff_assigned?: number;
  special_instructions?: string;
  beo_file_path?: string;
  beo_generated_at?: string;
  preparation_timeline?: any;
  is_urgent?: boolean;
  order_deadline?: string;
  modification_deadline?: string;
  application_id?: number;
  // Поля для платежей
  algoritma_order_id?: string;
  payment_status?: 'pending' | 'authorized' | 'charged' | 'failed' | 'refunded' | 'credited';
  payment_url?: string;
  payment_attempts?: number;
  payment_created_at?: string;
  payment_completed_at?: string;
  payment_details?: any;
  // Связи
  coordinator?: User;
  client?: User;
  application?: Application;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: number;
  type: 'email' | 'sms' | 'push';
  recipient_email: string;
  recipient_role: string;
  subject: string;
  content: string;
  metadata?: {
    order_id?: number;
    client_id?: number;
    notification_type?: string;
  };
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_at?: string;
  error_message?: string;
  retry_count: number;
  next_retry_at?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_group?: 'client' | 'staff';
  staff_role?: 'coordinator' | 'observer';
}

export interface ApplicationRequest {
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string;
  message?: string | null;
  cart_items?: CartItem[];
  coordinator_id?: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}
