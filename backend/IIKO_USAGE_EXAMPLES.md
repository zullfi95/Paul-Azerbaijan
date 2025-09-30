# Примеры использования iiko API интеграции

## 1. Настройка

Добавьте в ваш `.env` файл:
```env
IIKO_API_KEY=e443a1d8f6f941eba3d92fbed30bdefd
```

## 2. Тестирование через Artisan команды

### Проверка подключения
```bash
php artisan iiko:test-connection
```

### Синхронизация меню
```bash
# Синхронизация для конкретной организации
php artisan iiko:sync-menu your_organization_id

# Интерактивный выбор организации
php artisan iiko:sync-menu
```

## 3. Использование в коде

### В контроллере
```php
use App\Services\IikoService;

class YourController extends Controller
{
    public function __construct(private IikoService $iikoService) {}

    public function getMenu()
    {
        $organizations = $this->iikoService->getOrganizations();
        $menu = $this->iikoService->getExternalMenu($organizationId);
        
        return response()->json([
            'organizations' => $organizations,
            'menu' => $menu
        ]);
    }
}
```

### В сервисе
```php
use App\Services\IikoService;

class MenuService
{
    public function __construct(private IikoService $iikoService) {}

    public function updateMenuFromIiko(string $organizationId): array
    {
        $menu = $this->iikoService->getExternalMenu($organizationId);
        
        // Обработка данных меню
        foreach ($menu['groups'] ?? [] as $group) {
            // Сохранение категорий
            $this->saveCategory($group);
        }
        
        foreach ($menu['products'] ?? [] as $product) {
            // Сохранение продуктов
            $this->saveProduct($product);
        }
        
        return ['success' => true, 'count' => count($menu['products'] ?? [])];
    }
}
```

## 4. API запросы

### Получение токена (автоматически)
```php
$token = $iikoService->getAccessToken();
```

### Получение организаций
```php
$organizations = $iikoService->getOrganizations();
```

### Получение меню
```php
$menu = $iikoService->getMenu($organizationId);
```

### Получение внешнего меню с ценами
```php
$externalMenu = $iikoService->getExternalMenu($organizationId, $priceCategoryId);
```

### Получение категорий цен
```php
$priceCategories = $iikoService->getPriceCategories($organizationId);
```

## 5. Обработка ошибок

```php
try {
    $menu = $iikoService->getExternalMenu($organizationId);
    
    if (empty($menu)) {
        throw new \Exception('Menu is empty');
    }
    
    // Обработка меню
    
} catch (\Exception $e) {
    Log::error('Failed to get menu from iiko', [
        'organization_id' => $organizationId,
        'error' => $e->getMessage()
    ]);
    
    return response()->json([
        'success' => false,
        'message' => 'Не удалось получить меню'
    ], 500);
}
```

## 6. Кэширование

Токены автоматически кэшируются на 50 минут. Для принудительного обновления:

```php
// Очистка кэша токена
Cache::forget('iiko_access_token');

// Получение нового токена
$newToken = $iikoService->getAccessToken();
```

## 7. Логирование

Все запросы к iiko API автоматически логируются. Проверьте логи:

```bash
tail -f storage/logs/laravel.log | grep iiko
```

## 8. Структура данных меню

```php
// Пример структуры ответа от getExternalMenu()
[
    'groups' => [
        [
            'id' => 'uuid',
            'name' => 'Название категории',
            'description' => 'Описание',
            'items' => [
                // продукты в категории
            ]
        ]
    ],
    'products' => [
        [
            'id' => 'uuid',
            'name' => 'Название блюда',
            'description' => 'Описание',
            'price' => 100.00,
            'category' => 'uuid',
            'images' => [
                // ссылки на изображения
            ]
        ]
    ]
]
```
