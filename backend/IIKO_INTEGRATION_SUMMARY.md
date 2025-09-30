# Сводка по интеграции с iiko API

## ✅ Что было реализовано

### 1. Основной сервис (`IikoService`)
- **Файл**: `app/Services/IikoService.php`
- **Функции**:
  - Получение токена доступа с кэшированием
  - Получение списка организаций
  - Получение меню организации
  - Получение внешнего меню с ценами
  - Получение категорий цен
  - Синхронизация меню

### 2. API контроллер (`IikoController`)
- **Файл**: `app/Http/Controllers/Api/IikoController.php`
- **Эндпоинты**:
  - `GET /api/iiko/test-connection` - проверка подключения
  - `GET /api/iiko/organizations` - список организаций
  - `GET /api/iiko/menu` - получение меню
  - `GET /api/iiko/external-menu` - внешнее меню с ценами
  - `GET /api/iiko/price-categories` - категории цен
  - `POST /api/iiko/sync-menu` - синхронизация меню

### 3. Конфигурация
- **Файл**: `config/services.php`
- **Переменные окружения**:
  - `IIKO_API_KEY` - ваш API ключ
  - `IIKO_BASE_URL` - базовый URL API (по умолчанию: https://api-ru.iiko.services)

### 4. Artisan команды
- **Файл**: `app/Console/Commands/TestIikoConnection.php`
  - Команда: `php artisan iiko:test-connection`
  - Проверяет подключение и показывает организации

- **Файл**: `app/Console/Commands/SyncIikoMenu.php`
  - Команда: `php artisan iiko:sync-menu [organization_id]`
  - Синхронизирует меню для организации

### 5. Тесты
- **Файл**: `tests/Feature/IikoServiceTest.php`
- **Покрытие**: все основные методы сервиса с моками

### 6. Документация
- `IIKO_INTEGRATION_SETUP.md` - инструкция по настройке
- `IIKO_USAGE_EXAMPLES.md` - примеры использования
- `IIKO_INTEGRATION_SUMMARY.md` - эта сводка

## 🚀 Как начать использовать

### 1. Настройка
```bash
# Добавьте в .env файл
IIKO_API_KEY=e443a1d8f6f941eba3d92fbed30bdefd
```

### 2. Тестирование
```bash
# Проверка подключения
php artisan iiko:test-connection

# Синхронизация меню
php artisan iiko:sync-menu
```

### 3. Использование в коде
```php
use App\Services\IikoService;

// В контроллере или сервисе
$iikoService = app(IikoService::class);
$organizations = $iikoService->getOrganizations();
$menu = $iikoService->getExternalMenu($organizationId);
```

## 🔧 Технические детали

### Аутентификация
- Использует API ключ для получения токена доступа
- Токен кэшируется на 50 минут (срок жизни 1 час)
- Автоматическое обновление токена при необходимости

### Обработка ошибок
- Все ошибки логируются в `storage/logs/laravel.log`
- Возвращаются структурированные ответы с флагом `success`
- Graceful handling при недоступности API

### Безопасность
- API ключ хранится в переменных окружения
- Все эндпоинты защищены аутентификацией
- Доступ только для координаторов

## 📊 Структура данных

### Организации
```json
[
  {
    "id": "uuid",
    "name": "Название организации",
    "type": "restaurant"
  }
]
```

### Меню
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Категория",
      "items": []
    }
  ],
  "products": [
    {
      "id": "uuid",
      "name": "Блюдо",
      "price": 100.00,
      "category": "uuid"
    }
  ]
}
```

## 🎯 Следующие шаги

1. **Добавьте переменную в .env**:
   ```env
   IIKO_API_KEY=e443a1d8f6f941eba3d92fbed30bdefd
   ```

2. **Протестируйте подключение**:
   ```bash
   php artisan iiko:test-connection
   ```

3. **Получите ID организации** из вывода команды

4. **Синхронизируйте меню**:
   ```bash
   php artisan iiko:sync-menu your_organization_id
   ```

5. **Интегрируйте в ваше приложение** используя примеры из `IIKO_USAGE_EXAMPLES.md`

## 🔍 Мониторинг

- Проверяйте логи: `tail -f storage/logs/laravel.log | grep iiko`
- Используйте команду `iiko:test-connection` для диагностики
- Мониторьте кэш токенов в Redis/Database

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи
2. Убедитесь в правильности API ключа
3. Проверьте доступность iiko API
4. Используйте команды для диагностики
