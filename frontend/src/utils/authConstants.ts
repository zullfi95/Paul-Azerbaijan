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
  ADMIN: 'admin',
  MANAGER: 'manager'
} as const;

export type UserGroup = typeof USER_GROUPS[keyof typeof USER_GROUPS];
export type StaffRole = typeof STAFF_ROLES[keyof typeof STAFF_ROLES];

/**
 * Проверка, является ли пользователь координатором
 */
export function isCoordinator(user: { user_type?: string; position?: string; staff_role?: string }): boolean {

  const result = user?.user_type === 'staff' &&
         (user?.position === 'coordinator' || user?.staff_role === STAFF_ROLES.COORDINATOR);

  return result;
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
export function canManageOrders(user: { user_type?: string; position?: string; staff_role?: string }): boolean {
  return isCoordinator(user) || 
         (isStaff(user) && (user?.position === 'admin' || user?.position === 'manager' || user?.staff_role === STAFF_ROLES.ADMIN || user?.staff_role === STAFF_ROLES.MANAGER));
}

/**
 * Проверка, может ли пользователь создавать заказы
 */
export function canCreateOrders(user: { user_type?: string }): boolean {
  return isCoordinator(user) || isClient(user);
}

/**
 * Проверка, может ли пользователь управлять пользователями
 */
export function canManageUsers(user: { user_type?: string; position?: string; staff_role?: string }): boolean {
  return isCoordinator(user) || 
         (isStaff(user) && (user?.position === 'admin' || user?.staff_role === STAFF_ROLES.ADMIN));
}

/**
 * Проверка, может ли пользователь видеть календарь
 */
export function canViewCalendar(user: { user_type?: string; position?: string; staff_role?: string }): boolean {
  return canManageOrders(user);
}

/**
 * Проверка, может ли пользователь управлять меню
 */
export function canManageMenu(user: { user_type?: string; position?: string; staff_role?: string }): boolean {
  return isCoordinator(user) || 
         (isStaff(user) && (user?.position === 'admin' || user?.staff_role === STAFF_ROLES.ADMIN));
}

/**
 * Хук для проверки доступа с редиректом
 */
export function useAuthGuard(
  isAuthenticated: boolean,
  isLoading: boolean,
  user: { user_type?: string; position?: string; staff_role?: string },
  requiredPermission: (user: { user_type?: string; position?: string; staff_role?: string }) => boolean,
  router: { push: (path: string) => void; replace: (path: string) => void },
  redirectTo = '/auth/login'
): boolean {
  const shouldGoLogin = !isLoading && !isAuthenticated;
  const shouldGoHome = !isLoading && isAuthenticated && !requiredPermission(user);


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
