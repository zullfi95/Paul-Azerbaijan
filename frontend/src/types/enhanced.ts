/**
 * Расширенные типы для системы PAUL Catering
 * Импортируем базовые типы из statusTranslations
 */

import { 
  OrderStatus, 
  ApplicationStatus, 
  UserStatus 
} from '../utils/statusTranslations';

import {
  User as BaseUser,
  Order as BaseOrder,
  Application as BaseApplication,
  Notification as BaseNotification,
  MenuItem as BaseMenuItem,
  PaginatedResponse as BasePaginatedResponse,
} from './common';

// Типы ролей пользователей (соответствуют Backend)
export type UserRole = 'staff' | 'client';
export type StaffRole = 'coordinator' | 'observer';
export type ClientCategory = 'corporate' | 'one_time';

// Типы групп пользователей (соответствуют Backend)
export type UserGroup = 'staff' | 'client';

// Интерфейс для BEO
export interface BEO {
  id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  venue: string;
  guest_count: number;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  special_instructions?: string;
  setup_requirements?: string;
  dietary_restrictions?: string;
  order_id: string;
  created_at: string;
  updated_at: string;
}

// Интерфейс для секций BEO
export interface BEOSection {
  id: string;
  beo_id: string;
  title: string;
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// Расширенный интерфейс заказа
export interface Order extends BaseOrder {
  status: OrderStatus;
}

// Интерфейс для категорий меню
export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// Расширенный интерфейс пользователя
export interface User extends BaseUser {
  user_type: UserType;
  staff_role?: StaffRole;
  client_category?: ClientCategory;
  status: UserStatus;
}

// Интерфейс для заявок
export interface Application extends BaseApplication {
  status: ApplicationStatus;
}

// Интерфейс для уведомлений
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Интерфейс для сессий
export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Типы для фильтрации
export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  client_type?: ClientCategory;
}

export interface UserFilters {
  search?: string;
  user_type?: UserType;
  status?: UserStatus;
  staff_role?: StaffRole;
}

export interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus;
  date_from?: string;
  date_to?: string;
}

// Типы для сортировки
export type SortOrder = 'asc' | 'desc';
export type OrderSortField = 'id' | 'company_name' | 'created_at' | 'total_amount' | 'status';
export type UserSortField = 'id' | 'name' | 'email' | 'created_at' | 'status';
export type ApplicationSortField = 'id' | 'company_name' | 'created_at' | 'status';

// Интерфейсы для группировки
export interface GroupedOrders {
  [key: string]: Order[];
}

export interface GroupedUsers {
  [key: string]: User[];
}

export interface GroupedApplications {
  [key: string]: Application[];
}

// Типы для аналитики
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByClientType: Record<ClientCategory, number>;
  ordersByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  topClients: Array<{
    company_name: string;
    order_count: number;
    total_revenue: number;
  }>;
  popularItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

// Типы для форм
export interface OrderFormData {
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
  guest_count: number;
  special_instructions?: string;
  setup_requirements?: string;
  dietary_restrictions?: string;
  menu_items: Array<{
    id: number;
    quantity: number;
    price: number;
  }>;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  user_type: UserType;
  staff_role?: StaffRole;
  client_category?: ClientCategory;
  status: UserStatus;
}

export interface ApplicationFormData {
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  event_date: string;
  event_time: string;
  venue: string;
  guest_count: number;
  special_requirements?: string;
}

// ApiResponse импортируется из config/api.ts (не используется в этом файле)
// import { ApiResponse } from '../config/api';

export interface PaginatedResponse<T> extends BasePaginatedResponse<T> {}

// Типы для модальных окон
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Типы для контекста аутентификации
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canManageOrders: boolean;
  canViewCalendar: boolean;
  canManageUsers: boolean;
}

// Типы для хуков
export interface UseAuthGuardOptions {
  redirectTo?: string;
  requiredPermissions?: string[];
}

// Типы для утилит
export interface DebounceOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}
