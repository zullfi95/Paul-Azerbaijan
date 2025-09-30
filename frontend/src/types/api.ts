import { Order, Application, User, MenuItem, CartItem } from '../config/api';

// Response types for paginated data
export interface OrdersResponse {
  success: boolean;
  data: Order[];
  message?: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

// Request types for creating/updating orders
export interface OrderCreateRequest {
  client_type: 'corporate' | 'one_time';
  
  // Corporate client
  company_name?: string;
  employees?: Array<{
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  }>;
  
  // One-time client
  customer?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  
  // Common fields
  menu_items: CartItem[];
  comment?: string;
  delivery_date?: string;
  delivery_time?: string;
  delivery_type?: 'delivery' | 'pickup' | 'buffet';
  delivery_address?: string;
  delivery_cost?: number;
  
  // Discounts
  discount_fixed?: number;
  discount_percent?: number;
  
  // Recurring schedule
  recurring_schedule?: {
    enabled: boolean;
    frequency?: 'weekly' | 'monthly';
    days?: string[];
    delivery_time?: string;
    notes?: string;
  };
}

export interface OrderUpdateRequest extends Partial<OrderCreateRequest> {
  status?: 'draft' | 'submitted' | 'processing' | 'completed' | 'cancelled';
}

// Request types for creating/updating applications
export interface ApplicationCreateRequest {
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
  cart_items?: CartItem[];
}

export interface ApplicationUpdateRequest extends Partial<ApplicationCreateRequest> {
  status?: 'new' | 'processing' | 'approved' | 'rejected';
  coordinator_comment?: string;
}

// Request types for creating/updating users
export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  user_group: 'client' | 'staff';
  staff_role?: 'coordinator' | 'observer' | 'admin' | 'manager';
  client_category?: 'corporate' | 'one_time';
  company_name?: string;
  position?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
}

export interface UserUpdateRequest extends Partial<Omit<UserCreateRequest, 'password'>> {
  password?: string;
  status?: 'active' | 'inactive' | 'suspended';
}