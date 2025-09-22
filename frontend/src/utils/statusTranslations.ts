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
