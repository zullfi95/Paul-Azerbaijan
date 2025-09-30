"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Application, CartItem, User } from "../config/api";
import { makeApiRequest } from "../utils/apiHelpers";
import { useAuthGuard, canCreateOrders } from "../utils/authConstants";
import { ChevronDown, Calendar, Clock, Info, AlertTriangle, Plus, Search, X, ShoppingCart } from 'lucide-react';

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
  // Новые поля
  equipment_required: number;
  staff_assigned: number;
  special_instructions: string;
  application_id: number | null;
}

export default function CreateOrderForm() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromApplicationId = searchParams.get('fromApplication');

    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<User[]>([]);
    const [application, setApplication] = useState<Application | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPreview, setShowPreview] = useState(false);
    
    // Состояния для меню
    const [menuItems, setMenuItems] = useState<CartItem[]>([]);
    const [menuSearch, setMenuSearch] = useState('');
    const [showMenuModal, setShowMenuModal] = useState(false);
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
        // Новые поля
        equipment_required: 0,
        staff_assigned: 0,
        special_instructions: '',
        application_id: null,
    });

    const hasAccess = useAuthGuard(isAuthenticated, authLoading, user || { user_type: '', staff_role: '' }, canCreateOrders, router);

    const loadClients = useCallback(async () => {
        try {
            const result = await makeApiRequest<{data: User[]}>('clients');
            if (result.success && result.data?.data) {
                setClients(result.data.data);
            }
        } catch (error) {
            console.error('Ошибка загрузки клиентов:', error);
        }
    }, []);

    const loadMenuItems = useCallback(async () => {
        try {
            // organization_id is not on User, so fallback to default or remove if not needed
            // If you have organization_id elsewhere, use it; otherwise, just remove it from the query
            const organizationId = (user && 'organization_id' in user) ? (user as any).organization_id : 'default';
            const result = await makeApiRequest<{data: CartItem[]}>(`menu/items?organization_id=${organizationId}`);
            if (result.success && result.data?.data) {
                setMenuItems(result.data.data);
            }
        } catch (error) {
            console.error('Ошибка загрузки меню:', error);
        }
    }, [user]);

    // Функции для работы с меню
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

    // Фильтрация меню по поиску
    const filteredMenuItems = useMemo(() => {
        if (!menuSearch) return menuItems;
        return menuItems.filter(item =>
            item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
            item.description.toLowerCase().includes(menuSearch.toLowerCase()) ||
            item.category.toLowerCase().includes(menuSearch.toLowerCase())
        );
    }, [menuItems, menuSearch]);

    const loadApplication = useCallback(async (clientId: string) => {
        setLoading(true);
        try {
            const result = await makeApiRequest<Application>(`applications/${clientId}`);
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

                // Автоматически устанавливаем тип клиента
                if (app.client_id) {
                    const selectedClient = clients.find(c => c.id === app.client_id);
                    if (selectedClient) {
                        const clientType = selectedClient.client_category || 'one_time';
                        setFormData(prev => ({
                            ...prev,
                            client_type: clientType,
                        }));
                    }
                }
                
                // Ищем клиента по email, если client_id не указан
                if (!app.client_id && app.email) {
                    const foundClient = clients.find(c => c.email === app.email);
                    if (foundClient) {
                        const clientType = foundClient.client_category || 'one_time';
                        setFormData(prev => ({ 
                            ...prev, 
                            selected_client_id: foundClient.id,
                            client_type: clientType,
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
        if (hasAccess) {
            loadClients();
            loadMenuItems();
        }
    }, [hasAccess, loadClients, loadMenuItems]);

    useEffect(() => {
        if (fromApplicationId && hasAccess && clients.length > 0) {
            loadApplication(fromApplicationId);
        }
    }, [fromApplicationId, hasAccess, loadApplication, clients]);

    const handleInputChange = (field: keyof OrderFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRecurringChange = (field: keyof OrderFormData['recurring_schedule'], value: any) => {
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

        const selectedClient = clients.find(c => c.id === formData.selected_client_id);
        const payload = {
            ...formData,
            client_id: formData.selected_client_id,
            client_type: selectedClient?.client_category || 'one_time', // Автоматически определяем тип клиента
        };
        // @ts-ignore
        delete payload.selected_client_id;

        try {
            console.log('Отправляем данные заказа:', payload);
            console.log('Токен авторизации:', localStorage.getItem('auth_token'));
            
            // Проверяем подключение к API
            const testResponse = await fetch('http://localhost:8000/api/clients', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            console.log('Тест подключения к API:', testResponse.status, testResponse.statusText);
            
            const result = await makeApiRequest('orders', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            console.log('Ответ сервера:', result);
            
            if (result.success) {
                router.push('/dashboard/orders');
            } else {
                console.error('Ошибка создания заказа:', result);
                // Показываем пользователю ошибку
                const errorMessage = result.message || result.errors || 'Проверьте данные и попробуйте снова';
                alert('Ошибка создания заказа: ' + errorMessage);
            }
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            alert('Ошибка создания заказа: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };
    
    if (authLoading || !hasAccess) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center p-10 bg-white rounded-lg shadow-md">
                    <div className="text-lg text-gray-600">Loading Access...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto p-6">
                {/* Минималистичный заголовок */}
                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-gray-900 mb-2">
                        {fromApplicationId ? `Заказ #${fromApplicationId}` : 'Новый заказ'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {fromApplicationId ? 'Создание заказа из заявки' : 'Заполните данные'}
                    </p>
                </div>

                {/* Информация о заявке */}
                {application && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-sm font-medium text-blue-900">Заявка #{fromApplicationId}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                application.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {application.status === 'new' ? 'Новая' : 
                                 application.status === 'approved' ? 'Одобрена' : 
                                 application.status}
                            </span>
                                </div>
                        
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-blue-700 font-medium">Клиент:</span>
                                <span className="text-blue-900 ml-2">{application.first_name} {application.last_name}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-blue-700">Email:</span>
                                    <span className="text-blue-900 ml-2">{application.email}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Телефон:</span>
                                    <span className="text-blue-900 ml-2">{application.phone}</span>
                            </div>
                        </div>
                        
                            {application.event_address && (
                                <div>
                                    <span className="text-blue-700">Адрес мероприятия:</span>
                                    <span className="text-blue-900 ml-2">{application.event_address}</span>
                        </div>
                            )}
                            
                            {(application.event_date || application.event_time) && (
                                <div>
                                    <span className="text-blue-700">Дата и время:</span>
                                    <span className="text-blue-900 ml-2">
                                        {application.event_date && new Date(application.event_date).toLocaleDateString('ru-RU')}
                                        {application.event_time && ` в ${new Date(application.event_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
                                    </span>
                    </div>
                            )}
                            
                            {application.message && (
                                <div>
                                    <span className="text-blue-700">Сообщение:</span>
                                    <p className="text-blue-900 mt-1">{application.message}</p>
                            </div>
                            )}
                            
                            {application.cart_items && application.cart_items.length > 0 && (
                                <div className="pt-2 border-t border-blue-200">
                                    <span className="text-blue-700 font-medium">Запрошенные позиции ({application.cart_items.length}):</span>
                                    <div className="mt-2 space-y-1">
                                        {application.cart_items.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between text-xs">
                                                <span className="text-blue-900">{item.name} × {item.quantity}</span>
                                                <span className="text-blue-900 font-medium">{(item.quantity * item.price).toFixed(2)} ₼</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Клиент */}
                        <div>
                        <label htmlFor="client" className="block text-sm text-gray-600 mb-2">Клиент</label>
                                <select
                                    id="client"
                                    value={formData.selected_client_id || ''}
                                    onChange={(e) => {
                                const clientId = e.target.value ? Number(e.target.value) : null;
                                handleInputChange('selected_client_id', clientId);
                                
                                // Автоматически устанавливаем тип клиента на основе данных клиента
                                if (clientId) {
                                    const selectedClient = clients.find(c => c.id === clientId);
                                    if (selectedClient) {
                                        handleInputChange('client_type', selectedClient.client_category);
                                    }
                                }
                                
                                        setCurrentStep(1);
                                    }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    required
                                >
                            <option value="">Выберите клиента</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} ({client.email})
                                        </option>
                                    ))}
                                </select>
                        </div>

                    {/* Информация о типе клиента */}
                        {formData.selected_client_id && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            {(() => {
                                const selectedClient = clients.find(c => c.id === formData.selected_client_id);
                                const clientType = selectedClient?.client_category || 'one_time';
                                
                                return (
                                        <div className="flex items-center gap-3">
                                        <div className="text-2xl">
                                            {clientType === 'corporate' ? '🏢' : '👤'}
                                                </div>
                                            <div>
                                            <div className="font-medium text-gray-900 text-sm">
                                                {clientType === 'corporate' ? 'Корпоративный клиент' : 'Разовый клиент'}
                                                </div>
                                            <div className="text-xs text-gray-600">
                                                {clientType === 'corporate' 
                                                    ? 'Без предоплаты • Статус: processing'
                                                    : 'С предоплатой • Статус: payment_required'
                                                }
                                            </div>
                                        </div>
                                </div>
                                );
                            })()}
                            </div>
                        )}

                    {/* Доставка */}
                        <div>
                        <label className="block text-sm text-gray-600 mb-2">Тип доставки</label>
                        <div className="flex gap-4">
                            {[
                                { value: 'delivery', label: 'Доставка' },
                                { value: 'pickup', label: 'Самовывоз' },
                                { value: 'buffet', label: 'Фуршет' }
                            ].map(type => (
                                <label key={type.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="delivery_type"
                                        value={type.value}
                                        checked={formData.delivery_type === type.value}
                                            onChange={(e) => handleInputChange('delivery_type', e.target.value as any)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                    <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    {/* Дата и время */}
                    <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label htmlFor="delivery_date" className="block text-sm text-gray-600 mb-2">Дата</label>
                                    <input
                                        id="delivery_date"
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                    />
                                </div>
                            <div>
                            <label htmlFor="delivery_time" className="block text-sm text-gray-600 mb-2">Время</label>
                                    <input
                                        id="delivery_time"
                                        type="time"
                                        value={formData.delivery_time}
                                        onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                    />
                            </div>
                        </div>

                    {/* Адрес доставки */}
                        {formData.delivery_type === 'delivery' && (
                            <div>
                            <label htmlFor="delivery_address" className="block text-sm text-gray-600 mb-2">Адрес доставки</label>
                                <textarea
                                    id="delivery_address"
                                    value={formData.delivery_address}
                                    onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Введите адрес доставки"
                                    rows={3}
                                    required
                                />
                            </div>
                        )}

                    {/* Комментарий */}
                        <div>
                        <label htmlFor="comment" className="block text-sm text-gray-600 mb-2">Комментарий</label>
                            <textarea
                                id="comment"
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Дополнительные заметки или инструкции"
                                rows={3}
                            />
                        </div>

                    {/* Скидки и стоимость доставки */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900">Цены и скидки</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Стоимость доставки */}
                            <div>
                                <label htmlFor="delivery_cost" className="block text-sm text-gray-600 mb-2">Стоимость доставки (₼)</label>
                                <input
                                    type="number"
                                    id="delivery_cost"
                                    value={formData.delivery_cost}
                                    onChange={(e) => handleInputChange('delivery_cost', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {/* Фиксированная скидка */}
                            <div>
                                <label htmlFor="discount_fixed" className="block text-sm text-gray-600 mb-2">Скидка фиксир. (₼)</label>
                                <input
                                    type="number"
                                    id="discount_fixed"
                                    value={formData.discount_fixed}
                                    onChange={(e) => handleInputChange('discount_fixed', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {/* Процентная скидка */}
                            <div>
                                <label htmlFor="discount_percent" className="block text-sm text-gray-600 mb-2">Скидка процент. (%)</label>
                                <input
                                    type="number"
                                    id="discount_percent"
                                    value={formData.discount_percent}
                                    onChange={(e) => handleInputChange('discount_percent', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>

                        {/* Дополнительные поля */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-sm font-medium text-gray-900">Дополнительные детали</h3>
                            
                            {/* Особые инструкции */}
                            <div>
                                <label htmlFor="special_instructions" className="block text-sm text-gray-600 mb-2">
                                    Особые инструкции
                                </label>
                                <textarea
                                    id="special_instructions"
                                    value={formData.special_instructions}
                                    onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Любые особые инструкции для этого заказа..."
                                    rows={3}
                                />
                            </div>

                            {/* Ресурсы */}
                            <div className="grid grid-cols-2 gap-4">
                            {/* Необходимое оборудование */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        Оборудование (кол-во)
                                </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('equipment_required', Math.max(0, formData.equipment_required - 1))}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                                        >
                                            −
                                        </button>
                                <input
                                            type="number"
                                            value={formData.equipment_required}
                                            onChange={(e) => handleInputChange('equipment_required', Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('equipment_required', formData.equipment_required + 1)}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                                        >
                                            +
                                        </button>
                            </div>
                            </div>

                                {/* Назначенный персонал */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        Персонал (кол-во)
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('staff_assigned', Math.max(0, formData.staff_assigned - 1))}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                                        >
                                            −
                                        </button>
                                    <input
                                            type="number"
                                            value={formData.staff_assigned}
                                            onChange={(e) => handleInputChange('staff_assigned', Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('staff_assigned', formData.staff_assigned + 1)}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                                        >
                                            +
                                        </button>
                                </div>
                                </div>
                            </div>
                        </div>

                    {/* Кнопки */}
                    <div className="flex justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => router.push('/dashboard/orders')}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Отмена
                                </button>
                                
                                    <button
                                    type="submit"
                                    disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                            {loading ? 'Создание...' : 'Создать заказ'}
                                    </button>
                        </div>
                    </form>
            </div>

            {/* Модальное окно предварительного просмотра */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium text-gray-900">Предварительный просмотр</h2>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Информация о клиенте */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Клиент</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>{clients.find(c => c.id === formData.selected_client_id)?.name || 'Не выбран'}</strong></p>
                                    <p>{clients.find(c => c.id === formData.selected_client_id)?.email || 'Не указан'}</p>
                                    <p>{clients.find(c => c.id === formData.selected_client_id)?.client_category === 'corporate' ? 'Корпоративный' : 'Разовый'}</p>
                                </div>
                            </div>

                            {/* Информация о доставке */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Доставка</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Тип: {formData.delivery_type}</p>
                                    <p>Дата: {formData.delivery_date || 'Не указана'}</p>
                                    <p>Время: {formData.delivery_time || 'Не указано'}</p>
                                    {formData.delivery_address && (
                                        <p>Адрес: {formData.delivery_address}</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Комментарий */}
                            {formData.comment && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Комментарий</h3>
                                    <p className="text-sm text-gray-600">{formData.comment}</p>
                                </div>
                            )}

                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end">
                                    <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                Закрыть
                                    </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Модальное окно выбора товаров из меню
    const MenuModal = () => (
        showMenuModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Выбор товаров из меню</h2>
                                    <button
                            onClick={() => setShowMenuModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                                    >
                            <X className="w-6 h-6" />
                                    </button>
                    </div>

                    {/* Поиск */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Поиск по названию, описанию или категории..."
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Список товаров */}
                    <div className="overflow-y-auto max-h-96">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredMenuItems.map((item) => (
                                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                                        <span className="text-lg font-semibold text-blue-600">{item.price} ₼</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {item.category}
                                        </span>
                                        <button
                                            onClick={() => addMenuItem(item)}
                                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Добавить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredMenuItems.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>Товары не найдены</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex justify-end">
                                <button
                            onClick={() => setShowMenuModal(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                            Закрыть
                                </button>
                            </div>
                        </div>
                </div>
        )
    );

    return (
        <>
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-center">Загрузка...</p>
            </div>
                </div>
            )}

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => router.back()}
                                    className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                                >
                                    ←
                                </button>
                                <h1 className="text-xl font-semibold text-gray-900">Создание заказа</h1>
                            </div>
                        </div>
                            </div>
                        </div>

                {/* Form */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Application Info */}
                        {application && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">Информация о заявке</h3>
                                <div className="text-sm text-blue-800 space-y-1">
                                    <p><strong>Статус:</strong> {application?.status}</p>
                                    <p><strong>Клиент:</strong> {application?.first_name} {application?.last_name}</p>
                                    <p><strong>Email:</strong> {application?.email}</p>
                                    <p><strong>Телефон:</strong> {application?.phone}</p>
                                    {application?.event_address && <p><strong>Адрес:</strong> {application?.event_address}</p>}
                                    {application?.event_date && <p><strong>Дата:</strong> {new Date(application?.event_date || '').toLocaleDateString()}</p>}
                                    {application?.event_time && <p><strong>Время:</strong> {new Date(application?.event_time || '').toLocaleTimeString()}</p>}
                                    {application?.message && <p><strong>Сообщение:</strong> {application?.message}</p>}
                                    {application?.cart_items && application?.cart_items?.length && application?.cart_items?.length! > 0 && (
                                    <div>
                                            <p><strong>Запрошенные товары:</strong></p>
                                            <ul className="list-disc list-inside ml-4">
                                                {application?.cart_items?.map((item, index) => (
                                                    <li key={index}>{item.name} (x{item.quantity}) - {item.price} ₼</li>
                                                ))}
                                            </ul>
                                    </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Client Selection */}
                                    <div>
                            <label htmlFor="client" className="block text-sm text-gray-600 mb-2">Клиент</label>
                            <select
                                id="client"
                                value={formData.selected_client_id || ''}
                                onChange={(e) => {
                                    const clientId = parseInt(e.target.value);
                                    const selectedClient = clients.find(c => c.id === clientId);
                                    setFormData(prev => ({
                                        ...prev,
                                        selected_client_id: clientId,
                                        client_type: selectedClient?.client_category || 'one_time'
                                    }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                required
                            >
                                <option value="">Выберите клиента</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} ({client.client_category === 'corporate' ? 'Корпоративный' : 'Разовый'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Client Type Display */}
                        {formData.selected_client_id && (
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${formData.client_type === 'corporate' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {formData.client_type === 'corporate' ? 'Корпоративный клиент' : 'Разовый клиент'}
                                        </span>
                                    </div>
                            </div>
                        )}

                        {/* Delivery Type */}
                                    <div>
                            <label className="block text-sm text-gray-600 mb-2">Тип доставки</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: 'delivery', label: 'Доставка' },
                                    { value: 'pickup', label: 'Самовывоз' },
                                    { value: 'buffet', label: 'Кейтеринг' }
                                ].map((type) => (
                                    <label key={type.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="delivery_type"
                                            value={type.value}
                                            checked={formData.delivery_type === type.value}
                                            onChange={(e) => handleInputChange('delivery_type', e.target.value as any)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                                    </label>
                                ))}
                                    </div>
                        </div>

                        {/* Delivery Date and Time */}
                        {formData.delivery_type !== 'pickup' && (
                            <div className="grid grid-cols-2 gap-4">
                                        <div>
                                    <label htmlFor="delivery_date" className="block text-sm text-gray-600 mb-2">Дата</label>
                                    <input
                                        type="date"
                                        id="delivery_date"
                                        value={formData.delivery_date}
                                        onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="delivery_time" className="block text-sm text-gray-600 mb-2">Время</label>
                                    <input
                                        type="time"
                                        id="delivery_time"
                                        value={formData.delivery_time}
                                        onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                    />
                                </div>
                                        </div>
                                    )}

                        {/* Delivery Address */}
                        {formData.delivery_type !== 'pickup' && (
                            <div>
                                <label htmlFor="delivery_address" className="block text-sm text-gray-600 mb-2">Адрес доставки</label>
                                <input
                                    type="text"
                                    id="delivery_address"
                                    value={formData.delivery_address}
                                    onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Введите адрес доставки"
                                    required
                                />
                                </div>
                        )}

                        {/* Comment */}
                        <div>
                            <label htmlFor="comment" className="block text-sm text-gray-600 mb-2">Комментарий</label>
                            <textarea
                                id="comment"
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Дополнительные заметки или инструкции"
                                rows={3}
                            />
                            </div>

                        {/* Скидки и стоимость доставки */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-900">Цены и скидки</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Стоимость доставки */}
                                    <div>
                                    <label htmlFor="delivery_cost" className="block text-sm text-gray-600 mb-2">Стоимость доставки (₼)</label>
                                    <input
                                        type="number"
                                        id="delivery_cost"
                                        value={formData.delivery_cost}
                                        onChange={(e) => handleInputChange('delivery_cost', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                    </div>

                                {/* Фиксированная скидка */}
                                    <div>
                                    <label htmlFor="discount_fixed" className="block text-sm text-gray-600 mb-2">Скидка фиксир. (₼)</label>
                                    <input
                                        type="number"
                                        id="discount_fixed"
                                        value={formData.discount_fixed}
                                        onChange={(e) => handleInputChange('discount_fixed', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                    </div>

                                {/* Процентная скидка */}
                                    <div>
                                    <label htmlFor="discount_percent" className="block text-sm text-gray-600 mb-2">Скидка процент. (%)</label>
                                    <input
                                        type="number"
                                        id="discount_percent"
                                        value={formData.discount_percent}
                                        onChange={(e) => handleInputChange('discount_percent', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    </div>
                            </div>

                            {/* Товары заказа */}
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-900">Товары заказа</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowMenuModal(true)}
                                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Добавить из меню
                                    </button>
                                </div>

                                {formData.menu_items.length > 0 ? (
                                    <div className="space-y-2">
                                        {formData.menu_items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">{item.description}</p>
                                                    <p className="text-sm text-gray-500">{item.price} ₼</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateMenuItemQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateMenuItemQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMenuItem(item.id)}
                                                        className="p-1 text-red-400 hover:text-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>Нет товаров в заказе</p>
                                        <p className="text-sm">Нажмите "Добавить из меню" для выбора товаров</p>
                                    </div>
                                )}
                            </div>

                            {/* Калькулятор итоговой стоимости */}
                            {formData.menu_items.length > 0 && (
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Сумма товаров:</span>
                                            <span>{formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} ₼</span>
                                        </div>
                                        {(formData.discount_fixed > 0 || formData.discount_percent > 0) && (
                                            <div className="flex justify-between text-red-600">
                                                <span>Скидка:</span>
                                                <span>-{(formData.discount_fixed + (formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * formData.discount_percent / 100)).toFixed(2)} ₼</span>
                                            </div>
                                        )}
                                        {formData.delivery_cost > 0 && (
                                            <div className="flex justify-between text-gray-600">
                                                <span>Доставка:</span>
                                                <span>{formData.delivery_cost.toFixed(2)} ₼</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-300">
                                            <span>Итого:</span>
                                            <span className="text-blue-600">
                                                {(() => {
                                                    const subtotal = formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                                                    const discount = formData.discount_fixed + (subtotal * formData.discount_percent / 100);
                                                    return (Math.max(0, subtotal - discount) + formData.delivery_cost).toFixed(2);
                                                })()} ₼
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recurring Schedule */}
                        <div className="pt-4 border-t border-gray-200">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.recurring_schedule.enabled}
                                    onChange={(e) => handleRecurringChange('enabled', e.target.checked)}
                                    className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-800">
                                    Включить регулярные заказы
                                </span>
                            </label>

                            {formData.recurring_schedule.enabled && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Частота</label>
                                            <select
                                                id="frequency"
                                                value={formData.recurring_schedule.frequency}
                                                onChange={(e) => handleRecurringChange('frequency', e.target.value as any)}
                                                className="w-full mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                                            >
                                                <option value="weekly">Еженедельно</option>
                                                <option value="monthly">Ежемесячно</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="recurring_time" className="block text-sm font-medium text-gray-700 mb-1">Время регулярной доставки</label>
                                            <input
                                                id="recurring_time"
                                                type="time"
                                                value={formData.recurring_schedule.delivery_time}
                                                onChange={(e) => handleRecurringChange('delivery_time', e.target.value)}
                                                className="w-full mt-1 block py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Выбор дней недели */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Дни недели</label>
                                        <div className="grid grid-cols-7 gap-2">
                                            {[
                                                { value: 'monday', label: 'Пн' },
                                                { value: 'tuesday', label: 'Вт' },
                                                { value: 'wednesday', label: 'Ср' },
                                                { value: 'thursday', label: 'Чт' },
                                                { value: 'friday', label: 'Пт' },
                                                { value: 'saturday', label: 'Сб' },
                                                { value: 'sunday', label: 'Вс' }
                                            ].map((day) => (
                                                <label key={day.value} className="flex flex-col items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.recurring_schedule.days.includes(day.value)}
                                                        onChange={(e) => {
                                                            const newDays = e.target.checked
                                                                ? [...formData.recurring_schedule.days, day.value]
                                                                : formData.recurring_schedule.days.filter(d => d !== day.value);
                                                            handleRecurringChange('days', newDays);
                                                        }}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-xs text-gray-600 mt-1">{day.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="recurring_notes" className="block text-sm font-medium text-gray-700 mb-1">Заметки для регулярных заказов</label>
                                        <textarea
                                            id="recurring_notes"
                                            value={formData.recurring_schedule.notes}
                                            onChange={(e) => handleRecurringChange('notes', e.target.value)}
                                            className="w-full mt-1 block py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                                            placeholder="Заметки для регулярных заказов"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Дополнительные поля */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-sm font-medium text-gray-900">Дополнительные детали</h3>
                            
                            {/* Особые инструкции */}
                            <div>
                                <label htmlFor="special_instructions" className="block text-sm text-gray-600 mb-2">
                                    Особые инструкции
                                </label>
                                <textarea
                                    id="special_instructions"
                                    value={formData.special_instructions}
                                    onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Любые особые инструкции для этого заказа..."
                                    rows={3}
                                />
                            </div>

                            {/* Ресурсы */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Необходимое оборудование */}
                                    <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        Оборудование (кол-во)
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('equipment_required', Math.max(0, formData.equipment_required - 1))}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            value={formData.equipment_required}
                                            onChange={(e) => handleInputChange('equipment_required', Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('equipment_required', formData.equipment_required + 1)}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                                        >
                                            +
                                        </button>
                                        </div>
                                        </div>

                                {/* Назначенный персонал */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        Персонал (кол-во)
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('staff_assigned', Math.max(0, formData.staff_assigned - 1))}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            value={formData.staff_assigned}
                                            onChange={(e) => handleInputChange('staff_assigned', Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('staff_assigned', formData.staff_assigned + 1)}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Назад
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Создание...' : 'Создать заказ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Menu Modal */}
            <MenuModal />

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Предварительный просмотр заказа</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Информация о клиенте */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Клиент</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>{clients.find(c => c.id === formData.selected_client_id)?.name || 'Не выбран'}</strong></p>
                                    <p>{clients.find(c => c.id === formData.selected_client_id)?.email || 'Не указан'}</p>
                                    <p>{clients.find(c => c.id === formData.selected_client_id)?.client_category === 'corporate' ? 'Корпоративный' : 'Разовый'}</p>
                                </div>
                            </div>

                            {/* Информация о доставке */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Доставка</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Тип: {formData.delivery_type}</p>
                                    {formData.delivery_date && <p>Дата: {formData.delivery_date}</p>}
                                    {formData.delivery_time && <p>Время: {formData.delivery_time}</p>}
                                    {formData.delivery_address && <p>Адрес: {formData.delivery_address}</p>}
                                </div>
                            </div>

                            {/* Товары */}
                            {formData.menu_items.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Товары</h3>
                                    <div className="space-y-2">
                                        {formData.menu_items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.name} x{item.quantity}</span>
                                                <span>{(item.price * item.quantity).toFixed(2)} ₼</span>
                                            </div>
                                        ))}
                    </div>
                </div>
            )}

                            {/* Итоговая сумма */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">Итоговая сумма</h3>
                                <div className="text-sm text-blue-800 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Товары:</span>
                                        <span>{formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} ₼</span>
        </div>
                                    {formData.delivery_cost > 0 && (
                                        <div className="flex justify-between">
                                            <span>Доставка:</span>
                                            <span>{formData.delivery_cost.toFixed(2)} ₼</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-medium border-t pt-1">
                                        <span>Итого:</span>
                                        <span>
                                            {(() => {
                                                const subtotal = formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                                                const discount = formData.discount_fixed + (subtotal * formData.discount_percent / 100);
                                                return (Math.max(0, subtotal - discount) + formData.delivery_cost).toFixed(2);
                                            })()} ₼
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Подтвердить заказ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}





