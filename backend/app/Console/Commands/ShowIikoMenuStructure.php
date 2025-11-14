<?php

namespace App\Console\Commands;

use App\Services\IikoService;
use Illuminate\Console\Command;

class ShowIikoMenuStructure extends Command
{
    protected $signature = 'iiko:show-menu-structure {organization_id?}';
    protected $description = 'Показать полную структуру данных меню из iiko API';

    public function handle(IikoService $iikoService)
    {
        $organizationId = $this->argument('organization_id');
        
        if (!$organizationId) {
            $this->info('Получаем список организаций...');
            $organizations = $iikoService->getOrganizations();
            
            if (empty($organizations)) {
                $this->error('Не удалось получить список организаций');
                return 1;
            }
            
            $this->info('Доступные организации:');
            foreach ($organizations as $index => $org) {
                $this->line(sprintf('%d. %s (ID: %s)', $index + 1, $org['name'] ?? 'Без названия', $org['id'] ?? 'N/A'));
            }
            
            $choice = $this->ask('Выберите номер организации');
            $selectedOrg = $organizations[(int)$choice - 1] ?? null;
            
            if (!$selectedOrg || !isset($selectedOrg['id'])) {
                $this->error('Неверный выбор');
                return 1;
            }
            
            $organizationId = $selectedOrg['id'];
        }

        $this->info("Получаем меню для организации: {$organizationId}");
        
        $menu = $iikoService->getMenu($organizationId);
        
        if (empty($menu)) {
            $this->error('Не удалось получить меню');
            return 1;
        }

        $this->info("\n=== СТРУКТУРА ОТВЕТА ОТ IIKO API ===\n");
        
        // Общая информация
        $this->line("Ключи верхнего уровня: " . implode(', ', array_keys($menu)));
        $this->line("Количество категорий: " . (isset($menu['productCategories']) ? count($menu['productCategories']) : 0));
        $this->line("Количество продуктов: " . (isset($menu['products']) ? count($menu['products']) : 0));
        
        // Анализ первой категории
        if (!empty($menu['productCategories'])) {
            $firstCategory = $menu['productCategories'][0];
            $this->info("\n--- СТРУКТУРА КАТЕГОРИИ ---");
            $this->line("Ключи категории: " . implode(', ', array_keys($firstCategory)));
            $this->table(
                ['Поле', 'Тип', 'Значение'],
                array_map(function($key, $value) {
                    return [
                        $key,
                        gettype($value),
                        is_array($value) ? 'Array[' . count($value) . ']' : (is_string($value) && strlen($value) > 50 ? substr($value, 0, 50) . '...' : $value)
                    ];
                }, array_keys($firstCategory), $firstCategory)
            );
        }
        
        // Анализ первого продукта
        if (!empty($menu['products'])) {
            $firstProduct = $menu['products'][0];
            $this->info("\n--- СТРУКТУРА ПРОДУКТА ---");
            $this->line("Название продукта: " . ($firstProduct['name'] ?? 'N/A'));
            $this->line("ID продукта: " . ($firstProduct['id'] ?? 'N/A'));
            $this->line("\nВсе поля продукта:");
            
            $productFields = [];
            foreach ($firstProduct as $key => $value) {
                $type = gettype($value);
                $description = $this->getFieldDescription($key, $value);
                
                if (is_array($value)) {
                    $valuePreview = 'Array[' . count($value) . ']';
                    if (!empty($value) && is_array($value[0])) {
                        $valuePreview .= ' (вложенные массивы)';
                    }
                } elseif (is_string($value) && strlen($value) > 100) {
                    $valuePreview = substr($value, 0, 100) . '...';
                } else {
                    $valuePreview = $value;
                }
                
                $productFields[] = [
                    'Поле' => $key,
                    'Тип' => $type,
                    'Описание' => $description,
                    'Пример значения' => $valuePreview
                ];
            }
            
            $this->table(['Поле', 'Тип', 'Описание', 'Пример значения'], $productFields);
            
            // Детальный анализ sizePrices
            if (isset($firstProduct['sizePrices']) && is_array($firstProduct['sizePrices'])) {
                $this->info("\n--- СТРУКТУРА sizePrices ---");
                foreach ($firstProduct['sizePrices'] as $index => $sizePrice) {
                    $this->line("\nРазмер #" . ($index + 1) . ":");
                    $this->table(
                        ['Поле', 'Тип', 'Значение'],
                        array_map(function($key, $value) {
                            return [
                                $key,
                                gettype($value),
                                is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : $value
                            ];
                        }, array_keys($sizePrice), $sizePrice)
                    );
                }
            }
            
            // Проверка наличия состава
            $this->info("\n--- ПРОВЕРКА СОСТАВА БЛЮД ---");
            $hasIngredients = isset($firstProduct['ingredients']);
            $hasComposition = isset($firstProduct['composition']);
            $hasModifiers = isset($firstProduct['modifiers']);
            
            $this->line("ingredients: " . ($hasIngredients ? "✓ ЕСТЬ" : "✗ НЕТ"));
            if ($hasIngredients) {
                $this->line("  Тип: " . gettype($firstProduct['ingredients']));
                if (is_array($firstProduct['ingredients'])) {
                    $this->line("  Количество элементов: " . count($firstProduct['ingredients']));
                    if (!empty($firstProduct['ingredients'])) {
                        $this->line("  Пример: " . (is_array($firstProduct['ingredients'][0]) ? json_encode($firstProduct['ingredients'][0], JSON_UNESCAPED_UNICODE) : $firstProduct['ingredients'][0]));
                    }
                } else {
                    $this->line("  Значение: " . (strlen($firstProduct['ingredients']) > 200 ? substr($firstProduct['ingredients'], 0, 200) . '...' : $firstProduct['ingredients']));
                }
            }
            
            $this->line("composition: " . ($hasComposition ? "✓ ЕСТЬ" : "✗ НЕТ"));
            if ($hasComposition) {
                $this->line("  Тип: " . gettype($firstProduct['composition']));
                if (is_array($firstProduct['composition'])) {
                    $this->line("  Количество элементов: " . count($firstProduct['composition']));
                } else {
                    $this->line("  Значение: " . (strlen($firstProduct['composition']) > 200 ? substr($firstProduct['composition'], 0, 200) . '...' : $firstProduct['composition']));
                }
            }
            
            $this->line("modifiers: " . ($hasModifiers ? "✓ ЕСТЬ" : "✗ НЕТ"));
            if ($hasModifiers) {
                $this->line("  Тип: " . gettype($firstProduct['modifiers']));
                if (is_array($firstProduct['modifiers'])) {
                    $this->line("  Количество элементов: " . count($firstProduct['modifiers']));
                    if (!empty($firstProduct['modifiers'])) {
                        $this->line("  Структура первого модификатора:");
                        $this->line("    Ключи: " . implode(', ', array_keys($firstProduct['modifiers'][0])));
                    }
                }
            }
        }
        
        // Сохраняем полный JSON в файл для детального анализа
        $jsonFile = storage_path('logs/iiko_menu_structure_' . date('Y-m-d_His') . '.json');
        file_put_contents($jsonFile, json_encode($menu, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->info("\nПолная структура сохранена в: {$jsonFile}");
        
        return 0;
    }
    
    private function getFieldDescription(string $key, $value): string
    {
        $descriptions = [
            'id' => 'Уникальный идентификатор (UUID)',
            'name' => 'Название',
            'description' => 'Описание',
            'productCategoryId' => 'ID категории продукта',
            'sizePrices' => 'Массив размеров с ценами',
            'imageLinks' => 'Массив ссылок на изображения',
            'tags' => 'Теги/аллергены',
            'isDeleted' => 'Флаг удаления',
            'order' => 'Порядок сортировки',
            'ingredients' => 'Состав блюда',
            'composition' => 'Состав блюда (альтернативное поле)',
            'modifiers' => 'Модификаторы (размеры, добавки)',
            'nutritionInfo' => 'Пищевая ценность',
            'sku' => 'Артикул',
            'code' => 'Код товара',
            'measureUnit' => 'Единица измерения',
            'type' => 'Тип продукта',
        ];
        
        return $descriptions[$key] ?? 'Неизвестное поле';
    }
}

