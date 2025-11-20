"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartItem, Order } from "../types/unified";
import { useAuthGuard, canCreateOrders } from "../utils/authConstants";
import { Plus, X, ShoppingCart } from 'lucide-react';
import { makeApiRequest } from "../utils/apiHelpers";
import MenuSlidePanel from "./MenuSlidePanel";
import styles from './CreateOrderForm.module.css';

interface EditOrderFormProps {
  orderId: string;
}

export default function EditOrderForm({ orderId }: EditOrderFormProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<CartItem[]>([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    selected_client_id: null as number | null,
    menu_items: [] as CartItem[],
    kitchen_comment: '',
    operation_comment: '',
    desserts_comment: '',
    delivery_date: '',
    delivery_time: '',
    delivery_type: 'delivery' as 'delivery' | 'pickup' | 'buffet',
    delivery_address: '',
    delivery_cost: 0,
    discount_fixed: 0,
    discount_percent: 0,
    client_type: 'one_time' as 'corporate' | 'one_time',
    company_name: '',
    special_instructions: '',
  });

  const hasAccess = useAuthGuard(isAuthenticated, authLoading, user || { user_type: '', staff_role: '' }, canCreateOrders, router);

  // Загрузка заказа
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !hasAccess) return;
      
      setLoadingOrder(true);
      try {
        const result = await makeApiRequest<Order>(`/orders/${orderId}`);
        if (result.success && result.data) {
          const orderData = result.data;
          setOrder(orderData);
          
          // Извлекаем время доставки (может быть в формате datetime или time)
          let deliveryTime = '';
          if (orderData.delivery_time) {
            const timeStr = orderData.delivery_time.toString();
            // Если это datetime, извлекаем только время
            if (timeStr.includes('T') || timeStr.includes(' ')) {
              const timePart = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr.split(' ')[1];
              deliveryTime = timePart ? timePart.substring(0, 5) : '';
            } else if (timeStr.includes(':')) {
              // Если это уже время, используем как есть
              deliveryTime = timeStr.substring(0, 5);
            }
          }
          
          // Заполняем форму данными заказа
          setFormData({
            selected_client_id: orderData.client_id || null,
            menu_items: orderData.menu_items || [],
            kitchen_comment: orderData.kitchen_comment || '',
            operation_comment: orderData.operation_comment || '',
            desserts_comment: orderData.desserts_comment || '',
            delivery_date: orderData.delivery_date ? new Date(orderData.delivery_date).toISOString().split('T')[0] : '',
            delivery_time: deliveryTime,
            delivery_type: orderData.delivery_type || 'delivery',
            delivery_address: orderData.delivery_address || '',
            delivery_cost: orderData.delivery_cost || 0,
            discount_fixed: orderData.discount_fixed || 0,
            discount_percent: orderData.discount_percent || 0,
            client_type: orderData.client_type || 'one_time',
            company_name: orderData.company_name || '',
            special_instructions: orderData.special_instructions || '',
          });
        } else {
          alert('Не удалось загрузить заказ');
          router.push('/dashboard/orders');
        }
      } catch (error) {
        console.error('Ошибка загрузки заказа:', error);
        alert('Ошибка загрузки заказа');
        router.push('/dashboard/orders');
      } finally {
        setLoadingOrder(false);
      }
    };

    loadOrder();
  }, [orderId, hasAccess, router]);

  // Загрузка клиентов
  useEffect(() => {
    const loadClients = async () => {
      try {
        const result = await makeApiRequest('/clients');
        if (result.success && result.data) {
          setClients(result.data.data || result.data || []);
        }
      } catch (error) {
        console.error('Ошибка загрузки клиентов:', error);
      }
    };

    if (hasAccess) {
      loadClients();
    }
  }, [hasAccess]);

  // Загрузка меню
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const result = await makeApiRequest<{data: CartItem[]}>('/menu/items');
        if (result.success && result.data) {
          setMenuItems(result.data.data || result.data || []);
        }
      } catch (error) {
        console.error('Ошибка загрузки меню:', error);
      }
    };

    if (hasAccess) {
      loadMenu();
    }
  }, [hasAccess]);

  const addMenuItem = (item: CartItem) => {
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
  };

  const updateMenuItemQuantity = (itemId: string | number, quantity: number) => {
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
  };

  const removeMenuItem = (itemId: string | number) => {
    setFormData(prev => ({
      ...prev,
      menu_items: prev.menu_items.filter(item => item.id !== itemId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      client_id: formData.selected_client_id,
      menu_items: formData.menu_items.map(item => ({
        ...item,
        id: item.id.toString()
      }))
    };

    try {
      const result = await makeApiRequest(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (result.success) {
        alert('Заказ успешно обновлен!');
        router.push('/dashboard/orders');
      } else {
        const errorMessage = result.message || JSON.stringify(result.errors) || 'Проверьте данные и попробуйте снова';
        alert('Ошибка обновления заказа: ' + errorMessage);
      }
    } catch (error) {
      console.error('Ошибка обновления заказа:', error);
      alert('Ошибка обновления заказа: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loadingOrder || !hasAccess) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-10 bg-white rounded-lg">
          <div className="text-lg text-gray-600">
            {loadingOrder ? 'Загрузка заказа...' : 'Loading Access...'}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-10 bg-white rounded-lg">
          <div className="text-lg text-red-600">Заказ не найден</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Обновление заказа...</p>
          </div>
        </div>
      )}

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerInner}>
              <div className={styles.headerLeft}>
                <button
                  onClick={() => router.back()}
                  className={styles.backButton}
                >
                  ←
                </button>
                <h1 className={styles.title}>Редактирование заказа #{orderId}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* Order Info */}
            <div className={styles.applicationInfo}>
              <h3 className={styles.applicationTitle}>Информация о заказе</h3>
              <div className={styles.applicationContent}>
                <p><strong>ID заказа:</strong> {order.id}</p>
                <p><strong>Статус:</strong> {order.status}</p>
                <p><strong>Создан:</strong> {new Date(order.created_at).toLocaleString('ru-RU')}</p>
              </div>
            </div>

            {/* Client Selection */}
            <div className={styles.formSection}>
              <label htmlFor="client" className={styles.label}>Клиент</label>
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
                className={styles.select}
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

            {/* Company Name */}
            <div className={styles.formSection}>
              <label htmlFor="company_name" className={styles.label}>Название компании</label>
              <input
                id="company_name"
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className={styles.input}
                placeholder="ООО Компания"
              />
            </div>

            {/* Delivery Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.formSection}>
                <label htmlFor="delivery_date" className={styles.label}>Дата доставки</label>
                <input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formSection}>
                <label htmlFor="delivery_time" className={styles.label}>Время доставки</label>
                <input
                  id="delivery_time"
                  type="time"
                  value={formData.delivery_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_time: e.target.value }))}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Delivery Type */}
            <div className={styles.formSection}>
              <label className={styles.label}>Тип доставки</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="delivery"
                    checked={formData.delivery_type === 'delivery'}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_type: e.target.value as any }))}
                  />
                  Доставка
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="pickup"
                    checked={formData.delivery_type === 'pickup'}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_type: e.target.value as any }))}
                  />
                  Самовывоз
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="buffet"
                    checked={formData.delivery_type === 'buffet'}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_type: e.target.value as any }))}
                  />
                  Буфет
                </label>
              </div>
            </div>

            {/* Delivery Address */}
            {formData.delivery_type === 'delivery' && (
              <div className={styles.formSection}>
                <label htmlFor="delivery_address" className={styles.label}>Адрес доставки</label>
                <input
                  id="delivery_address"
                  type="text"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                  className={styles.input}
                  placeholder="Улица, дом, квартира"
                  required
                />
              </div>
            )}

            {/* Prices and Discounts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={styles.formSection}>
                <label htmlFor="delivery_cost" className={styles.label}>Стоимость доставки (₼)</label>
                <input
                  id="delivery_cost"
                  type="number"
                  value={formData.delivery_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_cost: parseFloat(e.target.value) || 0 }))}
                  className={styles.input}
                  min="0"
                  step="0.1"
                />
              </div>

              <div className={styles.formSection}>
                <label htmlFor="discount_fixed" className={styles.label}>Фиксированная скидка (₼)</label>
                <input
                  id="discount_fixed"
                  type="number"
                  value={formData.discount_fixed}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_fixed: parseFloat(e.target.value) || 0 }))}
                  className={styles.input}
                  min="0"
                  step="0.1"
                />
              </div>

              <div className={styles.formSection}>
                <label htmlFor="discount_percent" className={styles.label}>Скидка в процентах (%)</label>
                <input
                  id="discount_percent"
                  type="number"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: parseFloat(e.target.value) || 0 }))}
                  className={styles.input}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            {/* Menu Items */}
            <div className={styles.menuItemsSection}>
              <div className={styles.menuItemsHeader}>
                <div>
                  <h3 className={styles.menuItemsTitle}>Товары заказа</h3>
                  {menuItems.length > 0 && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Доступно {menuItems.length} товаров в меню
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowMenuModal(true)}
                  className={styles.addMenuButton}
                  disabled={loading || menuItems.length === 0}
                >
                  <Plus className={styles.addMenuIcon} />
                  {menuItems.length === 0 ? 'Меню загружается...' : 'Добавить из меню'}
                </button>
              </div>

              {formData.menu_items.length > 0 ? (
                <div className="space-y-2">
                  {formData.menu_items.map((item) => (
                    <div key={item.id} className={styles.menuItemCard}>
                      <div className={styles.menuItemInfo}>
                        <h4 className={styles.menuItemName}>{item.name}</h4>
                        <p className={styles.menuItemDescription}>{item.description}</p>
                        <p className={styles.menuItemPrice}>{item.price} ₼</p>
                      </div>
                      <div className={styles.menuItemControls}>
                        <button
                          type="button"
                          onClick={() => updateMenuItemQuantity(item.id, item.quantity - 1)}
                          className={styles.quantityButton}
                        >
                          −
                        </button>
                        <span className={styles.quantityInput}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateMenuItemQuantity(item.id, item.quantity + 1)}
                          className={styles.quantityButton}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMenuItem(item.id)}
                          className={styles.removeButton}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <ShoppingCart className={styles.emptyIcon} />
                  <p className={styles.emptyText}>Нет товаров в заказе</p>
                  <p className={styles.emptySubtext}>Нажмите &quot;Добавить из меню&quot; для выбора товаров</p>
                </div>
              )}
            </div>

            {/* Total Calculator */}
            {formData.menu_items.length > 0 && (
              <div className={styles.priceCalculator}>
                <div className={styles.priceRow}>
                  <span>Сумма товаров:</span>
                  <span>{formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} ₼</span>
                </div>
                {(formData.discount_fixed > 0 || formData.discount_percent > 0) && (
                  <div className={`${styles.priceRow} ${styles.discount}`}>
                    <span>Скидка:</span>
                    <span>-{(formData.discount_fixed + (formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * formData.discount_percent / 100)).toFixed(2)} ₼</span>
                  </div>
                )}
                {formData.delivery_cost > 0 && (
                  <div className={styles.priceRow}>
                    <span>Доставка:</span>
                    <span>{formData.delivery_cost.toFixed(2)} ₼</span>
                  </div>
                )}
                <div className={`${styles.priceRow} ${styles.total}`}>
                  <span>Итого:</span>
                  <span>
                    {(
                      formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0) -
                      formData.discount_fixed -
                      (formData.menu_items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * formData.discount_percent / 100) +
                      formData.delivery_cost
                    ).toFixed(2)} ₼
                  </span>
                </div>
              </div>
            )}

            {/* Comment for Kitchen */}
            <div className={styles.formSection}>
              <label htmlFor="kitchen_comment" className={styles.label}>Комментарий для кухни</label>
              <textarea
                id="kitchen_comment"
                value={formData.kitchen_comment}
                onChange={(e) => setFormData(prev => ({ ...prev, kitchen_comment: e.target.value }))}
                className={styles.textarea}
                placeholder="Специальные инструкции для кухни..."
                rows={3}
              />
            </div>

            {/* Comment for Operation */}
            <div className={styles.formSection}>
              <label htmlFor="operation_comment" className={styles.label}>Комментарий для operation</label>
              <textarea
                id="operation_comment"
                value={formData.operation_comment}
                onChange={(e) => setFormData(prev => ({ ...prev, operation_comment: e.target.value }))}
                className={styles.textarea}
                placeholder="Инструкции для отдела operation..."
                rows={3}
              />
            </div>

            {/* Comment for Desserts */}
            <div className={styles.formSection}>
              <label htmlFor="desserts_comment" className={styles.label}>Комментарии для сладостей</label>
              <textarea
                id="desserts_comment"
                value={formData.desserts_comment}
                onChange={(e) => setFormData(prev => ({ ...prev, desserts_comment: e.target.value }))}
                className={styles.textarea}
                rows={4}
                placeholder="Дополнительные пожелания или комментарии"
              />
            </div>

            {/* Special Instructions */}
            <div className={styles.formSection}>
              <label htmlFor="special_instructions" className={styles.label}>Особые инструкции</label>
              <textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                className={styles.textarea}
                rows={3}
                placeholder="Особые требования к подаче, упаковке и т.д."
              />
            </div>

            {/* Submit Buttons */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading || formData.menu_items.length === 0}
                className={styles.submitButton}
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Menu Slide Panel */}
      <MenuSlidePanel
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        menuItems={menuItems}
        onAddItem={addMenuItem}
        loading={loading}
      />
    </>
  );
}

