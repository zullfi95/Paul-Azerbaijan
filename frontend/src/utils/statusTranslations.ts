/**
 * Словарь переводов статусов заказов
 */

export const ORDER_STATUSES = {
  draft: 'draft',
  submitted: 'submitted', 
  processing: 'processing',
  completed: 'completed',
  cancelled: 'cancelled'
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.draft]: 'Черновик',
  [ORDER_STATUSES.submitted]: 'Отправлен',
  [ORDER_STATUSES.processing]: 'В обработке',
  [ORDER_STATUSES.completed]: 'Завершен',
  [ORDER_STATUSES.cancelled]: 'Отменен'
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.draft]: '#6B7280',
  [ORDER_STATUSES.submitted]: '#3B82F6',
  [ORDER_STATUSES.processing]: '#F59E0B',
  [ORDER_STATUSES.completed]: '#10B981',
  [ORDER_STATUSES.cancelled]: '#EF4444'
};

export const STATUS_BG_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.draft]: 'bg-gray-100 text-gray-800',
  [ORDER_STATUSES.submitted]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.processing]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.completed]: 'bg-green-100 text-green-800',
  [ORDER_STATUSES.cancelled]: 'bg-red-100 text-red-800'
};

/**
 * Получить перевод статуса
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as OrderStatus] || status;
}

/**
 * Получить цвет статуса
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as OrderStatus] || '#6B7280';
}

/**
 * Получить CSS классы для статуса
 */
export function getStatusBgColor(status: string): string {
  return STATUS_BG_COLORS[status as OrderStatus] || 'bg-gray-100 text-gray-800';
}

/**
 * Словарь переводов статусов заявок
 */

export const APPLICATION_STATUSES = {
  new: 'new',
  processing: 'processing',
  approved: 'approved',
  rejected: 'rejected'
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[keyof typeof APPLICATION_STATUSES];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUSES.new]: 'Новая',
  [APPLICATION_STATUSES.processing]: 'В обработке',
  [APPLICATION_STATUSES.approved]: 'Одобрена',
  [APPLICATION_STATUSES.rejected]: 'Отклонена'
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUSES.new]: '#3B82F6',
  [APPLICATION_STATUSES.processing]: '#F59E0B',
  [APPLICATION_STATUSES.approved]: '#10B981',
  [APPLICATION_STATUSES.rejected]: '#EF4444'
};

/**
 * Словарь переводов статусов пользователей
 */

export const USER_STATUSES = {
  active: 'active',
  inactive: 'inactive',
  suspended: 'suspended'
} as const;

export type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [USER_STATUSES.active]: 'Активен',
  [USER_STATUSES.inactive]: 'Неактивен',
  [USER_STATUSES.suspended]: 'Заблокирован'
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  [USER_STATUSES.active]: '#10B981',
  [USER_STATUSES.inactive]: '#6B7280',
  [USER_STATUSES.suspended]: '#EF4444'
};