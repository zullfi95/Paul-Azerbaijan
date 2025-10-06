import React, { useState, useEffect } from 'react';
import { FormField } from './FormField';
import { FormSection } from './FormSection';
import { FormActions } from './FormActions';
import { MenuItem, CartItem } from '../../types/enhanced';

interface CreateOrderFormRefactoredProps {
  onSubmit: (formData: OrderFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  menuItems?: MenuItem[];
}

interface OrderFormData {
  event_date: string;
  event_time: string;
  guest_count: number;
  items: CartItem[];
  special_instructions?: string;
}

interface FormErrors {
  event_date?: string;
  event_time?: string;
  guest_count?: string;
  items?: string;
}

export const CreateOrderFormRefactored: React.FC<CreateOrderFormRefactoredProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  menuItems = [],
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    event_date: '',
    event_time: '',
    guest_count: 0,
    items: [],
    special_instructions: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.event_date) {
      newErrors.event_date = 'Дата события обязательна';
    }

    if (!formData.event_time) {
      newErrors.event_time = 'Время события обязательно';
    }

    if (formData.guest_count <= 0) {
      newErrors.guest_count = 'Количество гостей должно быть больше 0';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Необходимо выбрать хотя бы один пункт меню';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обновление поля формы
  const updateField = (field: keyof OrderFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Добавление/удаление элементов меню
  const addMenuItem = (menuItem: MenuItem) => {
    const existingItem = formData.items.find(item => item.menu_item_id === menuItem.id);
    
    if (existingItem) {
      updateMenuItemQuantity(menuItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        menu_item_id: menuItem.id,
        quantity: 1,
        price: menuItem.price,
        name: menuItem.name,
      };
      
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
  };

  const removeMenuItem = (menuItemId: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.menu_item_id !== menuItemId),
    }));
  };

  const updateMenuItemQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeMenuItem(menuItemId);
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.menu_item_id === menuItemId
          ? { ...item, quantity }
          : item
      ),
    }));
  };

  // Вычисление общей суммы
  const totalAmount = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <FormSection title="Основная информация">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Дата события"
            name="event_date"
            type="date"
            value={formData.event_date}
            onChange={(value) => updateField('event_date', value)}
            required
            error={errors.event_date}
          />
          
          <FormField
            label="Время события"
            name="event_time"
            type="time"
            value={formData.event_time}
            onChange={(value) => updateField('event_time', value)}
            required
            error={errors.event_time}
          />
          
          <FormField
            label="Количество гостей"
            name="guest_count"
            type="number"
            value={formData.guest_count}
            onChange={(value) => updateField('guest_count', value)}
            required
            error={errors.guest_count}
            className="md:col-span-2"
          />
        </div>
      </FormSection>

      {/* Меню */}
      <FormSection title="Выбор меню">
        {menuItems.length === 0 ? (
          <p className="text-gray-500">Меню не загружено</p>
        ) : (
          <div className="space-y-4">
            {menuItems.map((item) => {
              const cartItem = formData.items.find(ci => ci.menu_item_id === item.id);
              const quantity = cartItem?.quantity || 0;
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm font-medium text-gray-900">₼{item.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateMenuItemQuantity(item.id, quantity - 1)}
                      disabled={quantity === 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    
                    <span className="w-8 text-center">{quantity}</span>
                    
                    <button
                      type="button"
                      onClick={() => updateMenuItemQuantity(item.id, quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
            
            {errors.items && (
              <p className="text-sm text-red-600">{errors.items}</p>
            )}
          </div>
        )}
      </FormSection>

      {/* Дополнительная информация */}
      <FormSection title="Дополнительная информация">
        <FormField
          label="Особые инструкции"
          name="special_instructions"
          type="textarea"
          value={formData.special_instructions}
          onChange={(value) => updateField('special_instructions', value)}
          placeholder="Укажите особые требования к заказу..."
          rows={4}
        />
      </FormSection>

      {/* Итоговая информация */}
      {formData.items.length > 0 && (
        <FormSection title="Итоговая информация">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Общая сумма:</span>
              <span className="text-xl font-bold text-green-600">₼{totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Количество позиций: {formData.items.length}
            </div>
          </div>
        </FormSection>
      )}

      {/* Действия */}
      <FormActions
        onCancel={onCancel}
        onSubmit={() => handleSubmit(new Event('submit') as any)}
        submitLabel="Создать заказ"
        isLoading={isSubmitting || isLoading}
        disabled={formData.items.length === 0}
      />
    </form>
  );
};
