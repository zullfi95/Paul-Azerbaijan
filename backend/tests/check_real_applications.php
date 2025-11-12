<?php

require_once 'vendor/autoload.php';

// Загружаем Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Application;

echo "=== ПРОВЕРКА РЕАЛЬНЫХ ЗАЯВОК ===\n\n";

$applications = Application::latest()->take(5)->get(['id', 'first_name', 'last_name', 'cart_items', 'created_at']);

echo "📊 Найдено заявок: " . $applications->count() . "\n\n";

foreach ($applications as $app) {
    echo "📋 Заявка ID: {$app->id}\n";
    echo "👤 Имя: {$app->first_name} {$app->last_name}\n";
    echo "📅 Создана: {$app->created_at}\n";
    
    $cartItems = $app->cart_items;
    echo "🛒 cart_items тип: " . gettype($cartItems) . "\n";
    
    if (is_null($cartItems)) {
        echo "❌ cart_items = NULL\n";
    } elseif (is_array($cartItems)) {
        $count = count($cartItems);
        echo "📦 Товаров в корзине: {$count}\n";
        
        if ($count === 0) {
            echo "⚠️ Корзина пустая (пустой массив)\n";
        } else {
            echo "✅ Корзина содержит товары:\n";
            foreach ($cartItems as $index => $item) {
                echo "  {$index}: {$item['name']} x{$item['quantity']} = {$item['price']} ₼\n";
            }
        }
    } else {
        echo "❓ cart_items неожиданный тип: " . json_encode($cartItems) . "\n";
    }
    
    echo str_repeat("-", 50) . "\n\n";
}

?>
