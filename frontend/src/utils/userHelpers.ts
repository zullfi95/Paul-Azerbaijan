/**
 * User helper utilities
 * Provides helper functions for user-related operations
 */

import { User } from '../types/common';

/**
 * Empty user object for fallback scenarios
 */
export const EMPTY_USER = { user_type: '', staff_role: '' } as const;

/**
 * Get human-readable display name for user role
 */
export function getDisplayRole(user: User | null | undefined): string {
  if (!user) return 'Пользователь';
  
  if (user.user_type === 'staff') {
    switch (user.staff_role) {
      case 'coordinator':
        return 'Координатор';
      case 'observer':
        return 'Наблюдатель';
      case 'chef':
        return 'Шеф-повар';
      case 'operations_manager':
        return 'Операционный менеджер';
      default:
        return 'Сотрудник';
    }
  }
  
  if (user.user_type === 'client') {
    if (user.client_category === 'corporate') {
      return 'Корпоративный клиент';
    }
    if (user.client_category === 'one_time') {
      return 'Разовый клиент';
    }
    return 'Клиент';
  }
  
  return 'Пользователь';
}

/**
 * Get short role label for display in compact spaces
 */
export function getShortRoleLabel(user: User | null | undefined): string {
  if (!user) return '';
  
  if (user.user_type === 'staff') {
    switch (user.staff_role) {
      case 'coordinator':
        return 'Координатор';
      case 'observer':
        return 'Наблюдатель';
      case 'chef':
        return 'Шеф';
      case 'operations_manager':
        return 'Операц. менеджер';
      default:
        return 'Сотрудник';
    }
  }
  
  return user.client_category === 'corporate' ? 'Корпоративный' : 'Разовый';
}

/**
 * Check if user is active
 */
export function isUserActive(user: User | null | undefined): boolean {
  return user?.status === 'active';
}

/**
 * Get user full name
 */
export function getUserFullName(user: User | null | undefined): string {
  if (!user) return '';
  
  if (user.last_name) {
    return `${user.name} ${user.last_name}`.trim();
  }
  
  return user.name || '';
}

/**
 * Get user display name with role
 */
export function getUserDisplayWithRole(user: User | null | undefined): string {
  const name = getUserFullName(user);
  const role = getShortRoleLabel(user);
  
  if (name && role) {
    return `${name} (${role})`;
  }
  
  return name || role || 'Пользователь';
}

