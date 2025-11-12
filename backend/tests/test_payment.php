<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;
use App\Models\User;
use App\Http\Controllers\Api\PaymentController;
use App\Services\AlgoritmaService;
use App\Services\NotificationService;
use Illuminate\Http\Request;

echo "=== Testing Payment Creation ===\n";

// Найдем заказ 13
$order = Order::find(13);
if (!$order) {
    echo "Order 13 not found!\n";
    exit;
}

echo "Order found: ID {$order->id}, Status: {$order->status}, Payment Status: {$order->payment_status}\n";

// Найдем клиента
$client = User::find(57);
if (!$client) {
    echo "Client 57 not found!\n";
    exit;
}

echo "Client found: {$client->name}, Type: {$client->user_type}, Status: {$client->status}, Category: {$client->client_category}\n";

// Создаем мок-запрос
$request = new Request();
$request->setUserResolver(function () use ($client) {
    return $client;
});

// Создаем контроллер
$algoritmaService = new AlgoritmaService();
$notificationService = new NotificationService();
$controller = new PaymentController($algoritmaService, $notificationService);

echo "\n=== Testing PaymentController::createPayment ===\n";

try {
    $response = $controller->createPayment($request, $order);
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response content: " . $response->getContent() . "\n";
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Testing AlgoritmaService ===\n";

try {
    $orderData = [
        'amount' => '130.5',
        'currency' => 'USD',
        'merchant_order_id' => '13',
        'description' => 'Заказ #13 - Zulfi Aliyev',
        'client' => [
            'name' => 'Zulfi Aliyev',
            'email' => $client->email ?? '',
            'phone' => $client->phone ?? '',
        ],
        'location' => [
            'ip' => '127.0.0.1',
        ],
        'return_url' => 'http://localhost:3000/payment/success/13',
        'language' => 'en',
        'template' => '1',
        'mobile' => '1',
    ];
    
    $result = $algoritmaService->createOrder($orderData);
    echo "Algoritma result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
} catch (Exception $e) {
    echo "Algoritma Exception: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

