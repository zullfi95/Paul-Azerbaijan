<?php

namespace App\Http\Controllers\Api;

use App\Services\IikoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IikoController extends BaseApiController
{
    private IikoService $iikoService;

    public function __construct(IikoService $iikoService)
    {
        $this->iikoService = $iikoService;
    }

    /**
     * Получить список организаций
     */
    public function getOrganizations(): JsonResponse
    {
        try {
            $organizations = $this->iikoService->getOrganizations();
            
            return $this->successResponse($organizations, 'Организации получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить меню организации
     */
    public function getMenu(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string'
        ]);

        try {
            $menu = $this->iikoService->getMenu($request->organization_id);
            
            return $this->successResponse($menu, 'Меню получено успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить внешнее меню с ценами
     */
    public function getExternalMenu(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string',
            'price_category_id' => 'nullable|string'
        ]);

        try {
            $menu = $this->iikoService->getExternalMenu(
                $request->organization_id,
                $request->price_category_id
            );
            
            return $this->successResponse($menu, 'Внешнее меню получено успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить категории цен
     */
    public function getPriceCategories(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string'
        ]);

        try {
            $priceCategories = $this->iikoService->getPriceCategories($request->organization_id);
            
            return $this->successResponse($priceCategories, 'Категории цен получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Синхронизировать меню
     */
    public function syncMenu(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string'
        ]);

        try {
            $result = $this->iikoService->syncMenu($request->organization_id);
            
            return $this->successResponse($result, 'Синхронизация меню выполнена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Проверить подключение к iiko API
     */
    public function testConnection(): JsonResponse
    {
        try {
            $token = $this->iikoService->getAccessToken();
            
            if ($token) {
                return $this->successResponse(['token' => $token], 'Подключение к iiko API успешно установлено');
            } else {
                return $this->unauthorizedResponse('Не удалось получить токен доступа');
            }
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить полную структуру данных меню для отладки
     * Показывает все поля, которые приходят из iiko API
     */
    public function debugMenuStructure(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string'
        ]);

        try {
            $menu = $this->iikoService->getMenu($request->organization_id);
            
            if (empty($menu)) {
                return $this->errorResponse('Меню пустое или не получено', 404);
            }

            // Анализируем структуру данных
            $structure = [
                'total_keys' => array_keys($menu),
                'has_productCategories' => isset($menu['productCategories']),
                'has_products' => isset($menu['products']),
                'categories_count' => isset($menu['productCategories']) ? count($menu['productCategories']) : 0,
                'products_count' => isset($menu['products']) ? count($menu['products']) : 0,
            ];

            // Берем первую категорию для анализа
            if (!empty($menu['productCategories'])) {
                $firstCategory = $menu['productCategories'][0];
                $structure['first_category'] = [
                    'keys' => array_keys($firstCategory),
                    'sample_data' => $firstCategory,
                ];
            }

            // Берем первый продукт для детального анализа
            if (!empty($menu['products'])) {
                $firstProduct = $menu['products'][0];
                $structure['first_product'] = [
                    'keys' => array_keys($firstProduct),
                    'full_data' => $firstProduct,
                    'has_ingredients' => isset($firstProduct['ingredients']) || isset($firstProduct['composition']),
                    'has_modifiers' => isset($firstProduct['modifiers']),
                    'has_sizePrices' => isset($firstProduct['sizePrices']),
                    'has_imageLinks' => isset($firstProduct['imageLinks']),
                    'has_tags' => isset($firstProduct['tags']),
                    'has_description' => isset($firstProduct['description']),
                ];

                // Детальный анализ sizePrices
                if (isset($firstProduct['sizePrices']) && is_array($firstProduct['sizePrices'])) {
                    $structure['first_product']['sizePrices_structure'] = [];
                    foreach ($firstProduct['sizePrices'] as $index => $sizePrice) {
                        $structure['first_product']['sizePrices_structure'][] = [
                            'index' => $index,
                            'keys' => array_keys($sizePrice),
                            'data' => $sizePrice,
                        ];
                    }
                }
            }

            // Полный ответ от API
            $structure['full_menu_response'] = $menu;

            return $this->successResponse($structure, 'Структура меню получена для отладки');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}
