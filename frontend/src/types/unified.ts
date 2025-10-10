// Унифицированные типы для всего приложения

// ===== USER TYPES =====
export type UserType = 'client' | 'staff';
export type StaffRole = 'coordinator' | 'observer';
export type ClientCategory = 'corporate' | 'one_time';
export type UserStatus = 'active' | 'inactive' | 'suspended';

// Единый интерфейс пользователя
export interface User {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  shipping_address?: ShippingAddress;
  company_name?: string;
  position?: string;
  contact_person?: string;
  email_verified_at?: string;
  user_type: UserType;
  staff_role?: StaffRole;
  client_category?: ClientCategory;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// ===== ADDRESS TYPES =====
export interface Address {
  id: number;
  user_id: number;
  type: 'billing' | 'shipping';
  street: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Shipping address as stored in backend (JSON field in users table)
export interface ShippingAddress {
  street: string;
  city: string;
  postal_code: string;
}

// ===== MENU TYPES =====
export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  activeMenuItems?: MenuItem[];
  iiko_id?: string;
  organization_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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

// ===== APPLICATION TYPES =====
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

export interface Application {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  event_time: string;
  guest_count: number;
  budget?: number;
  special_requirements?: string;
  status: ApplicationStatus;
  client_id: number;
  coordinator_id?: number;
  created_at: string;
  updated_at: string;
  client?: User;
  coordinator?: User;
}

// ===== ORDER TYPES =====
export type OrderStatus = 'draft' | 'submitted' | 'processing' | 'completed' | 'cancelled';

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
  status: OrderStatus;
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
  preparation_timeline?: {
    start_time?: string;
    end_time?: string;
    stages?: Array<{
      name: string;
      duration: number;
      responsible?: string;
    }>;
  };
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

// ===== CART TYPES =====
export interface CartItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  quantity: number;
  notes?: string;
  persons?: number;
  category?: string;
  available?: boolean;
  isSet?: boolean;
  // Optional MenuItem properties for compatibility
  currency?: string;
  allergens?: string[];
  is_available?: boolean;
  sort_order?: number;
  iiko_id?: string;
  menu_category_id?: number;
  organization_id?: string;
}

// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: number;
  user_id: number;
  type: 'order_update' | 'application_update' | 'payment_update' | 'system';
  title: string;
  message: string;
  data?: Record<string, string | number | boolean | object>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = object> {
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

// ===== FORM TYPES =====
export interface UserFormData {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  position: string;
  contact_person: string;
}

export interface OrderFormData {
  company_name: string;
  client_type: 'corporate' | 'one_time';
  customer: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    position?: string;
  };
  employees: {
    count: number;
    roles: string[];
    dietary_requirements: string[];
  };
  delivery_date: string;
  delivery_time: string;
  delivery_type: 'delivery' | 'pickup' | 'buffet';
  delivery_address: string;
  special_instructions?: string;
  recurring_schedule: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly';
    days: string[];
    delivery_time: string;
    notes: string;
  };
}

// ===== ERROR TYPES =====
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
