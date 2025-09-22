/**
 * Переводы и цвета статусов заявок (applications)
 */

export const APPLICATION_STATUSES = {
  new: 'new',
  processing: 'processing',
  approved: 'approved',
  rejected: 'rejected',
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[keyof typeof APPLICATION_STATUSES];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUSES.new]: 'Новая',
  [APPLICATION_STATUSES.processing]: 'В обработке',
  [APPLICATION_STATUSES.approved]: 'Одобрена',
  [APPLICATION_STATUSES.rejected]: 'Отклонена',
};

export const APPLICATION_STATUS_BG_CLASSES: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUSES.new]: 'bg-blue-100 text-blue-800',
  [APPLICATION_STATUSES.processing]: 'bg-yellow-100 text-yellow-800',
  [APPLICATION_STATUSES.approved]: 'bg-green-100 text-green-800',
  [APPLICATION_STATUSES.rejected]: 'bg-red-100 text-red-800',
};

export function getApplicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status as ApplicationStatus] || status;
}

export function getApplicationStatusBgClass(status: string): string {
  return APPLICATION_STATUS_BG_CLASSES[status as ApplicationStatus] || 'bg-gray-100 text-gray-800';
}
