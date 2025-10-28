import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  Application,
  CartItem,
  User,
  Order,
  Address,
} from '../types/common';
import { makeApiRequest } from '../utils/apiHelpers';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';

interface OrderFormData {
  selected_client_id: number | null;
  menu_items: CartItem[];
  comment: string;
  delivery_date: string;
  delivery_time: string;
  delivery_type: 'delivery' | 'pickup' | 'buffet';
  delivery_address: string;
  delivery_cost: number;
  discount_fixed: number;
  discount_percent: number;
  client_type: 'corporate' | 'one_time';
  company_name?: string;
  recurring_schedule: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly';
    days: string[];
    delivery_time: string;
    notes: string;
  };
  equipment_required: number;
  staff_assigned: number;
  special_instructions: string;
  application_id: number | null;
}

export const useOrderForm = () => {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromApplicationId = searchParams.get('fromApplication');

    const [loading, setLoading] = useState(false);
    // const [clients, setClients] = useState<User[]>([]); // Will be replaced by useQuery
    const [application, setApplication] = useState<Application | null>(null);
    // const [menuItems, setMenuItems] = useState<CartItem[]>([]); // Will be replaced by useQuery
    const [formData, setFormData] = useState<OrderFormData>({
        selected_client_id: null,
        menu_items: [],
        comment: '',
        delivery_date: '',
        delivery_time: '',
        delivery_type: 'delivery',
        delivery_address: '',
        delivery_cost: 0,
        discount_fixed: 0,
        discount_percent: 0,
        client_type: 'one_time',
        company_name: '',
        recurring_schedule: {
            enabled: false,
            frequency: 'weekly',
            days: [],
            delivery_time: '',
            notes: ''
        },
        equipment_required: 0,
        staff_assigned: 0,
        special_instructions: '',
        application_id: null,
    });

    const { data: clients = [], isLoading: isLoadingClients } = useQuery<User[]>({
        queryKey: queryKeys.clients.lists(),
        queryFn: async () => {
            const result = await makeApiRequest<{data: User[]}>('/clients');
            return result.success ? result.data?.data || [] : [];
        },
        staleTime: 10 * 60 * 1000, // 10 минут
    });

    const { data: menuItems = [], isLoading: isLoadingMenuItems } = useQuery<CartItem[]>({
        queryKey: queryKeys.menu.items(user?.id?.toString()),
        queryFn: async () => {
            const organizationId = (user && 'organization_id' in user) ? (user as User & { organization_id: string }).organization_id : 'default';
            const result = await makeApiRequest<{data: CartItem[]}>(`/menu/items?organization_id=${organizationId}`);
            return result.success ? result.data?.data || [] : [];
        },
        enabled: !!user, // Only run query if user is available
        staleTime: 15 * 60 * 1000, // 15 минут
    });


    const addMenuItem = useCallback((item: CartItem) => {
        setFormData(prev => {
            const existingItem = prev.menu_items.find(menuItem => menuItem.id === item.id);
            if (existingItem) {
                return {
                    ...prev,
                    menu_items: prev.menu_items.map(menuItem =>
                        menuItem.id === item.id
                            ? { ...menuItem, quantity: menuItem.quantity + 1 }
                            : menuItem
                    )
                };
            } else {
                return {
                    ...prev,
                    menu_items: [...prev.menu_items, { ...item, quantity: 1 }]
                };
            }
        });
    }, []);

    const updateMenuItemQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            setFormData(prev => ({
                ...prev,
                menu_items: prev.menu_items.filter(item => item.id !== itemId)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                menu_items: prev.menu_items.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                )
            }));
        }
    }, []);

    const removeMenuItem = useCallback((itemId: string) => {
        setFormData(prev => ({
            ...prev,
            menu_items: prev.menu_items.filter(item => item.id !== itemId)
        }));
    }, []);

    const loadApplication = useCallback(async (clientId: string) => {
        setLoading(true);
        try {
            const result = await makeApiRequest<Application>(`/applications/${clientId}`);
            if (result.success && result.data) {
                const app = result.data;
                setApplication(app);
                setFormData(prev => ({
                    ...prev,
                    selected_client_id: app.client_id || null,
                    comment: app.message || '',
                    delivery_date: app.event_date ? new Date(app.event_date).toISOString().split('T')[0] : '',
                    delivery_time: app.event_time ? new Date(app.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    delivery_address: app.event_address || '',
                    menu_items: app.cart_items || [],
                    application_id: app.id || null,
                }));

                if (app.client_id) {
                    const selectedClient = clients.find(c => c.id === app.client_id);
                    if (selectedClient) {
                        setFormData(prev => ({ ...prev, client_type: selectedClient.client_category || 'one_time' }));
                    }
                }
                
                if (!app.client_id && app.email) {
                    const foundClient = clients.find(c => c.email === app.email);
                    if (foundClient) {
                        setFormData(prev => ({ 
                            ...prev, 
                            selected_client_id: foundClient.id,
                            client_type: foundClient.client_category || 'one_time',
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки заявки:', error);
        } finally {
            setLoading(false);
        }
    }, [clients]);
    
    useEffect(() => {
        if (fromApplicationId && clients.length > 0) {
            loadApplication(fromApplicationId);
        }
    }, [fromApplicationId, loadApplication, clients]);

    const handleInputChange = (field: keyof OrderFormData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRecurringChange = (field: keyof OrderFormData['recurring_schedule'], value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            recurring_schedule: {
                ...prev.recurring_schedule,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Валидация даты доставки
        if (formData.delivery_date) {
            const selectedDate = new Date(formData.delivery_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                alert('Дата доставки должна быть сегодня или позже');
                setLoading(false);
                return;
            }
        }

        const selectedClient = clients.find(c => c.id === formData.selected_client_id);
        const payload = {
            ...formData,
            client_id: formData.selected_client_id,
            // Бэкенд использует client_category из базы данных, а не client_type из фронтенда
            // Преобразуем ID в строки для совместимости с бэкендом
            menu_items: formData.menu_items.map(item => ({
                ...item,
                id: item.id.toString()
            }))
        };
        // @ts-expect-error - selected_client_id is intentionally removed
        delete payload.selected_client_id;

        try {
            let result;
            
            // Если создаем заказ из заявки, используем специальный endpoint
            if (fromApplicationId && formData.application_id) {
                result = await makeApiRequest(`/applications/${fromApplicationId}/create-order`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            } else {
                // Обычное создание заказа
                result = await makeApiRequest('/orders', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }
            
            if (result.success) {
                router.push('/dashboard/orders');
            } else {
                const errorMessage = result.message || JSON.stringify(result.errors) || 'Проверьте данные и попробуйте снова';
                alert('Ошибка создания заказа: ' + errorMessage);
            }
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            alert('Ошибка создания заказа: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    return {
        loading: loading || isLoadingClients || isLoadingMenuItems,
        clients,
        application,
        formData,
        menuItems,
        fromApplicationId,
        setFormData,
        addMenuItem,
        updateMenuItemQuantity,
        removeMenuItem,
        handleInputChange,
        handleRecurringChange,
        handleSubmit,
    };
};
