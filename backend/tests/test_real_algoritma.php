<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║   РЕАЛЬНЫЙ ТЕСТ ПОДКЛЮЧЕНИЯ К ALGORITMA API               ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

$apiKey = config('services.algoritma.api_key');
$apiSecret = config('services.algoritma.api_secret');
$baseUrl = config('services.algoritma.base_url');

echo "📋 Конфигурация:\n";
echo "   API Key: {$apiKey}\n";
echo "   API Secret: " . substr($apiSecret, 0, 5) . "***\n";
echo "   Base URL: {$baseUrl}\n";
echo "   Environment: " . config('services.algoritma.environment') . "\n\n";

echo "🔄 Выполняем РЕАЛЬНЫЙ запрос к API...\n";
echo str_repeat("-", 60) . "\n";

try {
    $endpoint = $baseUrl . '/ping';
    
    echo "📡 Endpoint: {$endpoint}\n";
    echo "🔐 Используем Basic Auth...\n\n";
    
    $response = Http::timeout(10)
        ->withBasicAuth($apiKey, $apiSecret)
        ->withHeaders([
            'Accept' => 'application/json',
            'User-Agent' => 'PAUL-Azerbaijan/1.0',
        ])
        ->get($endpoint);
    
    $statusCode = $response->status();
    $body = $response->body();
    
    echo "📊 РЕЗУЛЬТАТ:\n";
    echo str_repeat("=", 60) . "\n";
    echo "HTTP Status: {$statusCode}\n";
    echo "Response Headers:\n";
    foreach ($response->headers() as $header => $values) {
        echo "  {$header}: " . implode(', ', $values) . "\n";
    }
    echo "\nResponse Body:\n";
    echo $body . "\n";
    echo str_repeat("=", 60) . "\n\n";
    
    if ($response->successful()) {
        $data = $response->json();
        echo "✅ УСПЕШНОЕ ПОДКЛЮЧЕНИЕ!\n";
        echo "   Сообщение: " . ($data['message'] ?? 'N/A') . "\n";
        echo "   Дата: " . ($data['date'] ?? 'N/A') . "\n";
        
        if (isset($data['mock']) && $data['mock']) {
            echo "   ⚠️  Внимание: Это все еще моковый ответ!\n";
        } else {
            echo "   ✓ Это РЕАЛЬНЫЙ ответ от Algoritma!\n";
        }
    } else {
        echo "❌ ОШИБКА ПОДКЛЮЧЕНИЯ\n";
        echo "   HTTP Status: {$statusCode}\n";
        
        if ($statusCode === 401) {
            echo "   🔒 Ошибка авторизации - проверьте API ключ и секрет\n";
        } elseif ($statusCode === 404) {
            echo "   🔍 Endpoint не найден - проверьте Base URL\n";
        } elseif ($statusCode === 500) {
            echo "   ⚠️  Ошибка сервера Algoritma\n";
        }
        
        try {
            $errorData = $response->json();
            if (isset($errorData['failure_message'])) {
                echo "   Сообщение об ошибке: " . $errorData['failure_message'] . "\n";
            }
        } catch (\Exception $e) {
            // ignore
        }
    }
    
} catch (\Illuminate\Http\Client\ConnectionException $e) {
    echo "❌ ОШИБКА СОЕДИНЕНИЯ\n";
    echo "   Не удалось подключиться к серверу\n";
    echo "   Проверьте:\n";
    echo "   - Интернет соединение\n";
    echo "   - Правильность URL: {$baseUrl}\n";
    echo "   - Firewall настройки\n\n";
    echo "   Детали: " . $e->getMessage() . "\n";
} catch (\Exception $e) {
    echo "❌ НЕОЖИДАННАЯ ОШИБКА\n";
    echo "   " . $e->getMessage() . "\n";
    echo "   Файл: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n╔════════════════════════════════════════════════════════════╗\n";
echo "║                    ТЕСТ ЗАВЕРШЕН                           ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n";

