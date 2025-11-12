<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use Illuminate\Http\Request;

class MenuCategoryController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::orderBy('sort_order')->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Категории меню успешно загружены.'
        ]);
    }

    public function show(MenuCategory $menuCategory)
    {
        return response()->json([
            'success' => true,
            'data' => $menuCategory,
            'message' => 'Категория меню успешно загружена.'
        ]);
    }
}
