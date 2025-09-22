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
export function isCoordinator(user: { user_type?: string; staff_role?: string }): boolean {
  console.log('🔍 Checking if coordinator:', {
    user,
    user_type: user?.user_type,
    staff_role: user?.staff_role,
    expected_staff_role: STAFF_ROLES.COORDINATOR,
    isStaff: user?.user_type === 'staff',
    isCoordinatorRole: user?.staff_role === STAFF_ROLES.COORDINATOR,
    result: user?.user_type === 'staff' && user?.staff_role === STAFF_ROLES.COORDINATOR
  });

  const result = user?.user_type === 'staff' &&
         user?.staff_role === STAFF_ROLES.COORDINATOR;

  console.log('🔍 isCoordinator final result:', result);
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
export function canManageOrders(user: { user_type?: string; staff_role?: string }): boolean {
  return isCoordinator(user) || 
         (isStaff(user) && (user?.staff_role === STAFF_ROLES.ADMIN || user?.staff_role === STAFF_ROLES.MANAGER));
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
export function canManageUsers(user: { user_type?: string; staff_role?: string }): boolean {
  return isCoordinator(user) || 
         (isStaff(user) && user?.staff_role === STAFF_ROLES.ADMIN);
}

/**
 * Проверка, может ли пользователь видеть календарь
 */
export function canViewCalendar(user: { user_type?: string; staff_role?: string }): boolean {
  return canManageOrders(user);
}

/**
 * Хук для проверки доступа с редиректом
 */
export function useAuthGuard(
  isAuthenticated: boolean,
  isLoading: boolean,
  user: { user_type?: string; staff_role?: string },
  requiredPermission: (user: { user_type?: string; staff_role?: string }) => boolean,
  router: { push: (path: string) => void; replace: (path: string) => void },
  redirectTo = '/auth/login'
): boolean {
  const shouldGoLogin = !isLoading && !isAuthenticated;
  const shouldGoHome = !isLoading && isAuthenticated && !requiredPermission(user);

  console.log('🛡️ AuthGuard check:', {
    isAuthenticated,
    isLoading,
    user,
    shouldGoLogin,
    shouldGoHome,
    hasRequiredPermission: requiredPermission(user),
    requiredPermissionName: requiredPermission.name
  });

  useEffect(() => {
    if (shouldGoLogin) {
      console.log('🚪 Redirecting to login:', redirectTo);
      router.replace(redirectTo);
    } else if (shouldGoHome) {
      console.log('🏠 Redirecting to home - insufficient permissions');
      router.replace('/');
    }
  }, [shouldGoLogin, shouldGoHome, router, redirectTo]);

  const finalResult = !isLoading && isAuthenticated && !shouldGoHome;
  console.log('🛡️ AuthGuard final result:', finalResult);

  return finalResult;
}
