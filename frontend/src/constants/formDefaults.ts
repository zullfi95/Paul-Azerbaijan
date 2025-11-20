/**
 * Default values for forms
 * Centralized default values to avoid duplication across components
 */

/**
 * Default user form data
 */
export const DEFAULT_USER_FORM = {
  name: '',
  email: '',
  password: '',
  user_type: 'client' as 'client' | 'staff',
  staff_role: 'observer' as 'coordinator' | 'observer',
  client_category: 'corporate' as 'corporate' | 'one_time',
  company_name: '',
  position: '',
  phone: '',
  address: '',
  status: 'active' as 'active' | 'inactive' | 'suspended'
} as const;

/**
 * Default order form data
 */
export const DEFAULT_ORDER_FORM = {
  client_id: undefined,
  company_name: '',
  menu_items: [],
  delivery_date: '',
  delivery_time: '',
  delivery_address: '',
  delivery_type: 'delivery' as 'delivery' | 'pickup' | 'buffet',
  kitchen_comment: '',
  operation_comment: '',
  desserts_comment: '',
  discount_fixed: 0,
  discount_percent: 0
} as const;

/**
 * Default application form data
 */
export const DEFAULT_APPLICATION_FORM = {
  first_name: '',
  last_name: '',
  company_name: '',
  phone: '',
  email: '',
  message: '',
  event_address: '',
  event_date: '',
  event_time: '',
  cart_items: []
} as const;

