import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
    Application,
    CartItem,
    User,
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

const extractDatePart = (value?: string | null): string => {
    if (!value) return '';
    if (value.includes('T')) {
        return value.split('T')[0];
    }
    if (value.includes(' ')) {
        return value.split(' ')[0];
    }
    return value;
};

const extractTimePart = (value?: string | null): string => {
    if (!value) return '';
    if (value.includes('T')) {
        const timePart = value.split('T')[1];
        return timePart ? timePart.slice(0, 5) : '';
    }
    if (value.includes(' ')) {
        const timePart = value.split(' ')[1];
        return timePart ? timePart.slice(0, 5) : '';
    }
    return value.slice(0, 5);
};

const normalizeCartItems = (cartItems: any[] | undefined | null): CartItem[] => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return [];
    }
    return cartItems.map((item, index) => ({
        id: (item?.id ?? `application-item-${index}`).toString(),
        name: item?.name || `Позиция ${index + 1}`,
        description: item?.description || '',
        image: item?.image || '',
        category: item?.category || 'application',
        available: typeof item?.available === 'boolean' ? item.available : true,
        isSet: typeof item?.isSet === 'boolean' ? item.isSet : false,
        price: item?.price ? Number(item.price) : 0,
        quantity: item?.quantity ? Number(item.quantity) : 1,
        ...item,
    }));
};

export const useOrderForm = () => {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromApplicationId = searchParams.get('fromApplication');

    const [loading, setLoading] = useState(false);
    const [application, setApplication] = useState<Application | null>(null);
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
            const result = await makeApiRequest<{ data: User[] }>('/clients');
            return result.success ? result.data?.data || [] : [];
        },
        staleTime: 10 * 60 * 1000,
    });

    const { data: menuItems = [], isLoading: isLoadingMenuItems } = useQuery<CartItem[]>({
        queryKey: queryKeys.menu.items(user?.id?.toString()),
        queryFn: async () => {
            const result = await makeApiRequest<{ data: CartItem[] }>('/menu/items');
            if (result.success && result.data) {
                const items = result.data.data || result.data || [];
                return Array.isArray(items) ? items : [];
            }
            return [];
        },
        enabled: !!user,
        staleTime: 15 * 60 * 1000,
    });

    const addMenuItem = useCallback((item: CartItem) => {
        setFormData(prev => {
            const existingItem = prev.menu_items.find(menuItem => menuItem.id === item.id);
            if (existingItem) {
                return {
                    ...prev,
                    menu_items: prev.menu_items.map(menuItem =>
                        menuItem.id === item.id
                            ? { ...menuItem, quantity: (menuItem.quantity ?? 0) + 1 }
                            : menuItem
                    ),
                };
            } else {
                return {
                    ...prev,
                    menu_items: [...prev.menu_items, { ...item, quantity: 1 }],
                };
            }
        });
    }, []);

    const updateMenuItemQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            setFormData(prev => ({
                ...prev,
                menu_items: prev.menu_items.filter(item => item.id !== itemId),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                menu_items: prev.menu_items.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                ),
            }));
        }
    }, []);

    const removeMenuItem = useCallback((itemId: string) => {
        setFormData(prev => ({
            ...prev,
            menu_items: prev.menu_items.filter(item => item.id !== itemId),
        }));
    }, []);

    useEffect(() => {
        if (!fromApplicationId) {
            setApplication(null);
            return;
        }
        let isCancelled = false;
        const loadApplication = async () => {
            setLoading(true);
            try {
                const result = await makeApiRequest<{ application?: Application } | Application>(`/applications/${fromApplicationId}`);
                if (result.success && result.data && !isCancelled) {
                    const app: Application = (result.data as any)?.application || (result.data as Application);
                    if (!app) {
                        console.error('❌ Заявка не найдена в ответе API');
                        return;
                    }
                    setApplication(app);
                    const normalizedItems = normalizeCartItems(app.cart_items);
                    setFormData(prev => ({
                        ...prev,
                        selected_client_id: app.client_id ?? prev.selected_client_id,
                        comment: app.message || prev.comment,
                        delivery_date: extractDatePart(app.event_date) || prev.delivery_date,
                        delivery_time: extractTimePart(app.event_time) || prev.delivery_time,
                        delivery_address: app.event_address || prev.delivery_address,
                        menu_items: normalizedItems.length > 0 ? normalizedItems : [],
                        application_id: app.id || null,
                        company_name: app.company_name || prev.company_name,
                        client_type: prev.client_type || 'one_time',
                    }));
                } else {
                    console.error('❌ Не удалось загрузить заявку:', result);
                }
            } catch (error) {
                console.error('❌ Ошибка загрузки заявки:', error);
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };
        loadApplication();
        return () => {
            isCancelled = true;
        };
    }, [fromApplicationId]);

    useEffect(() => {
        if (!application || !fromApplicationId) return;
        if (formData.selected_client_id) return;
        if (!clients || clients.length === 0) return;
        const matchedClient = application.client_id
            ? clients.find(c => c.id === application.client_id)
            : application.email
                ? clients.find(c => c.email === application.email)
                : null;
        if (matchedClient) {
            setFormData(prev => ({
                ...prev,
                selected_client_id: matchedClient.id,
                client_type: matchedClient.client_category || prev.client_type,
                company_name: prev.company_name || matchedClient.company_name || prev.company_name,
            }));
        }
    }, [application, clients, formData.selected_client_id, fromApplicationId]);

    const handleInputChange = (field: keyof OrderFormData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRecurringChange = (field: keyof OrderFormData['recurring_schedule'], value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            recurring_schedule: {
                ...prev.recurring_schedule,
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.menu_items || formData.menu_items.length === 0) {
            alert('Необходимо выбрать хотя бы один товар из меню');
            return;
        }
        if (!fromApplicationId && !formData.selected_client_id) {
            alert('Необходимо выбрать клиента для заказа');
            return;
        }
        if (formData.delivery_date) {
            const selectedDate = new Date(formData.delivery_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                alert('Дата доставки должна быть сегодня или позже');
                return;
            }
        }
        setLoading(true);
        const { selected_client_id, ...restFormData } = formData;
        const payload = {
            ...restFormData,
            client_id: selected_client_id,
            menu_items: formData.menu_items.map(item => ({
                ...item,
                id: item.id.toString(),
            })),
        };
        try {
            let result;
            if (fromApplicationId && formData.application_id) {
                result = await makeApiRequest(`/applications/${fromApplicationId}/create-order`, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            } else {
                result = await makeApiRequest('/orders', {
                    method: 'POST',
                    body: JSON.stringify(payload),
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
