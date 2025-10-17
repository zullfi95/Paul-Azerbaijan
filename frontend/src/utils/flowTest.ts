/**
 * Утилиты для тестирования потока кейтеринга
 */

// Тестовые данные
export const mockCartItem = {
  id: '1',
  name: 'Test Croissant',
  description: 'Delicious croissant',
  price: 5.50,
  quantity: 2,
  image: '/images/croissant.jpg',
  category: 'Brunch Menu',
  available: true,
  isSet: false
};

export const mockOrderData = {
  client_type: 'one_time' as const,
  company_name: 'Test Company',
  customer: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  menu_items: [mockCartItem],
  comment: 'Test order',
  delivery_date: '2024-12-31',
  delivery_time: '12:00',
  delivery_type: 'delivery' as const,
  delivery_address: '123 Test Street',
  delivery_cost: 0
};

// Интерфейсы для типизации
interface CartItem {
  id: string;
  quantity: number;
  [key: string]: unknown;
}

interface TestItem {
  id: string;
  [key: string]: unknown;
}

// Функции для тестирования
export const testCartOperations = {
  addItem: (cart: CartItem[], item: TestItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    return cart;
  },

  removeItem: (cart: CartItem[], itemId: string) => {
    return cart.filter(item => item.id !== itemId);
  },

  updateQuantity: (cart: CartItem[], itemId: string, quantity: number) => {
    return cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0);
  },

  getTotalPrice: (cart: CartItem[]) => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getTotalItems: (cart: CartItem[]) => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }
};

export const testNavigation = {
  goToCart: () => '/cart',
  goToOrder: () => '/catering/order',
  goToCatering: () => '/catering'
};

export const testFormValidation = {
  validateOrderForm: (formData: Record<string, unknown>) => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName) errors.firstName = 'Имя обязательно';
    if (!formData.lastName) errors.lastName = 'Фамилия обязательна';
    if (!formData.email) errors.email = 'Email обязателен';
    if (!formData.phone) errors.phone = 'Телефон обязателен';
    if (!formData.eventAddress) errors.eventAddress = 'Адрес обязателен';
    if (!formData.eventDate) errors.eventDate = 'Дата обязательна';
    if (!formData.eventTime) errors.eventTime = 'Время обязательно';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export const testApiCalls = {
  createOrder: async (orderData: Record<string, unknown>) => {
    // Симуляция API вызова
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          id: 123,
          order_number: 'ORD-2024-001',
          status: 'submitted',
          ...orderData
        }
      })
    };
    
    return mockResponse;
  }
};

// Функция для полного теста потока
export const testCompleteFlow = () => {
  
  // 1. Тест корзины
  let cart: CartItem[] = [];
  
  // Добавляем товар
  cart = testCartOperations.addItem(cart, mockCartItem);
  
  // Проверяем общую стоимость
  const totalPrice = testCartOperations.getTotalPrice(cart);
  const totalItems = testCartOperations.getTotalItems(cart);
  
  // 2. Тест навигации
  const cartPath = testNavigation.goToCart();
  const orderPath = testNavigation.goToOrder();
  
  // 3. Тест валидации формы
  const validFormData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    eventAddress: '123 Test Street',
    eventDate: '2024-12-31',
    eventTime: '12:00'
  };
  
  const validation = testFormValidation.validateOrderForm(validFormData);
  
  // 4. Тест API
  testApiCalls.createOrder(mockOrderData).then(response => {
    response.json().then(data => {
    });
  });
  
  
  return {
    cart,
    totalPrice,
    totalItems,
    validation,
    paths: {
      cart: cartPath,
      order: orderPath
    }
  };
};

// Экспортируем функцию для использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).testCateringFlow = testCompleteFlow;
}
