<?php

require_once 'vendor/autoload.php';

use App\Services\AlgoritmaService;

// Создаем экземпляр сервиса
$algoritmaService = new AlgoritmaService();

echo "Тестирование подключения к Algoritma API...\n";
echo "==========================================\n";

// Тестируем подключение
$result = $algoritmaService->testConnection();

echo "Результат тестирования:\n";
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

if ($result['success']) {
    echo "\n✅ Подключение к Algoritma API успешно!\n";
    echo "Сообщение: " . $result['message'] . "\n";
    if (isset($result['date'])) {
        echo "Дата: " . $result['date'] . "\n";
    }
} else {
    echo "\n❌ Ошибка подключения к Algoritma API!\n";
    echo "Ошибка: " . $result['error'] . "\n";
    if (isset($result['exception'])) {
        echo "Исключение: " . $result['exception'] . "\n";
    }
    if (isset($result['status'])) {
        echo "HTTP статус: " . $result['status'] . "\n";
    }
}

echo "\n==========================================\n";
echo "Тест завершен.\n";
