// Query Keys для React Query
// Централизованное управление ключами запросов для лучшего кэширования

export const queryKeys = {
  // Пользователи
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, string | number | boolean>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },

  // Профиль пользователя
  user: {
    all: ['user'] as const,
    addresses: (userId?: number) => [...queryKeys.user.all, 'addresses', userId] as const,
  },

  // Заказы
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, string | number | boolean>) => [...queryKeys.orders.lists(), { filters }] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.orders.details(), id] as const,
    active: (userId?: number) => [...queryKeys.orders.all, 'active', userId] as const,
  },

  // Заявки
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters: Record<string, string | number | boolean>) => [...queryKeys.applications.lists(), { filters }] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.applications.details(), id] as const,
  },

  // Клиенты
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters: Record<string, string | number | boolean>) => [...queryKeys.clients.lists(), { filters }] as const,
  },

  // Меню
  menu: {
    all: ['menu'] as const,
    items: (organizationId?: string) => [...queryKeys.menu.all, 'items', organizationId] as const,
    categories: () => [...queryKeys.menu.all, 'categories'] as const,
  },

  // Уведомления
  notifications: {
    all: ['notifications'] as const,
    unreadCount: (userId?: number) => [...queryKeys.notifications.all, 'unreadCount', userId] as const,
  },

  // Профиль пользователя
  profile: {
    all: ['profile'] as const,
    user: (userId?: number) => [...queryKeys.profile.all, 'user', userId] as const,
  },
} as const;

// Типы для TypeScript
export type QueryKeys = typeof queryKeys;
