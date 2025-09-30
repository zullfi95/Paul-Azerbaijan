<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    /**
     * Получить все категории меню для организации
     */
    public function getCategories(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string'
        ]);

        try {
            $categories = MenuCategory::active()
                ->forOrganization($request->organization_id)
                ->orderBy('sort_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении категорий: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить все элементы меню для организации
     */
    public function getMenuItems(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string',
            'category_id' => 'nullable|integer'
        ]);

        try {
            $query = MenuItem::active()
                ->available()
                ->forOrganization($request->organization_id)
                ->with('menuCategory')
                ->orderBy('sort_order');

            if ($request->category_id) {
                $query->where('menu_category_id', $request->category_id);
            }

            $items = $query->get();

            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении элементов меню: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить полное меню с категориями и элементами
     */
    public function getFullMenu(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string'
        ]);

        try {
            $categories = MenuCategory::active()
                ->forOrganization($request->organization_id)
                ->with(['activeMenuItems' => function ($query) {
                    $query->available()->orderBy('sort_order');
                }])
                ->orderBy('sort_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении меню: ' . $e->getMessage()
            ], 500);
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
                return response()->json([
                    'success' => false,
                    'message' => 'Элемент меню не найден'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении элемента меню: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Поиск по меню
     */
    public function searchMenu(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string',
            'query' => 'required|string|min:2'
        ]);

        try {
            $items = MenuItem::active()
                ->available()
                ->forOrganization($request->organization_id)
                ->with('menuCategory')
                ->where(function ($query) use ($request) {
                    $query->where('name', 'like', '%' . $request->query . '%')
                          ->orWhere('description', 'like', '%' . $request->query . '%');
                })
                ->orderBy('sort_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при поиске: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить статистику меню
     */
    public function getMenuStats(Request $request): JsonResponse
    {
        $request->validate([
            'organization_id' => 'required|string'
        ]);

        try {
            $stats = [
                'total_categories' => MenuCategory::active()
                    ->forOrganization($request->organization_id)
                    ->count(),
                'total_items' => MenuItem::active()
                    ->available()
                    ->forOrganization($request->organization_id)
                    ->count(),
                'categories_with_items' => MenuCategory::active()
                    ->forOrganization($request->organization_id)
                    ->whereHas('activeMenuItems')
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении статистики: ' . $e->getMessage()
            ], 500);
        }
    }
}