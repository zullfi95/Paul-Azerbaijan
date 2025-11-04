<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\AlgoritmaService;

echo "=== ПРОВЕРКА ПОДКЛЮЧЕНИЯ К ALGORITMA API ===\n\n";

// Получаем конфигурацию
$config = [
    'API Key' => config('services.algoritma.api_key'),
    'API Secret' => substr(config('services.algoritma.api_secret'), 0, 5) . '***',
    'Base URL' => config('services.algoritma.base_url'),
    'Environment' => config('services.algoritma.environment'),
];

echo "Конфигурация:\n";
foreach ($config as $key => $value) {
    echo "  $key: $value\n";
}

echo "\n--- Тестирование подключения ---\n";

$service = new AlgoritmaService();
$result = $service->testConnection();

if ($result['success']) {
    echo "✅ УСПЕХ!\n";
    echo "Сообщение: " . ($result['message'] ?? 'N/A') . "\n";
    echo "Дата: " . ($result['date'] ?? 'N/A') . "\n";
    if (isset($result['response_data'])) {
        echo "Данные ответа: " . json_encode($result['response_data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    }
} else {
    echo "❌ ОШИБКА!\n";
    echo "Ошибка: " . ($result['error'] ?? 'Unknown error') . "\n";
    if (isset($result['status'])) {
        echo "HTTP Status: " . $result['status'] . "\n";
    }
    if (isset($result['response_body'])) {
        echo "Тело ответа: " . $result['response_body'] . "\n";
    }
}

echo "\n--- Тестовые карты ---\n";
$testCards = $service->getTestCards();
echo "Доступно тестовых карт: " . count($testCards) . "\n";
echo "Пример (успешная карта): " . $testCards['success']['number'] . "\n";

echo "\n=== ТЕСТ ЗАВЕРШЕН ===\n";

