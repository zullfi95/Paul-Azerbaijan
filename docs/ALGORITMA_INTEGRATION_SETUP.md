# Интеграция с Algoritma Payment API

## Настройка

### 1. Переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# Algoritma Payment API Configuration
ALGORITMA_API_KEY=your_algoritma_api_key_here
ALGORITMA_API_SECRET=your_algoritma_api_secret_here
ALGORITMA_BASE_URL=https://api.box:5001
ALGORITMA_ENVIRONMENT=test
```

### 2. Запуск миграций

```bash
php artisan migrate
```

### 3. Тестирование подключения

```bash
# Проверка подключения к API
curl -X GET "http://localhost:8000/api/payment/test-connection" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Получение тестовых карт
curl -X GET "http://localhost:8000/api/payment/test-cards" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

## API Endpoints

### Платежи

- `POST /api/payment/orders/{order}/create` - Создание платежа
- `GET /api/payment/orders/{order}/info` - Информация о платеже
- `POST /api/payment/orders/{order}/success` - Обработка успешного возврата
- `POST /api/payment/orders/{order}/failure` - Обработка неуспешного возврата

### Тестирование

- `GET /api/payment/test-connection` - Проверка подключения
- `GET /api/payment/test-cards` - Получение тестовых карт

## Тестовые карты

| Номер карты | Описание |
|-------------|----------|
| 4111111111111111 | Успешная авторизация |
| 2222400060000007 | Успешная авторизация |
| 4276990011343663 | Отклонение без 3-D Secure |
| 5555555555555599 | Внутренняя ошибка системы |
| 4276838748917319 | 3-D Secure "Not enrolled" |
| 4000000000000002 | Отклонение как мошенничество |

## Workflow

### 1. Создание платежа

1. Координатор создает заказ
2. Заказ получает статус `submitted` и `payment_status: pending`
3. Клиенту отправляется уведомление с ссылкой на оплату
4. Клиент переходит на страницу оплаты `/payment/{orderId}`
5. При нажатии "Оплатить" создается платеж в Algoritma
6. Клиент перенаправляется на Payment Page Algoritma

### 2. Обработка результата

**Успешная оплата:**
1. Algoritma перенаправляет на `/payment/success/{orderId}`
2. Система проверяет статус платежа в Algoritma
3. Заказ получает статус `paid` и `payment_status: charged`
4. Отправляются уведомления клиенту и координатору

**Неуспешная оплата:**
1. Algoritma перенаправляет на `/payment/failure/{orderId}`
2. Система проверяет статус платежа в Algoritma
3. Заказ получает `payment_status: failed`
4. Клиент может попробовать снова (максимум 3 попытки)

### 3. Ограничения

- Максимум 3 попытки оплаты на заказ
- После 3 неудачных попыток заказ отменяется
- Только координаторы могут создавать платежи
- Клиенты могут только просматривать информацию о платежах

## Статусы

### Статусы заказов
- `submitted` - отправлен, ожидает оплаты
- `paid` - оплачен
- `processing` - в работе
- `completed` - готов
- `cancelled` - отменен

### Статусы платежей
- `pending` - ожидает оплаты
- `authorized` - авторизован
- `charged` - списан
- `failed` - неуспешный
- `refunded` - возвращен
- `credited` - кредит

## Тестирование

### Запуск тестов

```bash
# Тесты AlgoritmaService
php artisan test tests/Feature/AlgoritmaServiceTest.php

# Тесты PaymentController
php artisan test tests/Feature/PaymentControllerTest.php

# Все тесты
php artisan test
```

### Тестовые сценарии

1. **Успешная оплата**
   - Создать заказ
   - Создать платеж
   - Имитировать успешную оплату
   - Проверить обновление статусов

2. **Неуспешная оплата**
   - Создать заказ
   - Создать платеж
   - Имитировать неуспешную оплату
   - Проверить возможность повторной попытки

3. **3-D Secure**
   - Использовать тестовую карту 4276990011343663
   - Проверить обработку 3-D Secure

4. **Превышение лимита попыток**
   - Создать заказ
   - Выполнить 3 неуспешные попытки
   - Проверить отмену заказа

## Безопасность

- Все API запросы требуют аутентификации
- Используется Basic Authentication для Algoritma API
- Логирование всех операций с платежами
- Валидация всех входящих данных
- Ограничение попыток оплаты

## Мониторинг

- Логи платежей: `storage/logs/laravel.log`
- Статусы заказов отслеживаются в базе данных
- Уведомления отправляются при изменении статусов

## Поддержка

При возникновении проблем:
1. Проверьте логи в `storage/logs/laravel.log`
2. Убедитесь в правильности настроек API
3. Проверьте статус подключения через тестовый endpoint
4. Обратитесь к документации Algoritma API
