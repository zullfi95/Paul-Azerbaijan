// ===== TYPES =====

// Address Types
export interface Address {
  id: number;
  street: string;
  city: string;
  postal_code: string;
  country?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// User Types - единая модель для всех пользователей
export interface User {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  shipping_address?: string;
  company_name?: string;
  position?: string;
  staff_role?: string; // Для обратной совместимости
  contact_person?: string;
  email_verified_at?: string;
  user_type: 'client' | 'staff';
  client_category?: 'corporate' | 'one_time';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

// Application Types
export interface Application {
  id: number;
  first_name: string;
  last_name?: string;
  company_name?: string;
  contact_person?: string;
  email: string;
  phone: string;
  message?: string;
  event_address?: string;
  event_date?: string;
  event_time?: string;
  event_lat?: number;
  event_lng?: number;
  cart_items?: CartItem[] | null;
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
  quantity?: number;
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
  tags?: string[];
  allergens?: string[];
  nutrition_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

// Order Types
export interface Order {
  id: number;
  company_name: string;
  client_type?: 'corporate' | 'one_time';
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
  };
  employees?: Array<{
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  }>;
  menu_items: MenuItem[];
  comment?: string;
  status: 'draft' | 'submitted' | 'processing' | 'completed' | 'cancelled' | 'paid';
  payment_status?: 'pending' | 'authorized' | 'charged' | 'failed' | 'refunded' | 'credited';
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
    frequency?: 'weekly' | 'monthly';
    days?: string[];
    delivery_time?: string;
    notes?: string;
  };
  // Новые поля для совместимости с бекендом
  equipment_required?: number;
  staff_assigned?: number;
  special_instructions?: string;
  is_urgent?: boolean;
  application_id?: number;
  algoritma_order_id?: string;
  payment_url?: string;
  payment_attempts?: number;
  payment_details?: {
    method?: string;
    transaction_id?: string;
    gateway_response?: string;
    fees?: number;
  };
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
  last_name?: string;
  company_name?: string;
  contact_person?: string;
  phone: string;
  email: string;
  message?: string;
  event_address?: string;
  event_date?: string;
  event_time?: string;
  event_lat?: number;
  event_lng?: number;
  cart_items?: CartItem[];
  coordinator_id?: number;
  client_id?: number;
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
