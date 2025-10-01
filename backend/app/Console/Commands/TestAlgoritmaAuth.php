<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestAlgoritmaAuth extends Command
{
    protected $signature = 'algoritma:test-auth';
    protected $description = 'Test different authentication methods for Algoritma API';

    public function handle()
    {
        $this->info('Тестирование различных методов аутентификации Algoritma API...');
        $this->line('============================================================');

        $apiKey = 'Zulfi';
        $apiSecret = 'Zulfi01102025';
        $baseUrl = 'https://api.testalgoritma.az';

        // Тест 1: Basic Auth
        $this->line('1. Тестирование Basic Auth...');
        try {
            $response = Http::withBasicAuth($apiKey, $apiSecret)
                ->withHeaders(['Accept' => 'application/json'])
                ->get($baseUrl . '/ping');
            
            $this->line("   Статус: {$response->status()}");
            $this->line("   Ответ: " . $response->body());
        } catch (\Exception $e) {
            $this->line("   Ошибка: " . $e->getMessage());
        }

        // Тест 2: Bearer Token
        $this->line('2. Тестирование Bearer Token...');
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey
            ])->get($baseUrl . '/ping');
            
            $this->line("   Статус: {$response->status()}");
            $this->line("   Ответ: " . $response->body());
        } catch (\Exception $e) {
            $this->line("   Ошибка: " . $e->getMessage());
        }

        // Тест 3: API Key в заголовке
        $this->line('3. Тестирование API Key в заголовке...');
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'X-API-Key' => $apiKey,
                'X-API-Secret' => $apiSecret
            ])->get($baseUrl . '/ping');
            
            $this->line("   Статус: {$response->status()}");
            $this->line("   Ответ: " . $response->body());
        } catch (\Exception $e) {
            $this->line("   Ошибка: " . $e->getMessage());
        }

        // Тест 4: API Key в параметрах
        $this->line('4. Тестирование API Key в параметрах...');
        try {
            $response = Http::withHeaders(['Accept' => 'application/json'])
                ->get($baseUrl . '/ping', [
                    'api_key' => $apiKey,
                    'api_secret' => $apiSecret
                ]);
            
            $this->line("   Статус: {$response->status()}");
            $this->line("   Ответ: " . $response->body());
        } catch (\Exception $e) {
            $this->line("   Ошибка: " . $e->getMessage());
        }

        $this->line('============================================================');
        $this->info('Тест завершен.');
    }
}

