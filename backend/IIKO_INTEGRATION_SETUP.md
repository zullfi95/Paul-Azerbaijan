# Настройка интеграции с iiko API

## 1. Настройка переменных окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# iiko API настройки
IIKO_API_KEY=e443a1d8f6f941eba3d92fbed30bdefd
IIKO_BASE_URL=https://api-ru.iiko.services
```

## 2. Доступные API эндпоинты

Все эндпоинты требуют аутентификации и доступны только для координаторов:

### Проверка подключения
```
GET /api/iiko/test-connection
```

### Получение организаций
```
GET /api/iiko/organizations
```

### Получение меню организации
```
GET /api/iiko/menu?organization_id={organization_id}
```

### Получение внешнего меню с ценами
```
GET /api/iiko/external-menu?organization_id={organization_id}&price_category_id={price_category_id}
```

### Получение категорий цен
```
GET /api/iiko/price-categories?organization_id={organization_id}
```

### Синхронизация меню
```
POST /api/iiko/sync-menu
Content-Type: application/json

{
    "organization_id": "your_organization_id"
}
```

## 3. Примеры использования

### Проверка подключения
```bash
curl -X GET "http://your-domain/api/iiko/test-connection" \
  -H "Authorization: Bearer your_token"
```

### Получение списка организаций
```bash
curl -X GET "http://your-domain/api/iiko/organizations" \
  -H "Authorization: Bearer your_token"
```

### Получение меню
```bash
curl -X GET "http://your-domain/api/iiko/menu?organization_id=your_org_id" \
  -H "Authorization: Bearer your_token"
```

## 4. Структура ответов

### Успешный ответ
```json
{
    "success": true,
    "data": {
        // данные API
    }
}
```

### Ошибка
```json
{
    "success": false,
    "message": "Описание ошибки"
}
```

## 5. Логирование

Все запросы к iiko API логируются в `storage/logs/laravel.log`. Проверяйте логи при возникновении проблем.

## 6. Кэширование токенов

Токены доступа кэшируются на 50 минут (токен живет 1 час) для оптимизации производительности.

## 7. Безопасность

- API ключ хранится в переменных окружения
- Все эндпоинты защищены аутентификацией
- Доступ только для координаторов
- Логирование всех операций

## 8. Следующие шаги

1. Добавьте переменные в `.env` файл
2. Протестируйте подключение через `/api/iiko/test-connection`
3. Получите список организаций
4. Синхронизируйте меню для нужных организаций
5. Интегрируйте данные меню в ваше приложение
