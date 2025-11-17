/**
 * Константы авторизации и ролей
 * USER_GROUPS оставлены для совместимости, но теперь используется user_type из API
 */
import { useEffect } from 'react';

export const USER_GROUPS = {
  STAFF: 'staff',
  CLIENT: 'client'
} as const;

export const STAFF_ROLES = {
  COORDINATOR: 'coordinator',
  OBSERVER: 'observer',
  CHEF: 'chef',
  OPERATIONS_MANAGER: 'operations_manager'
} as const;

export type UserGroup = typeof USER_GROUPS[keyof typeof USER_GROUPS];
export type StaffRole = typeof STAFF_ROLES[keyof typeof STAFF_ROLES];

/**
 * Проверка, является ли пользователь координатором
 */
export function isCoordinator(user: { user_type?: string; staff_role?: string }): boolean {
  return user?.user_type === 'staff' && user?.staff_role === STAFF_ROLES.COORDINATOR;
}

/**
 * Проверка, является ли пользователь наблюдателем
 */
export function isObserver(user: { user_type?: string; staff_role?: string }): boolean {
  return user?.user_type === 'staff' && user?.staff_role === STAFF_ROLES.OBSERVER;
}

/**
 * Проверка, является ли пользователь сотрудником
 */
export function isStaff(user: { user_type?: string }): boolean {
  return user?.user_type === 'staff';
}

/**
 * Проверка, является ли пользователь клиентом
 */
export function isClient(user: { user_type?: string }): boolean {
  return user?.user_type === 'client';
}

/**
 * Проверка, имеет ли пользователь доступ к управлению заказами
 */
export function canManageOrders(user: { user_type?: string; staff_role?: string }): boolean {
  return isCoordinator(user);
}

/**
 * Проверка, может ли пользователь создавать заказы
 */
export function canCreateOrders(user: { user_type?: string; staff_role?: string }): boolean {
  return isCoordinator(user) || isClient(user);
}

/**
 * Проверка, может ли пользователь управлять пользователями
 */
export function canManageUsers(user: { user_type?: string; staff_role?: string }): boolean {
  return isCoordinator(user);
}

/**
 * Проверка, может ли пользователь видеть календарь
 */
export function canViewCalendar(user: { user_type?: string; staff_role?: string }): boolean {
  return isStaff(user);
}

/**
 * Проверка, может ли пользователь управлять меню
 */
export function canManageMenu(user: { user_type?: string; staff_role?: string }): boolean {
  return isCoordinator(user);
}

/**
 * Проверка, может ли пользователь просматривать данные кухни
 */
export function canViewKitchen(user: { user_type?: string; staff_role?: string }): boolean {
  return isObserver(user) || isCoordinator(user);
}

/**
 * Хук для проверки доступа с редиректом
 */
export function useAuthGuard(
  isAuthenticated: boolean,
  isLoading: boolean,
  user: { user_type?: string; staff_role?: string } | null,
  requiredPermission: (user: { user_type?: string; staff_role?: string }) => boolean,
  router: { push: (path: string) => void; replace: (path: string) => void },
  redirectTo = '/auth/login'
): boolean {
  const shouldGoLogin = !isLoading && !isAuthenticated;
  const shouldGoHome = !isLoading && isAuthenticated && !requiredPermission(user || { user_type: '', staff_role: '' });


  useEffect(() => {
    if (shouldGoLogin) {
      router.replace(redirectTo);
    } else if (shouldGoHome) {
      router.replace('/');
    }
  }, [shouldGoLogin, shouldGoHome, router, redirectTo]);

  const finalResult = !isLoading && isAuthenticated && !shouldGoHome;

  return finalResult;
}
