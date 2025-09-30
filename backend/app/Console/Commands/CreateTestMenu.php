<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MenuCategory;
use App\Models\MenuItem;

class CreateTestMenu extends Command
{
    protected $signature = 'create:test-menu';
    protected $description = 'Create test menu items for testing';

    public function handle()
    {
        // Находим существующую категорию или создаем новую
        $category = MenuCategory::where('iiko_id', 'test-category-1')->first();
        if (!$category) {
            $category = MenuCategory::create([
                'name' => 'Основные блюда',
                'organization_id' => 'default',
                'iiko_id' => 'test-category-1',
                'is_active' => true,
                'sort_order' => 1
            ]);
        }

        // Создаем тестовые блюда
        $items = [
            [
                'name' => 'Плов с бараниной',
                'description' => 'Традиционный узбекский плов с нежной бараниной',
                'price' => 15.50,
                'menu_category_id' => $category->id,
                'organization_id' => 'default',
                'iiko_id' => 'test-item-1',
                'is_active' => true,
                'sort_order' => 1
            ],
            [
                'name' => 'Шашлык из свинины',
                'description' => 'Сочный шашлык из свинины с овощами',
                'price' => 12.00,
                'menu_category_id' => $category->id,
                'organization_id' => 'default',
                'iiko_id' => 'test-item-2',
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'name' => 'Манты',
                'description' => 'Домашние манты с мясом и луком',
                'price' => 8.50,
                'menu_category_id' => $category->id,
                'organization_id' => 'default',
                'iiko_id' => 'test-item-3',
                'is_active' => true,
                'sort_order' => 3
            ],
            [
                'name' => 'Салат "Цезарь"',
                'description' => 'Классический салат с курицей и сыром',
                'price' => 7.00,
                'menu_category_id' => $category->id,
                'organization_id' => 'default',
                'iiko_id' => 'test-item-4',
                'is_active' => true,
                'sort_order' => 4
            ],
            [
                'name' => 'Пицца "Маргарита"',
                'description' => 'Классическая пицца с томатами и моцареллой',
                'price' => 18.00,
                'menu_category_id' => $category->id,
                'organization_id' => 'default',
                'iiko_id' => 'test-item-5',
                'is_active' => true,
                'sort_order' => 5
            ]
        ];

        foreach ($items as $item) {
            MenuItem::create($item);
        }

        $this->info('Test menu created successfully!');
        $this->info('Category: ' . $category->name);
        $this->info('Items created: ' . count($items));
    }
}