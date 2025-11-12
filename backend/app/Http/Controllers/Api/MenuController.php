<?php

namespace App\Http\Controllers\Api;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MenuController extends BaseApiController
{
    /**
     * Получить все категории меню для организации
     */
    public function getCategories(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'nullable|string'
        ]);

        try {
            $query = MenuCategory::active()
                ->orderBy('sort_order');

            // Фильтруем по организации только если указан organization_id
            if ($request->organization_id) {
                $query->forOrganization($request->organization_id);
            }

            $categories = $query->get();

            return $this->successResponse($categories, 'Категории меню получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить все элементы меню для организации
     */
    public function getMenuItems(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'nullable|string',
            'category_id' => 'nullable|integer'
        ]);

        try {
            $query = MenuItem::active()
                ->available()
                ->with('menuCategory')
                ->orderBy('sort_order');

            // Фильтруем по организации только если указан organization_id
            if ($request->organization_id) {
                $query->forOrganization($request->organization_id);
            }

            if ($request->category_id) {
                $query->where('menu_category_id', $request->category_id);
            }

            $items = $query->get();

            return $this->successResponse($items, 'Элементы меню получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить полное меню с категориями и элементами
     */
    public function getFullMenu(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'nullable|string'
        ]);

        try {
            $query = MenuCategory::active()
                ->with(['activeMenuItems' => function ($query) {
                    $query->available()->orderBy('sort_order');
                }])
                ->orderBy('sort_order');

            // Фильтруем по организации только если указан organization_id
            if ($request->organization_id) {
                $query->forOrganization($request->organization_id);
            }

            $categories = $query->get();

            return $this->successResponse($categories, 'Полное меню получено успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить конкретный элемент меню
     */
    public function getMenuItem(Request $request, int $id): JsonResponse
    {
        try {
            $item = MenuItem::active()
                ->with('menuCategory')
                ->find($id);

            if (!$item) {
                return $this->notFoundResponse('Элемент меню не найден');
            }

            return $this->successResponse($item, 'Элемент меню получен успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Поиск по меню
     */
    public function searchMenu(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'nullable|string',
            'query' => 'required|string|min:2'
        ]);

        try {
            $searchQuery = $request->input('query');
            $query = MenuItem::active()
                ->available()
                ->with('menuCategory')
                ->where(function ($q) use ($searchQuery) {
                    $q->where('name', 'like', '%' . $searchQuery . '%')
                      ->orWhere('description', 'like', '%' . $searchQuery . '%');
                })
                ->orderBy('sort_order');

            // Фильтруем по организации только если указан organization_id
            if ($request->organization_id) {
                $query->forOrganization($request->organization_id);
            }

            $items = $query->get();

            return $this->successResponse($items, 'Результаты поиска получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить статистику меню
     */
    public function getMenuStats(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'nullable|string'
        ]);

        try {
            $categoryQuery = MenuCategory::active();
            $itemQuery = MenuItem::active()->available();
            $categoriesWithItemsQuery = MenuCategory::active()->whereHas('activeMenuItems');

            // Фильтруем по организации только если указан organization_id
            if ($request->organization_id) {
                $categoryQuery->forOrganization($request->organization_id);
                $itemQuery->forOrganization($request->organization_id);
                $categoriesWithItemsQuery->forOrganization($request->organization_id);
            }

            $stats = [
                'total_categories' => $categoryQuery->count(),
                'total_items' => $itemQuery->count(),
                'categories_with_items' => $categoriesWithItemsQuery->count(),
            ];

            return $this->successResponse($stats, 'Статистика меню получена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}