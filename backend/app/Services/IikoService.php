<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\MenuCategory;
use App\Models\MenuItem;

class IikoService
{
    private string $apiKey;
    private string $baseUrl;
    private ?string $accessToken = null;

    public function __construct()
    {
        $this->apiKey = config('services.iiko.api_key');
        $this->baseUrl = config('services.iiko.base_url', 'https://api-ru.iiko.services');
    }

    /**
     * Получить токен доступа
     */
    public function getAccessToken(): ?string
    {
        // Проверяем кэш
        $cachedToken = Cache::get('iiko_access_token');
        if ($cachedToken) {
            $this->accessToken = $cachedToken;
            return $cachedToken;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Api-Key ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/api/1/access_token', [
                'apiLogin' => $this->apiKey
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->accessToken = $data['token'] ?? null;
                
                if ($this->accessToken) {
                    // Кэшируем токен на 50 минут (токен живет 1 час)
                    Cache::put('iiko_access_token', $this->accessToken, now()->addMinutes(50));
                }
                
                return $this->accessToken;
            } else {
                Log::error('Failed to get iiko access token', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception while getting iiko access token', [
                'message' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Получить список организаций
     */
    public function getOrganizations(): array
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/api/1/organizations');

            if ($response->successful()) {
                return $response->json()['organizations'] ?? [];
            } else {
                Log::error('Failed to get organizations', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception while getting organizations', [
                'message' => $e->getMessage()
            ]);
        }

        return [];
    }

    /**
     * Получить меню организации
     */
    public function getMenu(string $organizationId): array
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/api/1/nomenclature', [
                'organizationId' => $organizationId
            ]);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Failed to get menu', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'organizationId' => $organizationId
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception while getting menu', [
                'message' => $e->getMessage(),
                'organizationId' => $organizationId
            ]);
        }

        return [];
    }

    /**
     * Получить внешнее меню с ценами
     */
    public function getExternalMenu(string $organizationId, ?string $priceCategoryId = null): array
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return [];
        }

        try {
            $requestData = [
                'organizationId' => $organizationId
            ];

            if ($priceCategoryId) {
                $requestData['priceCategoryId'] = $priceCategoryId;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/api/2/menu', $requestData);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Failed to get external menu', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'organizationId' => $organizationId,
                    'priceCategoryId' => $priceCategoryId
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception while getting external menu', [
                'message' => $e->getMessage(),
                'organizationId' => $organizationId,
                'priceCategoryId' => $priceCategoryId
            ]);
        }

        return [];
    }

    /**
     * Получить категории цен
     */
    public function getPriceCategories(string $organizationId): array
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/api/1/price_categories', [
                'organizationId' => $organizationId
            ]);

            if ($response->successful()) {
                return $response->json()['priceCategories'] ?? [];
            } else {
                Log::error('Failed to get price categories', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'organizationId' => $organizationId
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception while getting price categories', [
                'message' => $e->getMessage(),
                'organizationId' => $organizationId
            ]);
        }

        return [];
    }

    /**
     * Синхронизировать меню для организации
     */
    public function syncMenu(string $organizationId): array
    {
        // Используем обычное меню (nomenclature API)
        $menu = $this->getMenu($organizationId);
        
        if (empty($menu)) {
            return ['success' => false, 'message' => 'Не удалось получить меню'];
        }

        try {
            \DB::beginTransaction();

            // Синхронизируем категории из productCategories
            $categoriesCount = $this->syncCategories($organizationId, $menu['productCategories'] ?? []);
            
            // Синхронизируем продукты
            $itemsCount = $this->syncMenuItems($organizationId, $menu['products'] ?? []);

            \DB::commit();

            return [
                'success' => true,
                'message' => 'Меню успешно синхронизировано',
                'data' => [
                    'categories_count' => $categoriesCount,
                    'items_count' => $itemsCount,
                    'organization_id' => $organizationId
                ]
            ];
        } catch (\Exception $e) {
            \DB::rollBack();
            Log::error('Error syncing menu', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => 'Ошибка при синхронизации меню: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Синхронизировать категории меню
     */
    private function syncCategories(string $organizationId, array $groups): int
    {
        $count = 0;
        
        foreach ($groups as $index => $group) {
            $category = MenuCategory::updateOrCreate(
                ['iiko_id' => $group['id']],
                [
                    'name' => $group['name'] ?? 'Без названия',
                    'description' => $group['description'] ?? null,
                    'organization_id' => $organizationId,
                    'sort_order' => $index,
                    'is_active' => true,
                ]
            );
            $count++;
        }
        
        return $count;
    }

    /**
     * Синхронизировать элементы меню
     */
    private function syncMenuItems(string $organizationId, array $products): int
    {
        $count = 0;
        
        foreach ($products as $index => $product) {
            // Найти категорию по productCategoryId
            $category = MenuCategory::where('iiko_id', $product['productCategoryId'] ?? null)
                ->where('organization_id', $organizationId)
                ->first();
            
            if (!$category) {
                Log::warning('Category not found for product', [
                    'product_id' => $product['id'] ?? null,
                    'product_category_id' => $product['productCategoryId'] ?? null,
                    'organization_id' => $organizationId
                ]);
                continue;
            }

            // Получаем цену из sizePrices
            $price = 0;
            if (!empty($product['sizePrices']) && is_array($product['sizePrices'])) {
                $firstSize = $product['sizePrices'][0];
                $price = $firstSize['price']['currentPrice'] ?? 0;
            }

            $menuItem = MenuItem::updateOrCreate(
                ['iiko_id' => $product['id']],
                [
                    'name' => $product['name'] ?? 'Без названия',
                    'description' => $product['description'] ?? null,
                    'price' => $price,
                    'currency' => 'AZN', // По умолчанию манаты
                    'menu_category_id' => $category->id,
                    'organization_id' => $organizationId,
                    'images' => $product['imageLinks'] ?? null,
                    'allergens' => $product['tags'] ?? null,
                    'is_available' => !($product['isDeleted'] ?? false),
                    'is_active' => true,
                    'sort_order' => $product['order'] ?? $index,
                ]
            );
            $count++;
        }
        
        return $count;
    }
}
