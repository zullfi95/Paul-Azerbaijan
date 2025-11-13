/**
 * Status constants for the application
 * Centralized status definitions to replace magic strings
 */

// Order Statuses
export const ORDER_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Payment Statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CHARGED: 'charged',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CREDITED: 'credited'
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Application Statuses
export const APPLICATION_STATUS = {
  NEW: 'new',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

// User Statuses
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Status Labels (Russian)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.DRAFT]: 'Черновик',
  [ORDER_STATUS.SUBMITTED]: 'Отправлен',
  [ORDER_STATUS.PENDING_PAYMENT]: 'Ожидает оплаты',
  [ORDER_STATUS.PAID]: 'Оплачен',
  [ORDER_STATUS.PROCESSING]: 'В обработке',
  [ORDER_STATUS.COMPLETED]: 'Завершен',
  [ORDER_STATUS.CANCELLED]: 'Отменен'
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUS.NEW]: 'Новая',
  [APPLICATION_STATUS.PROCESSING]: 'В обработке',
  [APPLICATION_STATUS.APPROVED]: 'Одобрена',
  [APPLICATION_STATUS.REJECTED]: 'Отклонена'
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [USER_STATUS.ACTIVE]: 'Активный',
  [USER_STATUS.INACTIVE]: 'Неактивный',
  [USER_STATUS.SUSPENDED]: 'Заблокирован'
};

// Status Colors
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUS.DRAFT]: '#9CA3AF',        // gray
  [ORDER_STATUS.SUBMITTED]: '#3B82F6',    // blue
  [ORDER_STATUS.PENDING_PAYMENT]: '#F59E0B', // orange
  [ORDER_STATUS.PAID]: '#10B981',         // green
  [ORDER_STATUS.PROCESSING]: '#F59E0B',   // orange
  [ORDER_STATUS.COMPLETED]: '#10B981',    // green
  [ORDER_STATUS.CANCELLED]: '#EF4444'     // red
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUS.NEW]: '#3B82F6',       // blue
  [APPLICATION_STATUS.PROCESSING]: '#F59E0B', // orange
  [APPLICATION_STATUS.APPROVED]: '#10B981',   // green
  [APPLICATION_STATUS.REJECTED]: '#EF4444'    // red
};

// Calendar Cell Colors (lighter shades for backgrounds)
export const CALENDAR_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUS.DRAFT]: '#F3F4F6',        // light gray
  [ORDER_STATUS.SUBMITTED]: '#DBEAFE',    // light blue
  [ORDER_STATUS.PENDING_PAYMENT]: '#FED7AA', // light orange
  [ORDER_STATUS.PAID]: '#D1FAE5',         // light green
  [ORDER_STATUS.PROCESSING]: '#FEF3C7',   // light yellow
  [ORDER_STATUS.COMPLETED]: '#DCFCE7',    // light green
  [ORDER_STATUS.CANCELLED]: '#FEE2E2'     // light red
};

// Helper functions
export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] || status;
}

export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status as OrderStatus] || '#9CA3AF';
}

export function getApplicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status as ApplicationStatus] || status;
}

export function getApplicationStatusColor(status: string): string {
  return APPLICATION_STATUS_COLORS[status as ApplicationStatus] || '#3B82F6';
}

export function getCalendarCellColor(status: string): string {
  return CALENDAR_STATUS_COLORS[status as OrderStatus] || '#F0F9FF';
}

