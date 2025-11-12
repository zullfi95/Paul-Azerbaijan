<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::query()->with('menuCategory');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->has('category_id')) {
            $query->where('menu_category_id', $request->input('category_id'));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('is_available')) {
            $query->where('is_available', $request->boolean('is_available'));
        }

        $menuItems = $query->paginate(10); // Пагинация по 10 элементов

        return response()->json([
            'success' => true,
            'data' => $menuItems,
            'message' => 'Позиции меню успешно загружены.'
        ]);
    }

    public function show(MenuItem $menuItem)
    {
        return response()->json([
            'success' => true,
            'data' => $menuItem->load('menuCategory'),
            'message' => 'Позиция меню успешно загружена.'
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|max:10',
            'menu_category_id' => 'required|exists:menu_categories,id',
            'organization_id' => 'nullable|string|max:255', // Если есть интеграция с iiko
            'images' => 'nullable|array|max:5', // Максимум 5 изображений
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Каждое изображение
            'allergens' => 'nullable|array',
            'allergens.*' => 'string|max:255',
            'is_available' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $imagePaths = $this->handleImageUpload($request);
        $validatedData['images'] = $imagePaths;

        $menuItem = MenuItem::create($validatedData);

        return response()->json([
            'success' => true,
            'data' => $menuItem->load('menuCategory'),
            'message' => 'Позиция меню успешно создана.'
        ], 201);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'currency' => 'sometimes|required|string|max:10',
            'menu_category_id' => 'sometimes|required|exists:menu_categories,id',
            'organization_id' => 'nullable|string|max:255',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'allergens' => 'nullable|array',
            'allergens.*' => 'string|max:255',
            'is_available' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
            'removed_images' => 'nullable|array', // Для удаления существующих изображений
            'removed_images.*' => 'string',
        ]);

        $existingImages = $menuItem->images ?? [];
        $imagesToKeep = array_filter($existingImages, function($image) use ($validatedData) {
            return !in_array($image, $validatedData['removed_images'] ?? []);
        });

        $this->deleteImages($validatedData['removed_images'] ?? []);

        $newImagePaths = $this->handleImageUpload($request);
        $validatedData['images'] = array_merge($imagesToKeep, $newImagePaths);

        $menuItem->update($validatedData);

        return response()->json([
            'success' => true,
            'data' => $menuItem->load('menuCategory'),
            'message' => 'Позиция меню успешно обновлена.'
        ]);
    }

    public function destroy(MenuItem $menuItem)
    {
        $this->deleteImages($menuItem->images ?? []);
        $menuItem->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Позиция меню успешно удалена.'
        ], 200);
    }

    private function handleImageUpload(Request $request, ?array $existingImages = []): array
    {
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('menu_items', 'public');
                $imagePaths[] = Storage::url($path);
            }
        }
        return $imagePaths;
    }

    private function deleteImages(array $imagePaths)
    {
        foreach ($imagePaths as $path) {
            // Удаляем префикс Storage::url, чтобы получить путь относительно public диска
            $relativePath = str_replace('/storage/', '', $path);
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }
    }
}
