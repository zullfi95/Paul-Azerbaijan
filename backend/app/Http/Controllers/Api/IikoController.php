<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\IikoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IikoController extends Controller
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
            
            return response()->json([
                'success' => true,
                'data' => $organizations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении организаций: ' . $e->getMessage()
            ], 500);
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
            
            return response()->json([
                'success' => true,
                'data' => $menu
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении меню: ' . $e->getMessage()
            ], 500);
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
            
            return response()->json([
                'success' => true,
                'data' => $menu
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении внешнего меню: ' . $e->getMessage()
            ], 500);
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
            
            return response()->json([
                'success' => true,
                'data' => $priceCategories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении категорий цен: ' . $e->getMessage()
            ], 500);
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
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при синхронизации меню: ' . $e->getMessage()
            ], 500);
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
                return response()->json([
                    'success' => true,
                    'message' => 'Подключение к iiko API успешно установлено'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Не удалось получить токен доступа'
                ], 401);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка подключения к iiko API: ' . $e->getMessage()
            ], 500);
        }
    }
}
