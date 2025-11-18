<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Frontend URL Configuration ===\n\n";
echo "FRONTEND_URL (env): " . env('FRONTEND_URL', 'not set') . "\n";
echo "FRONTEND_URL (config): " . config('app.frontend_url', 'not set') . "\n";
echo "APP_URL (env): " . env('APP_URL', 'not set') . "\n";
echo "APP_URL (config): " . config('app.url', 'not set') . "\n\n";

// Test URL generation
$testOrderId = 123;
$frontendUrl = config('app.frontend_url', 'http://localhost:3000');
$paymentUrl = rtrim($frontendUrl, '/') . '/payment/' . $testOrderId;

echo "Test Payment URL: $paymentUrl\n";

