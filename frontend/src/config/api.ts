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

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  email_verified_at?: string;
  user_type: 'client' | 'staff';
  staff_role?: 'coordinator' | 'observer';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  // Additional fields for extended user data
  user_group?: 'staff' | 'client';
  client_category?: 'corporate' | 'one_time';
  company_name?: string;
  position?: string;
  address?: string;
  contact_person?: string;
}

// Client Types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company_name?: string;
  position?: string;
  contact_person?: string;
  client_category: 'corporate' | 'one_time';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

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
  processed_at?: string;
  created_at: string;
  updated_at: string;
  coordinator?: User;
}

// Menu Item Types
export interface MenuItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Cart Item Types (alias for backward compatibility)
export type CartItem = MenuItem;

// Order Types
export interface Order {
  id: number;
  company_name: string;
  client_type?: 'corporate' | 'one_time';
  menu_items: MenuItem[];
  comment?: string;
  status: 'draft' | 'submitted' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  delivery_date?: string;
  delivery_time?: string;
  delivery_address?: string;
  coordinator_id?: number;
  coordinator?: User;
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
