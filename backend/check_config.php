<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Algoritma Configuration ===\n";
echo "API Key: " . config('services.algoritma.api_key') . "\n";
echo "API Secret: " . config('services.algoritma.api_secret') . "\n";
echo "Base URL: " . config('services.algoritma.base_url') . "\n";
echo "Environment: " . config('services.algoritma.environment') . "\n";

echo "\n=== Environment Variables ===\n";
echo "ALGORITMA_API_KEY: " . env('ALGORITMA_API_KEY') . "\n";
echo "ALGORITMA_API_SECRET: " . env('ALGORITMA_API_SECRET') . "\n";
echo "ALGORITMA_BASE_URL: " . env('ALGORITMA_BASE_URL') . "\n";
echo "ALGORITMA_ENVIRONMENT: " . env('ALGORITMA_ENVIRONMENT') . "\n";

