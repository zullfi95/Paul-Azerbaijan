<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;
use App\Models\User;

echo "=== Checking Orders ===\n";

$orders = Order::all(['id', 'status', 'payment_status', 'client_id', 'final_amount']);
echo "Total orders: " . $orders->count() . "\n";

foreach ($orders as $order) {
    echo "Order ID: {$order->id}, Status: {$order->status}, Payment Status: {$order->payment_status}, Client ID: {$order->client_id}, Amount: {$order->final_amount}\n";
}

echo "\n=== Checking Users ===\n";

$users = User::all(['id', 'name', 'user_type', 'status', 'client_category']);
echo "Total users: " . $users->count() . "\n";

foreach ($users as $user) {
    echo "User ID: {$user->id}, Name: {$user->name}, Type: {$user->user_type}, Status: {$user->status}, Category: {$user->client_category}\n";
}

echo "\n=== Checking Order 13 ===\n";

$order13 = Order::find(13);
if ($order13) {
    echo "Order 13 exists:\n";
    echo "  Status: {$order13->status}\n";
    echo "  Payment Status: {$order13->payment_status}\n";
    echo "  Client ID: {$order13->client_id}\n";
    echo "  Final Amount: {$order13->final_amount}\n";
    echo "  Can Pay: " . ($order13->isPendingPayment() ? 'Yes' : 'No') . "\n";
    
    if ($order13->client_id) {
        $client = User::find($order13->client_id);
        if ($client) {
            echo "  Client: {$client->name} (Type: {$client->user_type}, Status: {$client->status}, Category: {$client->client_category})\n";
        } else {
            echo "  Client not found!\n";
        }
    }
} else {
    echo "Order 13 not found!\n";
}

