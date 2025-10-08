import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import { makeApiRequest } from '../utils/apiHelpers';
import {
  User,
  Order,
  Application,
  CartItem,
  Address,
} from '../types/common';
import { API_CONFIG, getAuthHeaders } from '../config/api';

// Хуки для пользователей
export const useUsers = (filters?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters || {}),
    queryFn: async () => {
      const result = await makeApiRequest<{data: User[]}>('users');
      return result.success ? result.data?.data || [] : [];
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const result = await makeApiRequest<User>(`users/${id}`);
      return result.success ? result.data : null;
    },
    enabled: !!id,
  });
};

// Хуки для заказов
export const useOrders = (filters?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filters || {}),
    queryFn: async () => {
      const result = await makeApiRequest<{data: Order[]}>('orders');
      return result.success ? result.data?.data || [] : [];
    },
    staleTime: 2 * 60 * 1000, // 2 минуты для заказов
  });
};

export const useActiveOrders = (userId?: number) => {
  return useQuery({
    queryKey: queryKeys.orders.active(userId),
    queryFn: async () => {
      const result = await makeApiRequest<{data: Order[]}>('client/orders/active');
      return result.success ? result.data?.data || [] : [];
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 минута для активных заказов
  });
};

// Хуки для заявок
export const useApplications = (filters?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: queryKeys.applications.list(filters || {}),
    queryFn: async () => {
      const result = await makeApiRequest<{data: Application[]}>('applications');
      return result.success ? result.data?.data || [] : [];
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const useApplication = (id: number) => {
  return useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: async () => {
      const result = await makeApiRequest<Application>(`applications/${id}`);
      return result.success ? result.data : null;
    },
    enabled: !!id,
  });
};

// Хуки для клиентов
export const useClients = (filters?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: queryKeys.clients.list(filters || {}),
    queryFn: async () => {
      const result = await makeApiRequest<{data: User[]}>('clients');
      return result.success ? result.data?.data || [] : [];
    },
    staleTime: 10 * 60 * 1000, // 10 минут для клиентов
  });
};

// Хуки для меню
export const useMenuItems = (organizationId?: string) => {
  return useQuery({
    queryKey: queryKeys.menu.items(organizationId),
    queryFn: async () => {
      const url = organizationId 
        ? `menu/items?organization_id=${organizationId}`
        : 'menu/items';
      const result = await makeApiRequest<{data: CartItem[]}>(url);
      return result.success ? result.data?.data || [] : [];
    },
    staleTime: 15 * 60 * 1000, // 15 минут для меню
  });
};

// Хуки для уведомлений
export const useUnreadNotificationsCount = (userId?: number) => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(userId),
    queryFn: async () => {
      const result = await makeApiRequest<{data: {unread_count: number}}>('client/notifications/unread-count');
      return result.success ? result.data?.data.unread_count || 0 : 0;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 секунд для уведомлений
    refetchInterval: 60 * 1000, // Обновление каждую минуту
  });
};

// Мутации
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: Partial<Order>) => {
      const result = await makeApiRequest('orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      return result;
    },
    onSuccess: () => {
      // Инвалидируем кэш заказов
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Application> }) => {
      const result = await makeApiRequest(`applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return result;
    },
    onSuccess: (_, { id }) => {
      // Инвалидируем кэш заявок
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(id) });
    },
  });
};
