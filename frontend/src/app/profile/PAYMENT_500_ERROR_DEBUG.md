# Диагностика ошибки 500 при создании платежа

## 🎯 Проблема
При нажатии кнопки "Complete Payment" возникает ошибка 500 (Internal Server Error) вместо ошибки авторизации.

## 🔍 Анализ проблемы

### ✅ **Логи из консоли браузера:**
```
Creating payment for order: 13
Auth token exists: true
Payment response status: 500
Payment error response: {}
```

### ✅ **Возможные причины ошибки 500:**
1. **Проблема с базой данных** - заказ не найден
2. **Проблема с AlgoritmaService** - не может подключиться к API
3. **Проблема с правами доступа** - пользователь не может создавать платежи
4. **Проблема с категорией клиента** - не `one_time`
5. **Проблема со статусом заказа** - не `submitted` или `payment_status` не `pending`

## ✅ **Выполненные исправления**

### 1. **Добавлено подробное логирование в PaymentController**

**Новые логи:**
```php
// Начало метода
Log::info('PaymentController::createPayment called', [
    'order_id' => $order->id,
    'user_id' => $request->user()?->id,
    'user_type' => $request->user()?->user_type,
    'user_status' => $request->user()?->status,
]);

// Проверка авторизации
Log::warning('Payment authorization failed', [
    'user_exists' => !!$user,
    'user_active' => $user ? $user->isActive() : false,
    'user_status' => $user ? $user->status : null,
]);

// Проверка прав доступа
Log::info('Checking payment access rights', [
    'user_type' => $user->user_type,
    'user_role' => $user->staff_role,
    'is_coordinator' => $user->isCoordinator(),
    'is_client' => $user->isClient(),
    'order_client_id' => $order->client_id,
    'user_id' => $user->id,
]);

// Проверка категории клиента
Log::info('Checking client category for payment', [
    'client_exists' => !!$client,
    'client_category' => $client ? $client->client_category : null,
    'order_client_id' => $order->client_id,
]);

// Проверка статуса заказа
Log::info('Checking order payment status', [
    'order_status' => $order->status,
    'payment_status' => $order->payment_status,
    'can_pay' => $order->isPendingPayment(),
]);

// Создание заказа в Algoritma
Log::info('Creating Algoritma order', [
    'order_data' => $orderData,
]);

Log::info('Algoritma order creation result', [
    'success' => $result['success'] ?? false,
    'order_id' => $result['order_id'] ?? null,
    'payment_url' => $result['payment_url'] ?? null,
    'error' => $result['error'] ?? null,
]);
```

### 2. **Добавлено подробное логирование в frontend**

**Новые логи:**
```typescript
console.log('Creating payment for order:', orderId);
console.log('Auth token exists:', !!token);
console.log('User data:', user);
console.log('User type:', user?.user_type);
console.log('User status:', user?.status);
console.log('User client category:', user?.client_category);
console.log('Payment response status:', response.status);
console.log('Payment response data:', data);
console.error('Payment error response:', errorData);
```

## 🔧 **Диагностические шаги**

### **1. Проверить логи Laravel:**
```bash
cd backend
tail -f storage/logs/laravel.log
```

### **2. Проверить статус пользователя:**
- `user_type` должен быть `'client'` или `'staff'`
- `status` должен быть `'active'`
- `client_category` должен быть `'one_time'` для клиентов

### **3. Проверить статус заказа:**
- `status` должен быть `'submitted'`
- `payment_status` должен быть `'pending'` или `null`
- `client_id` должен соответствовать ID пользователя

### **4. Проверить права доступа:**
- Координаторы могут создавать платежи для любых заказов
- Клиенты могут создавать платежи только для своих заказов

## 🎯 **Возможные решения**

### **1. Если проблема с авторизацией:**
```php
// Проверить, что пользователь активен
if (!$user || !$user->isActive()) {
    // Пользователь не активен
}
```

### **2. Если проблема с правами доступа:**
```php
// Проверить права доступа
if ($user->isCoordinator()) {
    $hasAccess = true;
} elseif ($user->isClient() && $order->client_id === $user->id) {
    $hasAccess = true;
}
```

### **3. Если проблема с категорией клиента:**
```php
// Проверить категорию клиента
if (!$client || $client->client_category !== 'one_time') {
    // Клиент не может оплачивать
}
```

### **4. Если проблема со статусом заказа:**
```php
// Проверить статус заказа
if (!$order->isPendingPayment()) {
    // Заказ не может быть оплачен
}
```

## 📊 **Ожидаемые логи**

### **Успешный платеж:**
```
PaymentController::createPayment called
Checking payment access rights
Checking client category for payment
Checking order payment status
Creating Algoritma order
Algoritma order creation result
Payment created successfully
```

### **Ошибка авторизации:**
```
Payment authorization failed
```

### **Ошибка прав доступа:**
```
Payment access denied
```

### **Ошибка категории клиента:**
```
Payment denied - client category check failed
```

### **Ошибка статуса заказа:**
```
Payment denied - order status check failed
```

## 🔄 **Следующие шаги**

### **1. Проверить логи:**
- Запустить сервер Laravel
- Попробовать создать платеж
- Проверить логи в `storage/logs/laravel.log`

### **2. Исправить проблемы:**
- Обновить статус пользователя
- Изменить категорию клиента
- Обновить статус заказа
- Исправить права доступа

### **3. Протестировать:**
- Создать тестового пользователя
- Создать тестовый заказ
- Попробовать создать платеж
- Проверить результат

## 🎯 **Преимущества диагностики**

### ✅ **Подробная информация:**
- 🔍 **Точная причина** ошибки
- 📊 **Подробные логи** для отладки
- 🎯 **Быстрое исправление** проблем
- 📱 **Лучшая диагностика** на всех уровнях

### ✅ **Улучшенная отладка:**
- 🔧 **Легко найти** проблему
- 📊 **Подробные логи** на сервере и клиенте
- 🎯 **Точные сообщения** об ошибках
- 📱 **Консистентность** диагностики

Ошибка 500 теперь должна быть диагностирована с подробными логами! 🎉

