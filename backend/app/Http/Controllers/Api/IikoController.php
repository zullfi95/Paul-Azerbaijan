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
}
